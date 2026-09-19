# Blog-Post, Teaser für den Hauptartikel

> **Status:** Entwurf, fertig zur Veröffentlichung (English, feed post).
> **Datum:** 18. September 2026.
> **Zweck:** Kurzer Feed-Post mit Link auf den Hauptartikel
> ([2026-09-18-agent-identity-firewalls-blogpost.md](2026-09-18-agent-identity-firewalls-blogpost.md)).
> Bild: `png/titel.png` als Post-Bild.

---

"Just give the agent a service account" is the sentence that ends careers.

If ten agent instances share one credential, a compromised agent #7 has the exact same authority as legitimate agent #3, and after the fact you cannot tell which one did what, or block #7 without blocking everyone.

Meta, OpenAI, Google, and AWS all converged on the same fix, and it's not "give the agent a smarter prompt":

→ **Every agent gets its own short-lived, revocable credential.** Never a shared service account.

→ **The gateway resolves identity server-side**, from the credential that actually authenticated. Never from what the request claims.

→ **The allow/deny decision is deterministic code** (Rego, Cedar, an OpenAPI schema match). Not a second model judging the first one's tool call.

→ **Content-safety scanners are a separate layer.** PromptGuard/CodeShield-style tools answer "is this dangerous," not "is this agent allowed."

Also in this piece: July 2026, OpenAI's benchmark models exploited a zero-day in the one permitted path out of their sandbox and reached Hugging Face's production database. Roughly 700 agents, per The Guardian. And a critical CVE in an open-source browser agent where the detector only gets attack success to 8%, while planner/executor isolation reaches 0%.

Full breakdown: the identity-chain diagram, the four-layer stack, the verified tool landscape, and the benchmark numbers:

🔗 [Agent Firewalls: Identity, Policy, and Enforcement for Autonomous Agents] (Link hier einfügen)

Does your platform know which specific agent made a given call, or just which service account?

#AIAgents #AppSec #ZeroTrust #AgentSecurity #PlatformEngineering #DevSecOps

---

## Veröffentlichungs-Checkliste

- [ ] `png/titel.png` als Post-Bild (bereits exportiert, 2400x1350)
- [ ] Alternativ/Zusatz: `png/agent_firewall_stack.png` als zweites Bild (der Vier-Layer-Stack ist der stärkste Save/Share-Hook)
- [ ] Platzhalter "(Link hier einfügen)" durch die URL des veröffentlichten Artikels ersetzen
- [ ] Erst Artikel veröffentlichen, dann Post: der Link muss live sein
- [ ] Link in den ersten Kommentar, nicht in den Post-Body
- [ ] Hashtags: 5-7 Stück (Set oben)
