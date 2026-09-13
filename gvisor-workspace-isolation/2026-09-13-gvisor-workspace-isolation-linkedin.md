# The Bouncer, the Wall, and the Straitjacket: How Multi-Tenant Sandboxes Actually Stay Isolated

![Title graphic — dark background, headline "The Bouncer, the Wall, and the Straitjacket" next to three stacked colored blocks labeled Identity Proxy (no exposed ports), VLAN/ipvlan (local L2 segmentation), and gVisor (kernel-syscall sandbox), with a terminal snippet showing a gVisor runtime class, a VLAN tag check, and a proxy header verification](titel.svg)

*Title image: three independent gates, none of them sufficient alone — this article explains why.*

## Why you should care even if you've never touched a VLAN

If you're building anything that runs *other people's* code — a SaaS that spins up a workspace per customer, a platform that lets AI agents execute tasks, a CI system, a "try it in your browser" demo — you will eventually hit this exact question: **two strangers' containers end up on the same physical server. What actually stops one from touching the other?**

Most people reach for one answer ("we use Docker," "we use a sandbox runtime," "we have a firewall") and stop there. That's the mistake this article is about. The real answer is always **three separate, independent things stacked together** — and each one has a precise, nameable hole that only one of the other two can plug. You don't need to become a network engineer to use this correctly. You need to know which of the three you have, which you're missing, and what specifically breaks if you skip one. That's the whole article, explained in plain language first, with the technical depth available if you want it.

## The three layers, in plain English

Picture a nightclub with a bouncer, soundproof walls between private rooms, and a strict dress code that also happens to be a straitjacket. Overkill for a nightclub — exactly right for a server running strangers' code:

- **The bouncer (identity-based routing):** nobody gets in without proving who they are, and — crucially — nobody can even *see* the doors to rooms that aren't theirs. No raw ports sit open on the internet for anyone to stumble onto.
- **The soundproof walls (network segmentation, VLANs):** even once you're inside, you cannot hear, see, or reach the room next door. Your neighbor could be doing anything in there — you'd never know.
- **The straitjacket (gVisor, kernel sandboxing):** even inside your own room, you cannot pick up the phone and call the building's central systems directly. Every "call" you make is answered by an actor pretending to be the building, who quietly refuses anything dangerous.

None of these three is a substitute for either of the other two. That's not a hedge — it's the actual mechanism, and the rest of this article shows exactly why, with the level of technical precision that lets you actually build it.

## Layer 1: gVisor — what it actually does (and does not do)

gVisor is a container runtime (`runsc`) that intercepts your application's syscalls — the low-level requests a program makes to the operating system, like "open this file" or "send this network packet" — and answers them itself, in its own isolated process, instead of letting them reach the real Linux kernel underneath.

