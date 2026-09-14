**Status:** Entwurf, fertig zur Veröffentlichung (English, feed post)
**Datum:** 2026-09-16
**Zweck:** Teaser/Funnel für Part 2 der Attack-Surface-Serie
**Bild:** titel.png (titel.svg, 1200x675, exportiert 2x)

---

Part 1 showed how Shodan, FOFA, LeakIX and a handful of other public tools find every misconfigured server, bucket and AI deployment on the internet. Here's the part that actually matters: every one of those queries works against your own infrastructure too.

Ollama binds to localhost by design — it's the Docker Compose config that rebinds it to 0.0.0.0 that put ~175k instances on the open internet. Jupyter ships with a real token by default; the incidents come from someone disabling it "for local convenience" and that setting following the container to production. MongoDB's historical no-auth default was fine for a trusted internal network, right up until a cloud template opened the port outward.

None of these are exotic vulnerabilities. They're defaults that were correct once and never revisited. The fix, in every case: bind narrowly, authenticate explicitly, isolate at the network layer regardless of what the app does, and audit yourself with the same tools an attacker would use — on a schedule, not once.

Full article: [LINK-PLACEHOLDER]

#CyberSecurity #CloudSecurity #DevSecOps #AIInfrastructure #InfoSec

---

**Veröffentlichungs-Checkliste**

- [x] Titel-SVG → PNG exportiert (2x, 1200x675)
- [x] Spiegelt Part-1-Struktur 1:1 (jeder Fund → konkreter Fix)
- [ ] Alle externen Links live geprüft (Datum in Sources = letzter Lauf)
- [ ] Artikel-Link als erster Kommentar (nicht im Post-Body)
- [ ] Verweis auf Part 1 gesetzt
