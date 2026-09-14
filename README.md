# Articles — Content Pipeline & Knowledge Base

This repository is the pipeline for all public content. Every article is
**used twice**: as a **blog post** and as a building block of the knowledge
base — articles are written to work as standalone documentation pieces without
publication context, later linked from the dashboard and the docs pages.

**Article files deliberately contain only three things:** title, article text,
`## Sources` (verification date + links). Everything operational — status,
figure catalogs, PNG export, hashtags — belongs in this README, not in the
article.

---

## Status Overview

| # | Title | Folder | Status |
|---|---|---|---|
| — | **The Bouncer, the Wall, and the Straitjacket** (gVisor + VLAN + identity-routing for multi-tenant workspace isolation) | [`gvisor-workspace-isolation/`](gvisor-workspace-isolation/) | Draft done (2026-09-13) — article + short post + 4 figures (title, gvisor_architecture, three_layers, prior_art) + PNGs, all 14 sources verified live. Generic/vendor-neutral (Kubernetes Agent Sandbox/Gitpod-Ona/Fly.io as prior art, Gitpod repo cited as AGPL but never vendored), references the eBPF/K-LAF article instead of re-explaining it; JiMesh-specific router/infra details deliberately only as a short closing paragraph. Link placeholders open. |
| — | **You Have Logs. You Don't Have a SIEM.** (AWS-native vs. open source, Suricata/eBPF/firewall/WAF, 4 paths: OSS/AWS/SaaS/minimal) | [`siem-smb-guide/`](siem-smb-guide/) | Draft done, consolidated 2026-09-15 — article (~6600 words) + short post + 8 SVG figures + 1 real Wazuh dashboard screenshot (`wazuh-dashboard-incident-response.png`, third-party source, attributed) + PNGs, link placeholders open. Additionally covers: Datadog/Splunk as the third (SaaS) path incl. per-service deploy + egress cost reality, GCP Cloud Logging/Ops-Agent costs, Kafka-vs-Redis-Streams as a transport-layer question, Elastic-Stack license history (SSPL vs. OpenSearch fork), end-to-end AI threat-detection wiring for AWS (SageMaker→Lambda→Security Hub, Bedrock Agents) and on-prem (OpenSearch ML Commons). **Merged in 2026-09-15**: the identity-chain + provider-swap section (`architecture_kniff.svg`, the `FindingSource`/`FindingSink` Go interface pattern) from the retired `siem/` article — that folder previously duplicated most of this guide's own diagrams with a JiMesh-specific framing; its one genuinely unique section was folded in here instead of maintaining two overlapping articles. All ~35 external links verified live (200 + content spot-check, 2026-09-10). Open: 2 more SVG tables (Cloudflare product overview, alternatives comparison) waiting on logo assets. Context: also serves the operator as interview prep (Head of MLOps at CloudiQS, 2026-09-11). |
| — | **Stopping Prompt Injection at the Kernel Level** (eBPF foundation article) | [`ebpf/`](ebpf/) | Draft done — short post + article + PNGs, link placeholders open |
| — | **Data Harmonization: Structuring, Normalization & Harmonization** | [`data-harmonization/`](data-harmonization/) | Draft done (2026-09-15) — article + 2 figures (titel, content diagram), overlap/layout fixes applied 2026-09-16. Generic (no JiMesh reference), no brand mark in title figure (eBPF precedent). Link placeholders open. |
| — | **Google's TabFM: The End of XGBoost Retraining Loops?** | [`google-tabfm-zero-shot/`](google-tabfm-zero-shot/) | Draft done (2026-09-15) — article + 2 figures (titel, content diagram), overlap/layout fixes applied 2026-09-16. Generic (no JiMesh reference). Link placeholders open. |
| — | **Integrating MCP Servers via Docker + SSE Transport for Email Automation** | [`mcp-docker-email-automation/`](mcp-docker-email-automation/) | Draft done (2026-05-01) — article + 2 figures (titel, content diagram), overlap/layout fixes applied 2026-09-16. Generic (no JiMesh reference). Link placeholders open. |
| — | **Object Trackers for Computer Vision: Kalman Filter, DeepSORT & MOTA** | [`object-tracking-computer-vision/`](object-tracking-computer-vision/) | Draft done (2026-09-15) — article + 2 figures (titel, content diagram), overlap/layout fixes applied 2026-09-16. Generic (no JiMesh reference). Link placeholders open. |
| — | **The Evolution of AI Planning: From GOAP to LLM-Driven Robotics** | [`ai-planning-evolution/`](ai-planning-evolution/) | Draft done (2026-09-15) — article + 2 figures (titel, content diagram), overlap/layout fixes applied 2026-09-16. Generic (no JiMesh reference). Link placeholders open. |
| 0 | **One API Key to Route Them All** (LLM Mesh Intro) | [`llm-mesh-intro/`](llm-mesh-intro/) | **Published** (2026-09-08) — https://www.linkedin.com/pulse/one-api-key-route-them-all-what-llm-mesh-leonardo-jacobi-cl4xf/ |
| 1 | **Entropy-Gated Model Cascades** | [`entropy-cascades/`](entropy-cascades/) | Draft done — next to publish |
| 2 | **We Didn't Build a Router. We Built an Economy.** (Learning Router, part 2 of #0) | [`learning-router/`](learning-router/) | Draft done — after #1 |
| 3 | Secret-Masking Short Post | — | planned (teaser/funnel for #4) |
| 4 | K-LAF Part 2: Enforcement | — | planned |
| 4b | Kernel-Level Pre-Commit (SAST/DAST trio) | — | planned — implementation Sprint 28 (SAST) / Sprint 29 (DAST) |
| 5 | Safe LLM Deployments & Sandboxes | — | planned |
| 6 | Knowledge-Base Pieces (no publishing cadence) | — | see below |

The eBPF article is the **foundation article** for everything that follows:
eBPF fundamentals, the 4-stage pipeline, the tool-landscape picture and the
identity chain are explained there. **Later articles link there instead of
re-explaining eBPF from scratch.**

---

## Pipeline — Planned Articles

### 1. Entropy-Gated Model Cascades ← next release

The freshest story, almost no competing literature. Core: small routing model
first, with `logprobs: top_logprobs=5`; average normalized Shannon entropy over
all output tokens — below threshold (0.45) → serve the answer directly, else
**discard the generated answer** and escalate to the reasoning model via the
bandit chain. No classifier, no extra infrastructure: the model reveals its own
uncertainty. Includes the verified provider matrix (who actually serves
logprobs?).

### 2. The Learning Router (Part 2 of #0)

Thompson-sampling bandit with 2-day half-life decay (`internal/router/`),
free-first failover and cost-scaled key cooldowns (`internal/keypool/`),
provider header quota with a confidence model (`internal/quota/`), feedback
loop over Redis Streams (`internal/streams/`). Narrative: "We didn't build a
router, we built an economy." Explicitly references #0 as part 1.

### 3. Short Post: Secret Masking on Responses

The cheapest control that would have caught the Sprint-19 incident — pure
regex (`sk-`, `gho_`, PEM headers), microseconds, no model. Serves as
teaser/funnel for #4. Code: `internal/scanner/`, `internal/ai/scanner_hook.go`.

### 4. K-LAF Part 2: Enforcement ("A verdict is worthless if you don't know whom to freeze")

Direct continuation of the eBPF article: minted session identity
(provisioning binding + network binding), the 4-step freeze ladder,
default-deny egress allowlist (including the structurally un-allowable cloud
metadata service), SocketGuard (Docker socket proxy that checks
`POST /containers/create` for dangerous mounts). eBPF linked only.

### 4b. Kernel-Level Pre-Commit: Stopping Secrets Before They Land

The missing piece of the security front: gateway inspection catches secrets in
**responses**, egress blocks the **exfiltration** — but a secret the agent
writes into code and commits passes both. Hook of the piece: *git hooks protect
against polite humans — agents read the docs and pass `--no-verify`.* Core:
eBPF-LSM catches commit-critical writes (`.git/index`, `.git/objects/`,
worktrees) in the kernel, userspace daemon scans (Gitleaks/Semgrep), verdict →
allow or `-EPERM`. The guard **talks back**: the blocked agent receives a
structured, inert advisory with a remediation path (vault instead of
hardcode), no silent abort. **Trio in the article: (1) kernel pre-commit
blocking, (2) static analysis** (on git sources and discovery-found repos
without git), **(3) dynamic analysis/DAST as a deployment gate** — DAST needs a
running app, so it belongs in the deploy stage rather than the commit; scanned
there with Katana & Co. in the sandbox context of #5.
Sources: `docs/research/R24:SAST:PRECOMMIT_KERNEL.md`,
`docs/research/R25-tetragon-gvisor-kata.md`, Sprints 28/29.

### 5. Safe LLM Deployments & Sandboxes — "the deployment IS the sandbox"

The JiMesh deployment stack is the sandbox: T1–T3 isolation model (rootless
Docker → gVisor/Systrap → VM per project), Docker socket topic (SocketGuard
instead of socket mount), git worktrees as workspace boundary for agents,
agent deployment best practices (ephemeral workspaces, JIT credential
injection from the vault, HITL gates). eBPF article linked.

### 6. Later / Knowledge-Base Style

- **Kata Containers & security tooling containers:** how JiMesh integrates
  isolated runtimes and scan containers — Kata with eBPF **in the guest
  kernel** (Ant-Group pattern, R25) in the context of #5 and #4b; Katana & Co.
  as the scan-container layer.
- **Static analysis on discovery-found repos:** deployments usually start with
  git, but don't have to — static analysis is therefore also applied to
  repos/code found during auto-discovery.
- **Port discovery → security page per endpoint/app:** auto app-discovery also
  covers **ports**; every app/endpoint gets its own security page (rendered
  from the hierarchy); UX analogous to VS Code — show open ports at the bottom
  and hand off directly into a deployment/app. The operator requirement has
  been handed to the frontend track (different review) — only the content view
  here.

---

## Structure & Conventions

- **Folder per article:** `<slug>/` with `YYYY-MM-DD-<slug>-blogpost.md`
  (main article: title + text + sources — nothing else),
  `YYYY-MM-DD-<slug>-short-post.md` (feed post with publishing checklist) and
  the SVG figures + `png/` exports.
- **Article text rules:** publishing platforms don't render Markdown tables →
  embed tables as an SVG image with an English caption (pattern in the eBPF
  article).
- **Title template:** `bgGrad` (#0b1329→#1c2541→#3a506b), grid, rings on the
  right, title line 1 white / line 2 `accentGrad` (#38bdf8→#818cf8),
  subtitle, monospace snippet, **no badge container**. **The main motif on the
  right is topic-specific** (the eBPF bee only exists in the eBPF article) —
  **never the own logo as the main motif**. **Bottom left: mesh-cube mark +
  JIMESH wordmark** (`brand/jimesh-mesh-cube-mono.svg`, inlined-scaled,
  `currentColor`).
- **Series linking:** #0 (intro) and #2 (learning router) are explicitly parts
  1/2 — each article references the other at the start or end (link
  placeholders set).
- **Incident details** (Sprint 19) stay anonymized — no credentials, ports,
  timelines; the concrete timeline stays in the private sprint document.
- **Code base per article** is verified and referenced in the sprint docs
  (Sprint 13 entropy routing, Sprint 20 K-LAF/exposure, Sprint 29 deployment
  gates) — not in the articles.

## Publishing

- **Link in the first comment** instead of the post body (platform algorithms
  rank posts with external links lower). Post = value + meme/image, article
  link as the first comment.
- **The first 2 lines are the hook** (the fold): strongest line on top, short
  paragraphs with blank lines.
- **Hashtags per article** (3–5 used, rest optional):

  | Article | Hashtag set |
  |---|---|
  | eBPF | `#PromptInjection #eBPF #LLMSecurity #AIAgents #CyberSecurity #DevSecOps #KernelSecurity #AIInfrastructure #OpenSource` |
  | #0 intro | `#LLM #AIEngineering #AIInfrastructure #OpenSource #DevTools #MLOps #LLMGateway #GoLang #APIDesign #CostOptimization` |
  | #1 entropy | `#LLM #AIEngineering #MachineLearning #CostOptimization #MLOps #AIInfrastructure #OpenSource #LLMGateway #InferenceCost` |
  | #2 router | `#LLM #AIEngineering #MLOps #AIInfrastructure #GoLang #OpenSource #LLMGateway #CostOptimization #DistributedSystems` |
  | siem-smb-guide | `#CyberSecurity #SIEM #AWS #OpenSource #DevSecOps #CloudSecurity #MLOps` |

- **PNG export after SVG changes** (`ai_response_flow.svg` was rebuilt 2026-09-11
  in large format with official AWS icons — re-export the PNG
  (headless Chromium, 2×):

  ```bash
  slug="entropy-cascades"   # folder name
  for pair in "titel:1200,675" "pipeline:1050,300" "table_approaches:1100,560"; do
    name="${pair%%:*}"; size="${pair##*:}"
    chromium --headless --disable-gpu --no-sandbox \
      --screenshot="png/${name}.png" \
      --window-size="$size" --force-device-scale-factor=2 --hide-scrollbars \
      "file://$PWD/${name}.svg"
  done
  ```

  Figure sizes per article:

  | Article | Figures (`name:width,height`) |
  |---|---|
  | gvisor-workspace-isolation | `titel:1200,675` `gvisor_architecture:1050,480` `three_layers:1050,560` `prior_art:1050,400` |
  | ebpf | `titel:1200,675` `gap2:960,420` `pipeline:1050,200` `freeze_latter:500,560` `table_landscape:1100,520` |
  | llm-mesh-intro | `titel:1200,675` `before_after:1100,540` `routing_methods:1100,600` |
  | entropy-cascades | `titel:1200,675` `pipeline:1050,300` `table_approaches:1100,560` |
  | learning-router | `titel:1200,675` `layers:1050,560` `table_landscape:1100,520` |
  | siem-smb-guide | `titel:1200,675` `pipeline:1050,320` `stack_oss:1050,345` `stack_aws:1050,410` `traffic_control:1050,300` `mlops_pipeline:1050,260` `table_mapping:1100,440` `architecture_kniff:1050,220` |
  | data-harmonization | `titel:1200,675` `data-pipeline-structuring-normalization-harmonization:1200,675` |
  | google-tabfm-zero-shot | `titel:1200,675` `tabfm-zero-shot-landscape:1200,675` |
  | mcp-docker-email-automation | `titel:1200,675` `mcp-sse-docker-architecture:1200,675` |
  | object-tracking-computer-vision | `titel:1200,675` `object-tracking-kalman-deepsort:1200,675` |
  | ai-planning-evolution | `titel:1200,675` `ai-planning-stack-evolution:1200,675` |

- **Verify sources live at publication time** — the date in the article's
  `## Sources` section corresponds to the last verification run.
