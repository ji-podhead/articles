# Articles — Content-Pipeline & Knowledge-Base

Dieser Ordner ist die Pipeline für alle öffentlichen Inhalte. Jeder Artikel
wird **doppelt genutzt**: als LinkedIn-Artikel/-Post **und** als Baustein der
Knowledge-Base — die Artikel sind so geschrieben, dass sie ohne
LinkedIn-Kontext als eigenständiges Doku-Stück funktionieren und später aus
dem Dashboard bzw. der Doku-Seite heraus verlinkt werden.

**Artikel-Dateien enthalten bewusst nur drei Dinge:** Titel, Artikeltext,
`## Sources` (Verifikationsdatum + Links). Alles Operative — Status,
Bild-Kataloge, PNG-Export, Hashtags — gehört hier in dieses README, nicht in
den Artikel.

---

## Status-Übersicht

| # | Titel | Ordner | Status |
|---|---|---|---|
| — | **The Bouncer, the Wall, and the Straitjacket** (gVisor + VLAN + identity-routing for multi-tenant workspace isolation) | [`gvisor-workspace-isolation/`](gvisor-workspace-isolation/) | Entwurf fertig (13.9.2026) — Artikel + Short-Post + 4 Figuren (titel, gvisor_architecture, three_layers, prior_art) + PNGs, alle 14 Quellen live verifiziert. Generisch/vendor-neutral (Kubernetes Agent Sandbox/Gitpod-Ona/Fly.io als Prior Art, Gitpod-Repo als AGPL nur zitiert nie vendort), referenziert den eBPF/K-LAF-Artikel statt ihn neu zu erklären; JiMesh-eigene Router/Infra-Details bewusst nur als kurzer Schluss-Absatz. Link-Platzhalter offen. |
| — | **You Have Logs. You Don’t Have a SIEM.** (generischer SMB-Guide: AWS-Native vs. Open Source,: Suricata/eBPF/Firewall/WAF, 4 Wege: OSS/AWS/SaaS/minimal) | [`siem-smb-guide/`](siem-smb-guide/) | Entwurf fertig, erweitert 10.9.2026 — Artikel (~6300 Wörter) + Short-Post + 7 SVG-Figuren + 1 echtes Wazuh-Dashboard-Screenshot (`wazuh-dashboard-incident-response.png`, Drittquelle, attribuiert) + PNGs, Link-Platzhalter offen. Deckt zusätzlich ab: Datadog/Splunk als dritten (SaaS-)Weg inkl. Deploy-per-Service + Egress-Kosten-Realität, GCP Cloud Logging/Ops-Agent-Kosten, Kafka-vs-Redis-Streams als Transport-Layer-Frage, Elastic-Stack-Lizenzgeschichte (SSPL vs. OpenSearch-Fork), end-to-end KI-Threat-Detection-Wiring für AWS (SageMaker→Lambda→Security Hub, Bedrock Agents) und On-Prem (OpenSearch ML Commons). Alle ~35 externen Links live verifiziert (200 + Content-Spotcheck, 10.9.2026). Offen: 2 weitere SVG-Tabellen (Cloudflare-Produktübersicht, Alternativen-Vergleich) warten auf Logo-Assets vom Operator. **Bewusst ohne JiMesh-Bezug** (Operator-Vorgabe 9.9.2026: generisch bis nach dem Release) — daher **ohne** die sonst obligatorische Mesh-Cube-Marke im Titelbild. JiMesh-Anbindung folgt als eigener Nachtrag/Artikel nach Release. Ergänzt (nicht ersetzt) den bestehenden JiMesh-spezifischen SIEM-Artikel unter [`siem/`](siem/). Kontext: dient dem Operator auch als Interview-Vorbereitung (Head of MLOps/MLOps bei CloudiQS, 11.9.2026). |
| — | **Stopping Prompt Injection at the Kernel Level** (eBPF Foundation-Artikel) | [`ebpf/`](ebpf/) | Entwurf fertig — Short-Post + Artikel + PNGs, Link-Platzhalter offen |
| 0 | **One API Key to Route Them All** (LLM Mesh Intro) | [`llm-mesh-intro/`](llm-mesh-intro/) | **Veröffentlicht** (LinkedIn Pulse, 8.9.2026) — https://www.linkedin.com/pulse/one-api-key-route-them-all-what-llm-mesh-leonardo-jacobi-cl4xf/ |
| 1 | **Entropy-Gated Model Cascades** | [`entropy-cascades/`](entropy-cascades/) | Entwurf fertig — als nächstes veröffentlichen |
| 2 | **We Didn't Build a Router. We Built an Economy.** (Learning Router, Teil 2 von #0) | [`learning-router/`](learning-router/) | Entwurf fertig — nach #1 |
| 3 | Secret-Masking Short-Post | — | geplant (Teaser/Funnel für #4) |
| 4 | K-LAF Teil 2: Enforcement | — | geplant |
| 4b | Kernel-Level Pre-Commit (SAST/DAST-Dreiklang) | — | geplant — Umsetzung Sprint 28 (SAST) / Sprint 29 (DAST) |
| 5 | Safe LLM Deployments & Sandboxes | — | geplant |
| 6 | Knowledge-Base-Stücke (kein LinkedIn-Zwang) | — | siehe unten |

Der eBPF-Artikel ist der **Foundation-Artikel** für alles Weitere: eBPF-
Grundlagen, die 4-Stufen-Pipeline, das Tool-Landschafts-Bild und die
Identitätskette werden dort erklärt. **Nachfolgende Artikel verlinken
dorthin statt eBPF komplett neu zu erklären.**

---

## Pipeline — geplante Artikel

### 1. Entropy-Gated Model Cascades ← nächster Release

Die frischeste Story, kaum Konkurrenz-Literatur. Kern: Kleines Routing-Modell
zuerst, mit `logprobs: top_logprobs=5`; durchschnittliche normalisierte
Shannon-Entropie über alle Output-Tokens — unter Threshold (0.45) → Antwort
direkt servieren, sonst **generierte Antwort verwerfen** und per
Bandit-Chain zum Reasoning-Modell eskalieren. Kein Classifier, keine
Extra-Infrastruktur: das Modell verrät seine eigene Unsicherheit. Enthält die
verifizierte Provider-Matrix (wer liefert überhaupt Logprobs?).

### 2. Der lernende Router (Teil 2 von #0)

Thompson-Sampling-Bandit mit 2-Tage-Half-Life-Decay (`internal/router/`),
Free-First-Failover und cost-skalierte Key-Cooldowns (`internal/keypool/`),
Provider-Header-Quota mit Confidence-Modell (`internal/quota/`), Feedback-Loop
über Redis Streams (`internal/streams/`). Erzählung: „Wir haben keinen Router
gebaut, wir haben eine Volkswirtschaft gebaut." Verweist explizit auf #0 als
Teil 1.

### 3. Short-Post: Secret-Masking auf Responses

Die billigste Kontrolle, die den Sprint-19-Incident erfasst hätte — reine
Regex (`sk-`, `gho_`, PEM-Header), Mikrosekunden, kein Modell. Dient als
Teaser/Funnel für #4. Code: `internal/scanner/`, `internal/ai/scanner_hook.go`.

### 4. K-LAF Teil 2: Enforcement („Ein Urteil ist wertlos, wenn du nicht weißt, wen du einfrierst")

Direkte Fortsetzung des eBPF-Artikels: gemintete Session-Identity
(Provisionierungs-Bindung + Netzwerk-Bindung), die 4-stufige Freeze-Leiter,
Default-Deny-Egress-Allowlist (inkl. strukturell un-allowbarer
Cloud-Metadata-Service), SocketGuard (Docker-Socket-Proxy, der
`POST /containers/create` auf gefährliche Mounts prüft). eBPF nur verlinken.

### 4b. Kernel-Level Pre-Commit: Stopping Secrets Before They Land

Der fehlende Teil der Security-Front: Gateway-Inspektion fängt Secrets in
**Responses**, Egress blockiert den **Abfluss** — aber ein Secret, das der
Agent in den Code schreibt und committed, geht an beidem vorbei. Hook des
Stücks: *git hooks protect against polite humans — agents read the docs and
pass `--no-verify`.* Kern: eBPF-LSM fängt commit-kritische Schreibzugriffe
(`.git/index`, `.git/objects/`, Worktrees) im Kernel ab, Userspace-Daemon
scannt (Gitleaks/Semgrep), Verdict → freigeben oder `-EPERM`. Der Guard
**pricht zurück**: der blockierte Agent bekommt ein strukturiertes, inertes
Advisory mit Remediation-Weg (Vault statt Hardcode), kein stummer Abbruch.
**Dreiklang im Artikel: (1) Kernel-Pre-Commit-Blocking, (2) Static Analysis**
(auf Git-Quellen und discovery-gefundene Repos ohne Git), **(3) Dynamic
Analysis/DAST als Deployment-Gate** — DAST braucht eine laufende App, gehört
also in die Deploy-Stufe statt in den Commit; dort gescannt mit Katana & Co.
im Sandbox-Kontext von #5.
Quellen: `docs/research/R24:SAST:PRECOMMIT_KERNEL.md`,
`docs/research/R25-tetragon-gvisor-kata.md`, Sprints 28/29.

### 5. Safe LLM Deployments & Sandboxes — „das Deployment IST die Sandbox"

Der Deployment-Stack von JiMesh ist die Sandbox: T1–T3-Isolationsmodell
(rootless Docker → gVisor/Systrap → VM pro Projekt), Docker-Socket-Thematik
(SocketGuard statt Socket-Mount), Git-Worktrees als Arbeitsbereichsgrenze für
Agenten, Best Practices für Agent-Deployment (Ephemeral Workspaces,
JIT-Credential-Injektion aus dem Vault, HITL-Gates). eBPF-Artikel verlinken.

### 6. Später / Knowledge-Base-Stil

- **Kata Containers & Security-Tooling-Container:** wie JiMesh isolierte
  Runtimes und Scan-Container einbindet — Kata mit eBPF **im Gast-Kernel**
  (Ant-Group-AntCWPP-Muster, R25) im Kontext von #5 und #4b; Katana & Co.
  als Scan-Container-Ebene.
- **Static Analysis auf Discovery-gefundenen Repos:** Deployments starten
  üblicherweise mit Git, müssen es aber nicht — Static Analysis wird deshalb
  auch auf bei der Auto-Discovery gefundene Repos/Code angewendet.
- **Port-Discovery → Security Page pro Endpoint/App:** Auto-App-Discovery
  deckt auch **Ports** ab; jede App/jeder Endpoint bekommt eine eigene
  Security Page (aus der Hierarchie gerendert); UX analog VS Code — offene
  Ports unten anzeigen und direkt in ein Deployment/App überführen. Die
  Operator-Anforderung ist an den Frontend-Track (anderes Review) übergeben —
  hier nur die Content-Sicht.

---

## Struktur & Konventionen

- **Ordner je Artikel:** `docs/articles/<slug>/` mit
  `YYYY-MM-DD-<slug>-linkedin.md` (Hauptartikel: Titel + Text + Sources —
  sonst nichts), `YYYY-MM-DD-<slug>-short-post.md` (Feed-Post mit
  Veröffentlichungs-Checkliste) und den SVG-Figuren + `png/`-Exports.
- **Artikeltext regeln:** LinkedIn rendert keine Markdown-Tabellen → Tabellen
  als SVG-Bild mit englischem Caption einbetten (Muster im eBPF-Artikel).
- **Titel-Template:** `bgGrad` (#0b1329→#1c2541→#3a506b), Grid, Ringe rechts,
  Title Zeile 1 weiß / Zeile 2 `accentGrad` (#38bdf8→#818cf8), Subtitle,
  Monospace-Snippet, **ohne Badge-Container**. Das **Hauptmotiv rechts ist
  themenspezifisch** (die eBPF-Bee gibt es nur im eBPF-Artikel) — **nie das
  eigene Logo als Hauptmotiv**. **Unten links: Mesh-Cube-Mark + JIMESH-
  Wortmarke** (`brand/jimesh-mesh-cube-mono.svg`, inline skaliert,
  `currentColor`).
- **Serien-Verknüpfung:** #0 (Intro) und #2 (Learning Router) sind explizit
  Teil 1/2 — jeder Artikel verweist am Ende bzw. Anfang auf den jeweils
  anderen (Link-Platzhalter setzen).
- **Incident-Details** (Sprint 19) bleiben anonymisiert — keine Credentials,
  Ports, Timelines; die konkrete Timeline bleibt im privaten Sprint-Dokument.
- **Code-Basis je Artikel** ist in den Sprint-Docs verifiziert und referenziert
  (Sprint 13 Entropy-Routing, Sprint 20 K-LAF/Exposure, Sprint 29 Deployment
  Gates) — nicht in den Artikeln.

## Publishing

- **Link in den ersten Kommentar** statt in den Post-Body (LinkedIn-Algorithmus
  sortiert Posts mit externen Links schlechter). Post = Nutzwert + Meme/Bild,
  Artikel-Link als eigener Ersti-Kommentar.
- **Erste 2 Zeilen sind der Hook** („…see more"-Cut): stärkste Zeile nach oben,
  kurze Absätze mit Leerzeilen.
- **Hashtags je Artikel** (3–5 nutzen, Rest optional):

  | Artikel | Hashtag-Set |
  |---|---|
  | eBPF | `#PromptInjection #eBPF #LLMSecurity #AIAgents #CyberSecurity #DevSecOps #KernelSecurity #AIInfrastructure #OpenSource` |
  | #0 Intro | `#LLM #AIEngineering #AIInfrastructure #OpenSource #DevTools #MLOps #LLMGateway #GoLang #APIDesign #CostOptimization` |
  | #1 Entropy | `#LLM #AIEngineering #MachineLearning #CostOptimization #MLOps #AIInfrastructure #OpenSource #LLMGateway #InferenceCost` |
  | #2 Router | `#LLM #AIEngineering #MLOps #AIInfrastructure #GoLang #OpenSource #LLMGateway #CostOptimization #DistributedSystems` |
  | siem-smb-guide | `#CyberSecurity #SIEM #AWS #OpenSource #DevSecOps #CloudSecurity #MLOps` |

- **PNG-Export nach SVG-Änderung (ai_response_flow.svg wurde 11.9. neu gebaut in Großformat mit offiziellen AWS-Icons — PNG neu exportieren** (Headless-Chromium, 2×):

  ```bash
  slug="entropy-cascades"   # Ordnername
  for pair in "titel:1200,675" "pipeline:1050,300" "table_approaches:1100,560"; do
    name="${pair%%:*}"; size="${pair##*:}"
    chromium --headless --disable-gpu --no-sandbox \
      --screenshot="docs/articles/${slug}/png/${name}.png" \
      --window-size="$size" --force-device-scale-factor=2 --hide-scrollbars \
      "file://$PWD/docs/articles/${slug}/${name}.svg"
  done
  ```

  Figuren-Größen je Artikel:

  | Artikel | Figuren (`name:breite,höhe`) |
  |---|---|
  | gvisor-workspace-isolation | `titel:1200,675` `gvisor_architecture:1050,480` `three_layers:1050,560` `prior_art:1050,400` |
  | ebpf | `titel:1200,675` `gap2:960,420` `pipeline:1050,200` `freeze_latter:500,560` `table_landscape:1100,520` |
  | llm-mesh-intro | `titel:1200,675` `before_after:1100,540` `routing_methods:1100,600` |
  | entropy-cascades | `titel:1200,675` `pipeline:1050,300` `table_approaches:1100,560` |
  | learning-router | `titel:1200,675` `layers:1050,560` `table_landscape:1100,520` |
  | siem-smb-guide | `titel:1200,675` `pipeline:1050,320` `stack_oss:1050,345` `stack_aws:1050,410` `traffic_control:1050,300` `mlops_pipeline:1050,260` `table_mapping:1100,440` |

- **Quellen zum Veröffentlichungszeitpunkt live verifizieren** — Datum im
  `## Sources`-Abschnitt des Artikels entspricht dem letzten
  Verifikationslauf.
