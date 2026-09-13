# LinkedIn-Short-Post — Teaser für den Learning-Router-Artikel

> **Status:** Entwurf, fertig zur Veröffentlichung (Englisch, LinkedIn Post).
> **Datum:** 8. September 2026.
> **Zweck:** Kurzer Feed-Post, der auf den Hauptartikel verlinkt
> ([2026-09-08-learning-router-linkedin.md](2026-09-08-learning-router-linkedin.md)).
> Bild: `titel.svg` (als PNG exportiert) als Post-Bild.

---

Most LLM gateways treat every 429 the same: cool down for 5 seconds, move on. LiteLLM — the most popular one — does exactly that, whether the key costs $0 or $15 per million tokens.

We think that's the wrong abstraction. So our gateway runs three learning layers instead of one static strategy:

→ **The bandit with amnesia.** Every provider:model pair keeps a success/failure posterior that decays with a 2-day half-life — because providers change under you, and a reputation built over 6 months describes a provider that no longer exists.

→ **Punishment scaled to price.** Cooldown after a rate limit: free key = 5s, < $0.5/M = 30s, < $3/M = 60s, pricey = 5min. Credit exhaustion (402) = 24h bench. Retrying an empty paid account on a schedule is poker with your own money.

→ **Provider truth beats heuristics.** Every response carries live quota in x-ratelimit-* headers that most gateways ignore. We parse them per vendor (yes, NVIDIA swaps the header order), track shared pools (two keys, one account = one budget), and keep the most trustworthy source: header 1.0 > error body 0.75 > probe 0.6.

The rule that took a real bug to learn: **a provider-informed bench survives success.** A request succeeds on a key whose header said "exhausted until 14:30" — because the last drop went through while the window was already empty. The lucky 200 doesn't override the header.

And the ordering principle: **paid keys route last.** A paid key is never picked while a healthy free key exists.

Full breakdown — the decayed bandit, the cooldown economy, the quota-header parsing, and an honest comparison with LiteLLM:

🔗 [We Didn't Build a Router. We Built an Economy.] (Link hier einfügen)

What does your gateway do when a paid key and a free key rate-limit at the same time?

#LLM #AIEngineering #MLOps #AIInfrastructure #GoLang

---

## Veröffentlichungs-Checkliste

- [ ] `titel.svg` → PNG konvertieren (Snippet im Hauptartikel-Anhang) und als Post-Bild anhängen
- [ ] Alternativ: `layers.svg` als zweites Bild (die 3-Layer-Struktur ist der visuelle Hook)
- [ ] Platzhalter „(Link hier einfügen)" durch die URL des veröffentlichten Artikels ersetzen
- [ ] Erst Artikel veröffentlichen, dann Post — der Link muss live sein
- [ ] Hashtags: 5 Stück (LinkedIn-Optimum 3–5)
