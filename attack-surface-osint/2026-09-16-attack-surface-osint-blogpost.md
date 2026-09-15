# How Hackers Find Your Infra Weakpoints, Leaks and Unprotected AI Deployments

*Part 1 of 2. This article catalogs the public tools that index the internet's misconfigurations — what they find, and how the queries are actually built. [Part 2](../hardening-the-recon-surface/2026-09-16-hardening-the-recon-surface-blogpost.md) closes every gap this article opens, section by section.*

Your infrastructure is indexed before you finish deploying it. Not by an attacker manually probing your IP range — by a handful of search engines that continuously scan the entire IPv4 (and increasingly IPv6) address space, grab every banner they can, and make the result searchable in under a second. If you haven't looked at what they see, you don't actually know your attack surface — you know what you *think* you deployed.

## How the Scanning Actually Works

Three steps, repeated at internet scale, permanently:

1. **Mass port scanning.** Masscan and ZMap sweep entire IP ranges for open ports. Masscan is the extreme case — a stateless scanner fast enough to sweep the full IPv4 space in under six minutes given enough bandwidth. Nmap is the precision instrument (service/version detection, scripting); ProjectDiscovery's Naabu is the modern Go-based middle ground for scanning long domain/IP lists inside a pipeline.
2. **Banner grabbing.** Once a port answers, the scanner sends a minimal request and records the raw response: HTTP headers, TLS certificate details, SSH version strings, database handshake responses. This is where software versions, hostnames, and often far more than intended leak out.
3. **Indexing and fingerprinting.** The banners get parsed into structured fields — product, version, ASN, geolocation, TLS certificate chain — and dropped into a searchable database. This is the entire business model of Shodan, Censys, and their competitors.

None of this requires exploiting anything. It's all standard protocol behavior; the search engines just automate what you could do yourself with `curl` and a lot of patience.

## The General-Purpose Cyberspace Search Engines

**Shodan** is the original and still the reference point — strong for IoT, industrial control systems, and anything with a distinctive banner. One practical gotcha every one of the example queries in this article runs into: Shodan's web search **requires at least a free account to use any filter at all** — `port:`, `product:`, `asn:`, all of it. Paste a filtered query into the search box while logged out and it silently returns nothing, which looks exactly like "the query is wrong" but isn't. A free account unlocks filtered search with a limited monthly result quota; a handful of specific filters (`vuln:` among them) need paid membership credits on top of that. **Censys** overlaps heavily but is the stronger tool specifically for certificate-based infrastructure mapping: give it a company's TLS certificate pattern and it finds every server sharing it, regardless of IP range.

**FOFA**, **ZoomEye** (Knownsec 404 Team), and **Quake** (360/Qihoo) are the Chinese equivalents, and in practice they aren't inferior alternatives — FOFA has one of the largest fingerprint databases for pivoting across favicon hashes and application signatures, and Quake has unusually clean built-in CVE tagging. **Hunter.how** (Qianxin) is the newer, fast-growing entrant, optimized for web-component and API identification. **Criminal IP** and **Onyphe** round out the field with a stronger threat-intelligence angle — Criminal IP scores IPs by risk, Onyphe layers active CVE/misconfiguration checks on top of the raw scan data. **Netlas.io** is worth naming separately: a newer European entrant that puts wildcard/fuzzy search behind its free tier where FOFA charges for it, and it's a solid choice for sweeping a specific hoster's IP range.

## Cloud Storage, Databases, and Live Web Content

Three purpose-built tools cover what the general scanners only see the surface of:

- **Grayhat Warfare** indexes publicly listable AWS S3 buckets, Azure Blobs, and Google Cloud Storage — filterable by file extension, so `.env`, `.sql`, `.bak`, `id_rsa` show up directly.
- **LeakIX** actively checks whether an open port is *actually leaking* something, not just open — it lists unauthenticated Elasticsearch, MongoDB and Redis instances, and specifically crawls for exposed `.git` directories on live web servers (filter: `plugin:Git`), which it can read and index the contents of.
- **PublicWWW** doesn't scan banners at all — it indexes page *source code* (HTML/CSS/JS) across millions of live sites, which is how developers accidentally shipping a real API key in frontend JavaScript get found. **Grep.app** does the equivalent for code, at speed: full-text regex search across roughly half a million of the most active public GitHub repositories, no account required.

## Filtering by Hosting Provider (ASN)

Every hosting provider owns a fixed, publicly known block of IP space tied to an Autonomous System Number. Hetzner Online runs under **AS24940** — searchable directly in any of the above platforms:

```
Shodan:  asn:AS24940 "MongoDB" port:27017
FOFA:    asn="24940" && port="9200"
```