![Architecture diagram of gVisor's internals — an untrusted app process fires a syscall, which is intercepted by a Systrap stub or KVM platform before reaching the host kernel, redirected into the Sentry (a Go userspace kernel emulating 300+ Linux syscalls, with an embedded Netstack building L2/L3 packets entirely in Go), which communicates with a separate per-container Gofer process over a shared-memory ring buffer for filesystem access, with both Sentry and Gofer seccomp-bpf caged so only narrowly restricted syscalls ever reach the real privileged host kernel](gvisor_architecture.svg)

*Figure 1: The application never talks to the real host kernel. Every arrow in this diagram is the redirection that guarantees it.*

- **The Sentry** is the actual userspace kernel — a single Go process per sandbox implementing the Linux syscall surface (300+ syscalls) in memory. When your app calls `open()` or `socket()`, the Sentry answers, not the host.
- **Netstack** isn't a separate process — it's a full TCP/IP stack implemented as a Go library *inside* the Sentry, building real network packets in userspace before anything reaches the host's actual network hardware.
- **The Gofer** is a separate process, one per container, that mediates all filesystem access — a second, independent barrier described in detail below.
- **Interception happens via Systrap or KVM.** Systrap (the default, fastest path as of 2026) uses lightweight per-CPU stub processes that trap the application's syscall and hand it to the Sentry over a shared-memory queue. KVM instead turns the Sentry into a lightweight hypervisor, using `/dev/kvm` to intercept at the hardware instruction level.

**What this buys you:** even if an attacker fully compromises the application inside the sandbox, they're exploiting the *Sentry's own Go implementation* of a syscall — not a real kernel vulnerability. A Sentry escape is a real, if far rarer, engineering problem, not a routine kernel CVE.

### How gVisor's filesystem isolation actually works

This is the part most explainers skip, and it's worth getting right because "the Gofer handles files" undersells a genuinely clever design (the full detail lives in [gVisor's own filesystem docs](https://gvisor.dev/docs/user_guide/filesystem/), which are worth reading directly if you're implementing this):

- **The Gofer owns the filesystem, always.** The sandbox's own mount namespace is *empty* — the Sentry has no path to the real host filesystem at all unless the Gofer explicitly hands it something. Gofer-to-Sentry communication happens over gVisor's own protocol, **LISAFS**, which replaced the older Plan-9-derived 9P protocol for performance.
- **Directfs (the modern default) trades a little isolation for a lot of speed, carefully.** Instead of round-tripping every single file read/write through the Gofer via RPC, the Gofer *donates specific file descriptors* for the mount points it's willing to expose, and the sandbox then uses ordinary FD-based syscalls (`openat`, `fchownat`) directly on those handles. The sandbox still cannot reach any host path it wasn't explicitly handed — it can only operate inside the specific filesystem trees the Gofer chose to expose, with `O_NOFOLLOW` enforced via seccomp to stop symlink tricks.
- **A writable overlay protects the real image.** By default, the root filesystem gets a tmpfs overlay (backed by memory, or a hidden on-disk file) — all writes land in that overlay, and the underlying container image is never actually modified. This is also why containers restart clean: the overlay is thrown away, not the real image.
- **Custom Gofer extensions exist** for teams that need a non-standard backend (a network-backed store, an encrypted filesystem) — you can register your own handler for specific mount paths while everything else falls through to the stock Gofer.

**What gVisor does not touch at all — and this is the detail that trips people up:** anything about the network *outside* the sandbox. gVisor changes nothing about port allocation, port collision, or which containers can reach which other containers. Docker already gives every container — under `runc` or `runsc`, doesn't matter — its own independent network namespace and its own private port space. Ten parallel containers can all listen on port 8080 internally with zero collision, regardless of which runtime you picked. Once a packet leaves the Sentry's Netstack, it's handed to the host exactly the way any other container's packet would be. If that network is an unsegmented bridge shared by every tenant on the box, gVisor will not stop one sandboxed container from scanning its neighbors on that same bridge. That's a different layer's job entirely.

## Layer 2: local network segmentation (VLANs)

The mechanism here is boring in the best way: 802.1Q VLAN tagging, the same technology enterprise networks have used for decades, applied at the container level.

The concrete recipe: create a VLAN sub-interface on the host's NIC per tenant (`ip link add link eth0 name eth0.102 type vlan id 102`), bring it up, then attach a Docker network to it using the `macvlan` or `ipvlan` driver (**not** the default `bridge` driver, which isn't VLAN-aware at all). This is genuinely zero-downtime — creating `eth0.102` doesn't touch `eth0` itself and doesn't disturb any already-running container on a different VLAN.

Two practical details worth knowing if you're actually building this: **macvlan** gives each container its own MAC address, which is clean conceptually but can trip enterprise switch port-security features or exhaust switch MAC tables at real scale. **ipvlan in L2 mode** is the fix — every container shares the host NIC's one MAC address, isolation is enforced purely by VLAN tag, and the MAC-table problem disappears entirely. And as a free security bonus: macvlan/ipvlan sub-interfaces cannot, by kernel design, talk back to their own parent interface — so if your host's management traffic runs on the untagged interface, tenant containers can never accidentally reach the host through it.

