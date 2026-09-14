# Closing the Gaps: How to Defend Against Every Technique in Part 1

*Part 2 of 2. [Part 1](../attack-surface-osint/2026-09-16-attack-surface-osint-blogpost.md), "How Hackers Find Your Infra Weakpoints, Leaks and Unprotected AI Deployments," cataloged the public tools that index the internet's misconfigurations. This half mirrors it section by section — the same queries, run against your own infrastructure, and what to actually change when they return a hit.*

The queries in Part 1 work in both directions. Nothing below requires new tooling beyond what any team already has access to — the point is to run the attacker's own checklist against yourself, on a schedule, instead of finding out from someone else's disclosure.

## Know Your Own Footprint First

You cannot harden what you haven't inventoried. Before touching a firewall rule, run your own ASN and domain set through Shodan, Censys and FOFA the same way Part 1 describes — that result *is* your current external attack surface, not an approximation of it. Do this on a recurring schedule, not once: infrastructure drifts, and a port that was closed at last quarter's audit is not guaranteed closed now.

## Cloud Storage and Databases: Audit the Config, Not the Perimeter

An S3 bucket or Elasticsearch instance showing up on Grayhat Warfare or LeakIX means the access-control layer failed, not that a firewall was missing — these are internet-facing-by-design services, so the fix is entirely in configuration:

- Run **Prowler** or **Scout Suite** against your AWS/GCP/Azure account on a schedule — both check live configuration against CIS benchmarks via the cloud provider's own API, the automated version of "is my bucket public" instead of waiting to find out from a scanner.
- For anything that must stay a database and not an object store — Elasticsearch, MongoDB, Redis — the fix is authentication *plus* network placement, not authentication alone. Never trust "it's not meant to be exposed" as a control: these systems shipped with no-auth-by-default for years specifically because they were designed for trusted internal networks, and that assumption breaks the instant a cloud template opens the port outward.

## ASN and Hosting-Provider Exposure: Default-Deny, Not Default-Allow

If `asn:AS<yours> port:27017` returns anything in Shodan, the finding isn't "we have a misconfigured MongoDB" — it's "our default security-group posture is allow-and-hope." Fix the posture, not the instance:

- Security groups / `ufw` rules should **deny inbound by default** and open specific ports by explicit rule, never the reverse. An accidentally-open database port should be a non-event because nothing reaches it regardless of what the application does.
- Re-run the ASN-scoped queries from Part 1 against your own range after any infrastructure change — a load balancer reconfiguration or a new subnet is exactly the kind of change that silently widens exposure.

## CVE Exposure: Patch Cadence Beats Reactive Scanning

Waiting to discover a CVE match on Shodan is the failure mode, not the detection method:

- Run **Nuclei** against your own hosts on a schedule — community CVE templates typically land within hours of public disclosure, which means you can confirm exposure before an opportunistic scanner does.
- Don't rely on version banners as your own ground truth either: if JARM fingerprinting can identify your software stack through a spoofed or hidden version string, so can an attacker's automated tooling. Patch on CVE severity and your own inventory, not on what your banner claims to be running.

## The AI Stack Specifically: Bind, Authenticate, Isolate

This is the category with the clearest single root cause: fast local access by design, and no login screen by default, because that's the right default for a laptop and nobody revisits it before the same binary reaches a cloud VM.

**Ollama** is the cleanest example of why the fix has to be about the deployment, not the software: it binds to `127.0.0.1` and has no authentication mechanism at all, by design. The moment it's rebound to `0.0.0.0` — which most Docker/Compose setups do, because that's how you reach it from another container — every request succeeds, full stop; internet-wide scans have found on the order of 175,000 instances exposed exactly this way. **vLLM** has the same shape: no key required unless `--api-key` is explicitly passed. **Qdrant** and **Milvus** both ship with no authentication unless it's turned on explicitly — and when Milvus auth *is* enabled, its default credentials (`root`/`Milvus`) are public knowledge, so "enabled" isn't "secured" until the default password is changed too. **Gradio** and **Streamlit** enforce no login by default at all. **Jupyter** is the one exception worth crediting: it generates a random access token by default and has for years — the vulnerable case is specifically an operator setting `--NotebookApp.token=''` for local convenience, and that setting following the container into a production deployment.