The first finds unauthenticated MongoDB instances inside Hetzner's network; the second finds open Elasticsearch. The same technique works for GCP (filter on the `*.storage.googleapis.com` certificate pattern to find Cloud Storage buckets bound to custom domains) and for smaller shared-hosting providers like Hostinger, where the useful signal is usually the nameserver pattern rather than an ASN, since shared hosts spread customers across huge, noisy IP ranges.

## Searching Directly for a CVE

When a critical CVE drops, the fastest way to gauge real-world exposure isn't to scan yourself — it's to ask a search engine what it already indexed:

```
Shodan:  vuln:CVE-2021-44228
Censys:  services.vulnerabilities.cve: "CVE-2024-21626"
Quake:   vuln: "CVE-2023-38606"
```

Two caveats worth being precise about: Shodan's `vuln:` filter and Censys's equivalent CVE view both sit behind a paid membership tier, not the free search. And both platforms are explicit that this is version-banner *inference*, not proof the target is actually exploitable — a patched backport can still show an old version string.

When a CVE has no direct tag, fall back to **vulnerability dorking**: search for the exact vulnerable software version instead. `product:"Apache httpd" version:"2.4.49"` on Shodan, or `app="Apache" && version="2.4.49"` on FOFA, finds every instance of the version affected by CVE-2021-41773 regardless of CVE tagging. When a server hides or spoofs its version banner, **JARM fingerprinting** — a TLS-handshake fingerprinting technique released by Salesforce's John Althouse, Andrew Smart, RJ Nunnally and Mike Brady in 2020 (the same team behind JA3) — still identifies the underlying software/OS combination by how it negotiates TLS, and most of these search engines let you query by JARM hash directly.

## The AI Stack Has Its Own Fingerprints

AI developer tools have a very consistent set of default ports and banners, which makes them unusually easy to enumerate with the exact same technique.

**Ollama** listens on **11434** and answers a plain request with the literal string `"Ollama is running"`. FOFA finds it without a paid tier via its real application fingerprint: `app="Ollama" && is_domain=false`. On Shodan, the free-text keyword search (no `port:` filter, since that needs the free account per above) is `Ollama is running` — logged in, the precise version is `product:"Ollama"`, which Shodan ships as a real, dedicated fingerprint rather than a raw body match. **vLLM**'s OpenAI-compatible server defaults to **8000**, exposing `/v1/models` and `/v1/chat/completions`. **Qdrant** exposes its HTTP API on **6333** and gRPC on **6334**, identifiable by a JSON banner containing `"qdrant - vector search engine"`; **Milvus** uses gRPC on **19530**; **ChromaDB** defaults to **8000** and returns version metadata (`nanoseconds_since_epoch`) on an unauthenticated root request. **Gradio** (the default UI for most Hugging Face demos and Stable Diffusion frontends) runs on **7860**; **Streamlit** dashboards on **8501**. **Jupyter Notebook/Lab** sits on **8888**.

The fingerprint pattern is the same across all of them: an HTTP `200 OK` with real application data instead of a `401`/`403` in front of it, and no login form anywhere in the response body — no `<form id="login">`, no `WWW-Authenticate` header, just the application talking directly to whoever asked.

An exposed instance in this category is rarely "just" a data leak: an open Qdrant or Milvus hands over your actual embedded knowledge base in re-searchable form; an open Ollama or vLLM is free inference on your GPU bill; an exposed Jupyter with its token disabled is arbitrary code execution on the host, not just a data problem.

## The Same Pattern Hits AI Coding Agents Directly

This isn't hypothetical for the tools writing the code either. **Claude Code**'s IDE-extension companion process binds a WebSocket on `127.0.0.1` at a dynamic port (recorded in a lock file under `~/.claude/ide/`) so the CLI and the editor extension can talk to each other. **CVE-2025-52882** (CVSS 8.8, confirmed via NVD) is exactly the failure mode this article keeps returning to: the WebSocket had no authentication, so any webpage a developer had open in the browser could connect to it and issue MCP commands — reading files, executing code in a connected Jupyter kernel — bypassing the same-origin policy entirely. Patched in VSCode-extension 1.0.24 and JetBrains 0.1.9 by requiring a token from the lock file on every connection. The lesson isn't "Claude Code was insecure" — it's that *any* local companion server for a coding agent is a live target the instant something else on the machine (a malicious or compromised webpage, in this case) can reach it, authenticated or not by default.

**OpenCode** (the open-source coding agent) ships the same shape of risk with the opposite default: `opencode web` binds `127.0.0.1` and a random port out of the box — safe until someone sets `--hostname 0.0.0.0` or the equivalent `opencode.json` config to reach it from another machine, at which point it's an unauthenticated coding-agent control surface on the network. **DeepSeek's Harness (`dsh`)**, currently in developer preview, follows the identical pattern one level more explicitly: `npx @deepseek-ai/dsh web` starts its UI at a fixed `127.0.0.1:3080` with no authentication mentioned in its own quick-start docs — fine as long as nothing rebinds that port outward, exactly the Ollama failure mode again.