**What this buys you:** genuine Layer-2 isolation, enforced in the kernel's frame-forwarding path — before any firewall rule is even consulted. **What it does not touch:** the host kernel itself. If an attacker finds a real kernel exploit and breaks out of an unsandboxed container entirely, they now have root on the physical host — and one `ip link` command undoes every VLAN you configured. VLANs protect tenants *from each other*; they do nothing to protect the *host* from a compromised tenant.

## Layer 3: identity-based proxy routing (and why "random port per user" is wrong)

This is the layer most teams get wrong first, because the intuitive move — give each user's workspace its own host port, `32145` mapped to their app's internal `3000` — is exactly the model modern platforms (Codespaces, Gitpod, Coder) deliberately abandoned. The reasons are concrete: a raw exposed port is reachable by anyone who finds it before any auth check happens; an app hardcoded to expect `:3000` breaks the moment its real port becomes something random (OAuth redirect URLs, for one); corporate firewalls block anything outside 80/443; and a host only has ~64k ports total, which real scale actually exhausts.

The model that replaced it: the application keeps running on its natural port, *inside* its own container, untouched — and one shared reverse proxy routes by **identity**, not by port. The URL encodes both the target port and the workspace (e.g. `3000-ws-abc123x.platform.example`); the proxy validates the requester's session/JWT, looks up an in-memory table (`workspace_id → {ownerID, backendIP}`), and only forwards if the requester's identity matches the workspace's owner.

![Diagram of one request passing through three independent gates in sequence — first the Identity Proxy (the bouncer), which terminates TLS, verifies the session/JWT, and never exposes a raw port, but cannot see what a legitimate authenticated user does once inside their own workspace; then the VLAN/ipvlan layer (the soundproof wall), which makes cross-tenant packets physically unroutable but cannot stop a host kernel escape; then gVisor (the straitjacket), which stops application syscalls from ever reaching the real host kernel but cannot stop a sandboxed app from scanning an unsegmented local network — with a closing note that each layer's blind spot is exactly the next layer's job](three_layers.svg)

*Figure 2: The same request, three independent checks — and the specific thing each one is blind to.*

**What this does not touch:** anything that happens *after* a legitimate, already-authenticated request reaches its destination. A user completely authorized to be in their own workspace, running code that then tries to reach a neighboring tenant, is invisible to this layer entirely — that's Layer 2's job.

## The fourth thing nobody puts in the diagram: egress

Three layers stop someone getting *in*. None of them stop your own, fully legitimate workspace from *sending data out* to somewhere it shouldn't. A gVisor-sandboxed, VLAN-isolated, identity-routed workspace can still be told by malicious code to quietly upload your customer's database to an attacker's server — over a completely ordinary, permitted-looking HTTPS connection. This is exactly the gap an **egress allowlist** closes: a default-deny outbound firewall rule, scoped per workspace, that only permits connections to domains/IPs the workload actually needs (package registries, the specific APIs it's supposed to call) — everything else gets dropped and logged. It's the natural fourth item in this list, not a separate topic: identity-routing gates who comes *in*, VLANs gate what a tenant can reach *locally*, gVisor gates what a compromised process can do to the *kernel*, and egress-allowlisting gates what a workload — compromised or not — can send *out*.

## A worked example: multi-agent AI systems, sandboxed for real