The fix set is short and applies uniformly across all of them:

- **Bind to loopback unless the service is meant to be reachable from elsewhere.** `127.0.0.1`, not `0.0.0.0`. This single change eliminates the entire "found by a passive internet scan" category for a self-hosted service.
- **Never disable authentication "for local convenience" in a config that will be reused in production.** Jupyter's own default is the right model: a real (if minimal) token, generated automatically, required on every request.
- **Put a reverse proxy in front of anything that must be reachable from outside its own host**, and let the proxy own authentication, rate limiting, and TLS — not the application.
- **Isolate at the network layer, not just the application layer**, for anything holding model weights or embeddings. A container or VM on its own network segment with an explicit egress allowlist means a compromise of the AI service itself still can't pivot laterally into the rest of the environment — the boundary holds even when the application-layer check fails, which is the actual justification for running agent workspaces in their own sandbox (gVisor) behind a per-project VLAN rather than trusting the app's own auth to be the only line of defense.
- **Firewall the well-known AI dev ports by default** — 6333, 7860, 8000, 8501, 8888, 11434, 19530 — deny inbound unless a specific rule opens them, rather than allowing everything and hoping the application catches it.

## Secret Leaks: Stop the Push, Not Just the Search

Everything in Part 1's leak-discovery section (GitHub dorking, TruffleHog, Gitleaks, GitGuardian, IntelX) exists because secrets keep getting committed. The fix operates in layers, and the earliest layer is the cheapest:

1. **`.gitignore` before the first commit**, not after: `.env`, `*.pem`, `*.key`, `config.local.*`. This costs nothing and prevents the largest share of incidents outright.
2. **A pre-commit hook running Gitleaks locally** catches a secret before it ever leaves the developer's machine — cheaper than catching it in CI, and far cheaper than catching it after it's public.
3. **Gitleaks (or equivalent) as a CI gate** is the backstop for the pre-commit hook that got skipped or bypassed — block the merge, don't just alert on it after the fact.
4. **GitHub's built-in Secret Scanning**, free and on by default for public repositories, is the last line: when it recognizes a known provider's key format, it notifies that provider directly, and revocation often happens within seconds without anyone acting on an alert first.
5. **Rotate on any suspicion, immediately, without waiting for confirmation of impact.** A key that might have leaked and hasn't been rotated is functionally identical to a key that has.

## The Common Thread

Every finding across both articles reduces to the same root cause: a control that exists, but isn't the default, and nobody explicitly turned it on. Ollama's missing auth, MongoDB's historical no-auth default, Jupyter's disabled token, a `.env` file that was never gitignored — none of these are exotic vulnerabilities. They're defaults that were correct for a laptop and never revisited before the same binary reached the internet. The fix, in every case, is the same discipline: bind narrowly, authenticate explicitly, isolate at the network layer regardless of what the application layer does, and audit yourself with the same tools and the same queries an attacker would use — on a schedule, not once.

## Sources

- Prowler — https://github.com/prowler-cloud/prowler
- Scout Suite — https://github.com/nccgroup/ScoutSuite
- ProjectDiscovery Nuclei — https://github.com/projectdiscovery/nuclei
- Ollama API authentication issue — https://github.com/ollama/ollama/issues/2194
- vLLM quickstart (API key configuration) — https://docs.vllm.ai/en/stable/getting_started/quickstart/
- Qdrant authentication docs — https://qdrant.tech/documentation/cloud/authentication/
- Milvus connection/auth docs — https://milvus.io/docs/v2.3.x/manage_connection.md
- Jupyter server security docs — https://jupyter-server.readthedocs.io/en/latest/operators/security.html
- Gitleaks — https://github.com/gitleaks/gitleaks
- TruffleHog — https://github.com/trufflesecurity/trufflehog
- GitHub Secret Scanning — https://docs.github.com/en/code-security/secret-scanning