**OpenHands** (the autonomous coding-agent platform, formerly OpenDevin) is the sharpest version of this pattern because its own documented quick-start ships the risk by default rather than requiring a misconfiguration to reach it: the official Docker run command binds the web GUI to port **3000** using Docker's `-p 3000:3000` syntax, which publishes to all host interfaces unless a host IP is explicitly pinned — no separate flag needed to expose it. The setup flow only asks for an LLM provider API key (Anthropic/OpenAI/Gemini), which secures inference billing, not access to the instance itself; anyone who reaches port 3000 gets the full interface. This isn't just a data-exposure risk — OpenHands executes agent actions inside a Docker-based sandbox, and **CVE-2026-33718** (CVSS 9.9, confirmed via NVD) was a command-injection bug in its git-diff handler reachable via `/api/conversations/{id}/git/diff` that executed directly inside that sandbox, fixed in 1.5.0. A second, lower-severity command-injection bug, **CVE-2026-19022** (CVSS 6.3), was fixed in 1.7.0. No dedicated Shodan or FOFA fingerprint tag exists for OpenHands yet; `port:3000 "OpenHands"` is the reasonable starting query, though its precision is unverified since the project's own frontend markup wasn't pinned down at time of writing — treat it as a starting point to refine, not a guaranteed hit.

The general rule, restated once more because it's the single most repeated root cause in this whole article: a CLI tool that takes no `-p` flag is not automatically network-invisible. If anything in its process tree — an IDE companion, a web UI mode, a webhook receiver — opens a listener, that listener is reachable the moment it's bound to `0.0.0.0` instead of `127.0.0.1`, regardless of how the main tool is normally invoked.

## OpenClaw: A Full-Scale Case Study in the Same Failure Mode

If the pattern above sounds abstract, **OpenClaw** — a real, MIT-licensed, self-hosted personal-AI-agent gateway stewarded by the OpenClaw Foundation — is the concrete, large-scale version of it, with a public CVE trail to match. Its gateway historically trusted any connection from `127.0.0.1` without a token, the same localhost-privilege shortcut every tool in this article uses for local convenience. Put OpenClaw behind a reverse proxy that doesn't forward the real client IP, and the gateway sees the proxy's own loopback address as the source — every request from the actual internet now looks locally-trusted, and the token requirement evaporates. Researcher @fmdz387's January 2026 Shodan sweep found instances exposed exactly this way, in numbers various scans since have put anywhere from the low tens of thousands to over 100,000, depending on the scan date.

Three confirmed CVEs (verified directly against NVD) show how this compounds: **CVE-2026-25253** (CVSS 8.8) let a single malicious link steal a session's gateway token via an unvalidated `gatewayUrl` parameter and an unauthenticated WebSocket, fixed in 2026.1.29. **CVE-2026-32922** (CVSS 9.9) was a privilege-escalation bug in the gateway's own token-rotation call, letting a caller mint a broader-scoped token than it should have had. **CVE-2026-44112** (CVSS 9.6) was a TOCTOU race in OpenClaw's sandbox module — a symlink swap timed against a file check redirected a sandboxed write straight onto the host filesystem. Separately, and not a CVE but a supply-chain incident (the "ClawHavoc" campaign, disclosed by Koi Security): several hundred malicious skills were published to OpenClaw's plugin marketplace, ClawHub, delivering the Atomic macOS Stealer to anyone who installed them — a reminder that a plugin ecosystem is an attack surface independent of the core platform's own security.

Finding an exposed instance doesn't need a dedicated fingerprint — OpenClaw has no distinct Shodan product tag, but its gateway has a consistent default port and response shape:

```
Shodan:  port:18789 "Clawdbot" 200
Shodan:  port:18789 content-type:"application/json" "tools"
```

Every mitigation OpenClaw's own team now recommends is a restatement of this article's recurring fixes: bind strictly to loopback, forward real client IPs correctly if a proxy sits in front, require the token even on localhost, and run the agent's own tool-execution surface inside an isolated sandbox rather than trusting the token check alone to hold.

## Finding Leaked Secrets: Dorking and Beyond

Public code hosting leaks credentials constantly, and there's a distinct tooling stack for finding it — separate from the port/banner scanners above, because Google's crawler doesn't index code deeply or quickly enough to be useful here.