This isn't theoretical. gVisor's own team published a concrete demonstration in April 2026 — the ["MAGI" post](https://gvisor.dev/blog/2026/04/15/magi-multi-agent-gvisor-isolation/) — running three different AI agent frameworks (**OpenClaw**, **PicoClaw**, and **Hermes Agent**) simultaneously, each in its own gVisor sandbox, all doing local inference through **Ollama** (also sandboxed), communicating with each other over a self-hosted **Matrix.org** server (also sandboxed), with one agent driving a full browser instance — **Camoufox**, an anti-fingerprinting Firefox fork built for automated/agentic browsing — likewise isolated in its own sandbox.

The practical takeaway isn't "build three chatbots that talk to each other" (the post itself is upfront that this exact setup is more demonstration than production need). It's that **every distinct component an agentic system touches is independently sandboxable**: the LLM inference server, the browser the agent drives, the messaging layer agents use to coordinate, and each agent's own execution environment — none of it has to share a blast radius with any of the others. If you're building a platform where AI agents execute real actions (write code, browse the web, call APIs), this is the concrete shape of "take it seriously": every distinct capability gets its own sandbox, not one big shared container with everything installed.

## Putting it together with a SIEM: three silent gates become one visible story

Each of the three (four, with egress) layers isn't just a defense — it's also a log source, and combining them is what turns "nothing happened" into "here's exactly what almost happened." A proxy denial, a VLAN-tagged packet trying to cross into another tenant's segment, and an anomalous syscall inside the same sandbox are three unremarkable-looking events in isolation. Correlated by the same workspace/owner identity within a few seconds of each other, they're one incident.

![Diagram showing each isolation layer as a log source feeding a SIEM correlation engine — the Identity Proxy contributes gateway-style audit logs of denied auth attempts, the VLAN/ipvlan layer contributes network-IDS findings (e.g. from Suricata watching each VLAN) when a packet tries to cross tenant boundaries, and the gVisor sandbox contributes runtime-security findings from an eBPF sensor like Falco watching syscalls — all three correlating by workspace/owner identity into one risk-ranked incident](siem_integration.svg)

*Figure 3: The same three layers, now doubling as a detection surface — this is standard SIEM correlation, not a new concept, just applied to isolation infrastructure specifically. (See our companion piece on SIEM fundamentals for the full detection-pipeline picture — collection, normalization, correlation, response.)*

Concretely: an eBPF-based runtime sensor like **Falco** watches the sandbox's syscalls directly (no sidecar needed) and flags anomalies — a shell spawned where one shouldn't be, a known miner binary executing. A network IDS like **Suricata** watching each VLAN segment flags a packet that shouldn't exist at all — one tenant's traffic trying to cross into another's. The proxy's own access log is a ready-made audit trail of who reached what, and when they were denied. None of this requires new infrastructure — it requires making sure your existing SIEM pipeline treats these as first-class sources, attributed to the same workspace ID across all three.

## The pattern is not novel — three production examples

![Table comparing three real platforms across the three layers — Kubernetes Agent Sandbox (CNCF SIG, 2026) uses gVisor via runtimeClassName, host-level L2/L3 segmentation, and a Sandbox Router with X-Sandbox-ID header routing; Gitpod/Ona uses gVisor by default, Cilium eBPF network policies with dedicated tunnels, and Envoy ingress with subdomain and session-cookie routing; Fly.io uses Firecracker microVMs, a proprietary L2 network called 6PN, and a Rust-based fly-proxy doing TLS termination and identity-based routing straight into the VM](prior_art.svg)

*Figure 4: The same three-layer shape, independently arrived at by three different production platforms.*

The [Kubernetes Agent Sandbox project](https://kubernetes.io/blog/2026/03/20/running-agents-on-kubernetes-with-agent-sandbox/) (a CNCF SIG effort, published 2026) is the cleanest reference case, because it was designed explicitly for this article's exact problem: running untrusted AI agents and LLM-generated code safely on shared infrastructure. Its documented architecture is this same cascade almost verbatim — `runtimeClassName: gvisor` for kernel isolation, mandatory host-level network segmentation beneath the pods, and a purpose-built "Sandbox Router" authenticating by identity header before forwarding anything.

[Gitpod](https://github.com/gitpod-io/gitpod) (now rebranded Ona) runs the same three layers at genuinely large scale: gVisor by default for every workspace, Cilium's eBPF-based network policies enforcing that tenants on the same host cannot even ping each other, and an Envoy-based ingress authenticating the session cookie before tunneling to the sandboxed container's internal interface. (Gitpod's repository is AGPL-3.0-licensed — referenced here as prior art, not as something to vendor code from.)

[Fly.io](https://fly.io/docs/reference/architecture/) is the interesting outlier — Firecracker microVMs (hardware virtualization, a different mechanism from gVisor's syscall interception, solving the identical problem) paired with a proprietary local network layer they call "6PN," and `fly-proxy`, a Rust-based edge proxy doing exactly the TLS-termination-then-identity-routing job described above.

Three unrelated engineering teams, solving the same problem, converged on the same three-layer shape. That's a reasonably strong signal it's the actual correct architecture, not one team's particular taste.

## A worked example: what this looks like in a real gateway, honestly

Talk is easier than shipping, so here's what this actually looks like in a real system we operate — including the parts that aren't built yet.

![Diagram of an AI-agent gateway shown two ways — today, a real and shipped setup where a browser or coding agent talks to a gateway backend that does auth and budget checks, then reaches a remote SSH target over an SSH tunnel with no published port, direct-dialing into a gVisor-sandboxed agent container with an active egress allowlist, honestly noting the current gap that there's no VLAN segmentation yet between two workspaces on the same remote server; and target, a planned identity-router sitting in front of two VLAN-segmented, gVisor-sandboxed workspaces on the same host with no route between their VLANs; below both, a further-out vision of one central control plane reachable over a WireGuard mesh provisioning this same three-layer stack on either the customer's own hardware or an AWS/GCP node, so a customer picks where a workload runs without changing how they reach it](example_deployment.svg)

*Figure 5: Today's shipped path (left) is honestly one host at a time — the VLAN layer isn't built yet. The target (right) and the eventual multi-cloud mesh (bottom) are the direction, not a claim about what exists now.*

**What's real today:** a request reaches our gateway backend, which checks identity and budget, then opens an SSH tunnel to whichever remote server the workspace lives on and direct-dials straight into the container's internal IP — no port is ever published on that host. The container itself runs under gVisor with an active egress allowlist. This is genuinely the "bouncer + straitjacket + egress-control" part of the stack, shipped and working.

**What's honestly still missing:** local VLAN segmentation between two workspaces sharing the *same* remote server (Layer 2) isn't built yet — today, isolation between co-located workspaces relies on gVisor and container networking alone, which is exactly the gap this article spent several paragraphs explaining isn't sufficient on its own. That's a real, acknowledged limitation, not a rounding error, and it's the next concrete piece of work.

**Where it's headed:** the same three-plus-one layers, generalized into an identity-router that can place a workload on the customer's own hardware or a cloud region interchangeably — the Gitpod/Ona pattern, applied across multiple physical locations instead of one provider's own datacenter. A control plane reachable over a WireGuard-style mesh (rather than public SSH) provisions the same stack wherever the workload actually needs to run, so a customer's choice of *where* never changes *how* securely they're isolated.

## The honest failure mode of having only one or two layers

It's worth being blunt, because "defense in depth" gets used loosely enough to stop meaning anything. Here is exactly how you get owned with each layer missing:

1. **Only the proxy, no VLAN, no gVisor:** authentication is flawless. A legitimate, correctly-authenticated user starts a session in their own workspace, then scans the flat, unsegmented Docker bridge every tenant shares, finds a neighboring tenant's unprotected database, and reads it directly. The proxy never sees any of this — it isn't in the path.
2. **Only VLANs, no gVisor:** network segmentation is perfect. A tenant's script hits a real kernel zero-day and escapes their container entirely, landing as root on the bare host. One `ip link` command and every VLAN you configured stops existing.
3. **Only gVisor, no VLAN:** kernel isolation is excellent, but gVisor still hands ordinary network frames to whatever Docker network it's attached to. If that's a shared, unsegmented bridge, the sandboxed container can freely reach every other tenant on it.
4. **All three, no egress control:** a fully-isolated, fully-authenticated, kernel-sandboxed workspace still has an outbound internet connection it's supposed to have — and nothing stops malicious code inside it from using that legitimate connection to exfiltrate data.

Each layer's blind spot is precisely the next layer's job. That's the whole argument for running all four together, and it's also the honest limit of each one individually.

## Takeaways

1. **gVisor is not a networking technology.** Its entire job is kernel-syscall isolation. Conflating "kernel sandbox" with "network isolation" is the single most common mistake in this space.
2. **gVisor's filesystem model is a second, independent barrier** — the Gofer, not the Sentry, owns the real filesystem, and even the performance-optimized Directfs path only ever exposes specific pre-approved mount points, never arbitrary host paths.
3. **"Random host port per workspace" is an outdated model.** Every platform operating at real scale has moved to identity-based proxy routing, where the port is an internal implementation detail nobody outside the platform needs to know.
4. **Egress control is the fourth layer everyone forgets.** Three layers of "keep attackers out" say nothing about "keep your own legitimate workload's data in."
5. **Every distinct component of an agentic AI system is independently sandboxable** — the inference server, the browser, the messaging layer, each agent — and treating them as one shared blast radius is the mistake, not the sandboxing itself.
6. **Each of the four layers has a precise, nameable blind spot**, and it's always exactly what one of the others covers. That's not a coincidence — it's the actual shape of the problem, and it's fine to build it incrementally as long as you're honest about which pieces are missing while you do.

*We're building exactly this model into our own platform's workspace architecture — this piece deliberately shows the shipped parts and the honest gaps side by side. The identity-routing layer specifically extends patterns we've already written about for LLM gateway security ("Stopping Prompt Injection at the Kernel Level"). Happy to go deeper on any of the four layers in the comments.*

---

## Sources (verified as of Sep 13, 2026)

- **gVisor architecture:** [Networking guide](https://gvisor.dev/docs/user_guide/networking/) · [Architecture guide](https://gvisor.dev/docs/architecture_guide/networking/) · [Filesystem guide](https://gvisor.dev/docs/user_guide/filesystem/) · [Networking security blog](https://gvisor.dev/blog/2020/04/02/gvisor-networking-security/) · [Directfs blog post](https://gvisor.dev/blog/2023/06/27/directfs/)
- **MAGI — Multi-Agent gVisor Isolation (2026):** https://gvisor.dev/blog/2026/04/15/magi-multi-agent-gvisor-isolation/ — [OpenClaw](https://openclaw.ai/) · [PicoClaw](https://github.com/sipeed/picoclaw) · [Hermes Agent](https://hermes-agent.nousresearch.com/) · [Ollama](https://ollama.com/) · [Matrix.org](https://matrix.org/)
- **Kubernetes Agent Sandbox (CNCF SIG):** [Announcement blog](https://kubernetes.io/blog/2026/03/20/running-agents-on-kubernetes-with-agent-sandbox/) · [GitHub](https://github.com/kubernetes-sigs/agent-sandbox) · [gVisor isolation use-case docs](https://agent-sandbox.sigs.k8s.io/docs/use-cases/gvisor-isolation/)
- **Gitpod / Ona:** [Architecture reference](https://ona.com/docs/classic/admin/reference/architecture) · [Networking docs](https://ona.com/docs/classic/admin/getting-started/networking) · [GitHub (AGPL-3.0 — referenced as prior art, not vendored)](https://github.com/gitpod-io/gitpod)
- **Fly.io:** [Architecture reference](https://fly.io/docs/reference/architecture/) · [Firecracker vs. gVisor](https://fly.io/learn/firecracker-vs-gvisor/)
- **Docker VLAN networking (macvlan/ipvlan):** [macvlan driver docs](https://docs.docker.com/engine/network/drivers/macvlan/) · [ipvlan driver docs](https://docs.docker.com/engine/network/drivers/ipvlan/)
- **eBPF/K-LAF (referenced, not re-explained):** "Stopping Prompt Injection at the Kernel Level" — `docs/articles/ebpf/2026-09-07-ebpf-llm-guards-linkedin.md`
- **SIEM fundamentals (referenced, not re-explained):** "You Have Logs. You Don't Have a SIEM." — `docs/articles/siem-smb-guide/`
