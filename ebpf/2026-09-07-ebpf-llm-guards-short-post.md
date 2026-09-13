# Blog-Post — Teaser für den Hauptartikel

> **Status:** Entwurf, fertig zur Veröffentlichung (English, blog post).
> **Datum:** 7. September 2026.
> **Zweck:** Kurzer Feed-Post, der auf den Hauptartikel verlinkt
> ([2026-09-07-ebpf-llm-guards-blogpost.md](2026-09-07-ebpf-llm-guards-blogpost.md)).
> Bild: `titel.svg` (als PNG exportiert) als Post-Bild.

---

A prompt injection made one of our AI agents dump `.env` files into a chat log — and then tried to escape the host through a mounted Docker socket.

We spent the weeks after that incident deep in the kernel. Here's what we learned about stopping prompt injection with eBPF:

→ eBPF can tap the prompt as **plaintext** at the TLS boundary (uprobe on `SSL_write`/`SSL_read`) — zero code changes, the kernel does the intercepting.

→ But you can't run an ML classifier in the kernel. The pattern is: eBPF captures → ring buffer → tiny userspace classifier (Prompt Guard 2 at 22M params, or embeddings + XGBoost, sub-millisecond) → verdict back via eBPF map → SIGSTOP.

→ It has hard limits: Go binaries use `crypto/tls` (no stable C symbols), streaming defeats pure kernel detection, and there's no eBPF inside gVisor.

→ And the uncomfortable truth: **a verdict is worthless if you don't know whom to freeze.** Commercial LLM firewalls return a judgment — and stop there. None of them can pause the container that made the call, because none of them provisioned it.

The full breakdown — the 4-step eBPF pipeline, the honest limits, the complete tool landscape (LiteLLM, LLM Guard, Lakera/Check Point, Portkey/Palo Alto, TigerGate, AgentSight), and the identity chain that turns detection into enforcement — is in the article:

🔗 [Stopping Prompt Injection at the Kernel Level: How eBPF + LLM Guards Actually Work] (Link hier einfügen)

The cheapest control that would have caught our incident? Regex secret-pattern masking on responses. Microseconds. No model needed.

What's your stack doing about prompt injection — guardrail library, gateway scanner, or kernel?

#PromptInjection #eBPF #LLMSecurity #AIAgents #CyberSecurity #DevSecOps #KernelSecurity #AIInfrastructure #OpenSource #VibeCoding

---

## Veröffentlichungs-Checkliste

- [ ] `titel.svg` → PNG konvertieren (`rsvg-convert -w 1200 titel.svg > titel.png`) und als Post-Bild anhängen
- [ ] Alternativ: `pipeline.svg` als zweites Bild (die 6-Schritte-Pipeline ist der visuelle Hook)
- [ ] Platzhalter „(Link hier einfügen)" durch die URL des veröffentlichten Artikels ersetzen
- [ ] Erst Artikel veröffentlichen, dann Post — der Link muss live sein
- [ ] Hashtags am Ende: 10 Stück (3–5 work best; keep the first 5 if in doubt: `#PromptInjection #eBPF #LLMSecurity #AIAgents #CyberSecurity`)