**Manual dorking** still works, on two fronts. Against Google itself: `site:github.com "DB_PASSWORD" ext:env`, `site:github.com "BEGIN RSA PRIVATE KEY" ext:key`. Against GitHub's own (far more powerful, regex-aware) code search directly: `language:python "aws_secret_access_key"`, `path:.env "OPENAI_API_KEY"`, `language:javascript "sk-ant"` for Anthropic keys, `filename:config.json "mongodb+srv://"` for exposed database connection strings.

**Automated, continuous scanning** is what actually matters at scale, because manual dorking can't compete with how fast secrets get pushed and how fast they need to be caught:

- **TruffleHog** and **Gitleaks** scan a repository's entire commit history — including deleted commits — for high-entropy strings and known key patterns. Gitleaks is fast enough to run as a CI gate that blocks a push outright if it matches.
- **GitGuardian** operates at a different scale entirely: it watches the live public commit stream across GitHub, GitLab and Bitbucket in real time, pulling from the platform's event API rather than crawling — the reason it catches a leaked key within seconds of the push, long before Google would ever index the repository.
- **Intelligence X (IntelX)** takes the historical-archive angle: it indexes Pastebin-style paste sites, public Git dumps, and Tor-network content, searchable by selector (email, IP, or a token pattern like `sk-ant` or `AIza`).

**GitHub's own Secret Scanning** (free, on by default for public repos) is worth naming specifically: when it recognizes a key format from a partner provider (AWS, OpenAI, and dozens of others), it notifies the provider directly, and the key is often revoked automatically within seconds — no human in the loop required.

## Sources

- Shodan — https://www.shodan.io
- Censys Search — https://search.censys.io
- FOFA — https://fofa.info
- ZoomEye — https://www.zoomeye.org
- Quake — https://quake.360.net
- Hunter.how — https://hunter.how
- Netlas.io — https://netlas.io
- Grayhat Warfare — https://buckets.grayhatwarfare.com
- LeakIX — https://leakix.net
- PublicWWW — https://publicwww.com
- Grep.app — https://grep.app
- Intelligence X — https://intelx.io
- Masscan — https://github.com/robertdavidgraham/masscan
- ProjectDiscovery Naabu — https://github.com/projectdiscovery/naabu
- TruffleHog — https://github.com/trufflesecurity/trufflehog
- Gitleaks — https://github.com/gitleaks/gitleaks
- GitGuardian public monitoring — https://www.gitguardian.com/monitor-public-github-for-secrets
- GitHub Secret Scanning — https://docs.github.com/en/code-security/secret-scanning
- JARM (Salesforce Engineering) — https://engineering.salesforce.com/easily-identify-malicious-servers-on-the-internet-with-jarm-e095edac525a/
- Shodan vulnerability search — https://help.shodan.io/mastery/vulnerability-assessment
- Censys CVE context — https://docs.censys.com/docs/ls-cve-context
- Hetzner Online ASN (AS24940) — https://ipinfo.io/AS24940
- Ollama — https://ollama.com
- vLLM — https://github.com/vllm-project/vllm
- Qdrant — https://qdrant.tech
- Milvus — https://milvus.io
- ChromaDB — https://www.trychroma.com
- Gradio — https://www.gradio.app
- Streamlit — https://streamlit.io
- Jupyter server security docs — https://jupyter-server.readthedocs.io/en/latest/operators/security.html
- Shodan search query fundamentals — https://help.shodan.io/the-basics/search-query-fundamentals
- Ollama exposed-instance research — https://thehackernews.com/2026/01/researchers-find-175000-publicly.html
- CVE-2025-52882 (NVD) — https://nvd.nist.gov/vuln/detail/CVE-2025-52882
- Claude Code CVE-2025-52882 writeup — https://securitylabs.datadoghq.com/articles/claude-mcp-cve-2025-52882/
- OpenCode web docs — https://opencode.ai/docs/web/
- DeepSeek Harness — https://deepseek.com/harness/en/
- OpenClaw — https://openclaw.ai/
- CVE-2026-25253 (NVD) — https://nvd.nist.gov/vuln/detail/CVE-2026-25253
- CVE-2026-32922 (NVD) — https://nvd.nist.gov/vuln/detail/CVE-2026-32922
- CVE-2026-44112 (NVD) — https://nvd.nist.gov/vuln/detail/CVE-2026-44112
- ClawHavoc disclosure (Koi Security) — https://www.koi.ai/blog
- OpenHands — https://github.com/All-Hands-AI/OpenHands
- OpenHands local setup docs — https://docs.openhands.dev/usage/local-setup
- CVE-2026-33718 (NVD) — https://nvd.nist.gov/vuln/detail/CVE-2026-33718
- CVE-2026-19022 (NVD) — https://nvd.nist.gov/vuln/detail/CVE-2026-19022
