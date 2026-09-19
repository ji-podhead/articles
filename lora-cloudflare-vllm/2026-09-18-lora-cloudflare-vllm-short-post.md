# Blog-Post, Teaser für den Hauptartikel

> **Status:** Entwurf, fertig zur Veröffentlichung (English, feed post).
> **Datum:** 18. September 2026.
> **Zweck:** Kurzer Feed-Post mit Link auf den Hauptartikel
> ([2026-09-18-lora-cloudflare-vllm-blogpost.md](2026-09-18-lora-cloudflare-vllm-blogpost.md)).
> Bild: `png/titel.png` als Post-Bild.

---

Stop storing your agent's brain in text files.

A LoRA adapter is a better storage model: a small weight delta over a frozen base model, swappable per request. Three roles, one mechanism:

→ **The adapter as skill**: deploy flows, firewall ops, agent tools, trained not prompted.

→ **The adapter as memory**: domain knowledge in weights, not in a claude.md that grows until retrieval drowns. Procedural knowledge bakes in; encyclopedic knowledge stays in retrieval.

→ **The adapter as conscience**: Split Personality Training proved it. An honest-persona adapter reviews the main model's outputs and cannot influence them. Published numbers: alignment faking flagged at 93 to 99% where the baseline sits at 0%, and it flags the *situation* that incentivizes faking, not just the act.

Serving both worlds, verified against live docs this week:

• Cloudflare Workers AI: BYO-LoRA open beta, adapters up to rank 32 and 300 MB, up to 100 per account, swap per request with one parameter.

• vLLM: multi-LoRA per request on one GPU, prefix caching a flag away, Anthropic-compatible surface in code (productized by NVIDIA NIM).

• And the row most tutorials get wrong: TGI's repo is archived. Check maintenance, not search rank.

Full breakdown with the papers (QLoRA, DoRA, S-LoRA, Punica, PagedAttention, LoraHub, CoDyRA), the expert-switching guardrail design, and the honest comparison table:

🔗 [Adapters as Skills, Adapters as Conscience: LoRA Agents on Cloudflare Workers and Self-Hosted vLLM] (Link hier einfügen)

Would you bake your agent's knowledge into an adapter, or keep betting on prompts?

#LoRA #Cloudflare #vLLM #AIAgents #MLops

---

## Veröffentlichungs-Checkliste

- [ ] `png/titel.png` als Post-Bild (bereits exportiert, 2400x1350)
- [ ] Alternativ/Zusatz: `png/lora_adapter_flow.png` als zweites Bild
- [ ] Platzhalter "(Link hier einfügen)" durch die URL des veröffentlichten Artikels ersetzen
- [ ] Erst Artikel veröffentlichen, dann Post: der Link muss live sein
- [ ] Link in den ersten Kommentar, nicht in den Post-Body
- [ ] Hashtags: 5 Stück (Set oben)
