**Status:** Entwurf, fertig zur Veröffentlichung (English, feed post)
**Datum:** 2026-09-16
**Zweck:** Teaser/Funnel für den RAG-Poisoning/Kill-Chain-Artikel
**Bild:** titel.png (titel.svg, 1200x675, exportiert 2x)

---

An open port and a poisoned vector database look like unrelated problems. In an agentic AI system, they're the same kill chain at two different stages.

RAG poisoning (PoisonedRAG, Zou et al.) plants attacker-controlled text somewhere your ingestion pipeline will retrieve it — the model treats it as trusted background, not as an instruction, because most RAG pipelines never structurally separate the two. On its own, that's a data-integrity problem. Chained with an exposed dev tool (credentials harvested from a readable .env) and a modified agent skill definition, it's full takeover: one ordinary user question triggers the retrieval, and the agent executes with whatever privileges it already had.

Three failure modes get conflated here — RAG poisoning, token glitches, and malicious skill execution — and they're structurally different faults. Worth knowing which one you're actually defending against, because the fix for each is different, and none of them substitutes for the others.

Full article: [LINK-PLACEHOLDER]

#AIsecurity #PromptInjection #RAG #LLMSecurity #AIAgents

---

**Veröffentlichungs-Checkliste**

- [x] Titel-SVG → PNG exportiert (2x, 1200x675)
- [x] PoisonedRAG-Zitat verifiziert (arXiv:2402.07867, Zou/Geng/Wang/Jia — Titel/Autoren bestätigt)
- [ ] Alle externen Links live geprüft (Datum in Sources = letzter Lauf)
- [ ] Artikel-Link als erster Kommentar (nicht im Post-Body)
