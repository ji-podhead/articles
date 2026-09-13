# LinkedIn Short-Post — Teaser für den gVisor/VLAN/Identity-Routing-Artikel

> **Status:** Entwurf, fertig zur Veröffentlichung (Englisch, LinkedIn Post).
> **Datum:** 13. September 2026.
> **Zweck:** Kurzer Feed-Post, der auf den Hauptartikel verlinkt
> ([2026-09-13-gvisor-workspace-isolation-linkedin.md](2026-09-13-gvisor-workspace-isolation-linkedin.md)).
> Bild: `titel.svg` (als PNG exportiert) als Post-Bild.

---

"We use gVisor, so our multi-tenant isolation is solid" is a sentence I keep hearing that's only a third true.

gVisor does exactly one job: it stops your application's syscalls from ever reaching the real host kernel. That's genuinely powerful. It is also **completely orthogonal to port collision, network isolation, and who can reach which container** — Docker already gives every container its own network namespace regardless of runtime. Conflating "kernel sandbox" with "network isolation" is the single most common mistake I see in this space.

The platforms actually running this safely at scale (Gitpod/Ona, Fly.io, and the CNCF's own Kubernetes Agent Sandbox reference architecture) all independently converged on the same THREE layers, not one:

→ **A kernel sandbox** (gVisor, or Firecracker microVMs) — stops a compromised container from escaping to the host.

→ **Local network segmentation** (VLANs/ipvlan) — stops one tenant's container from even seeing another tenant's container on the same box.

→ **Identity-based proxy routing** — no raw ports exposed at all; a shared reverse proxy authenticates *who* you are before routing you to *your* workspace, not *which port* you hit.

The part nobody explains clearly: each layer has an exact, nameable blind spot, and it's always precisely what one of the other two covers. Only the proxy? A legitimate user can still nmap-scan their neighbor on an unsegmented bridge. Only VLANs? One host kernel exploit and `ip link` undoes all of it. Only gVisor? It hands normal Ethernet frames straight to whatever network it's attached to — no VLAN, no protection.

Full breakdown — the exact gVisor internals (Sentry/Gofer/Netstack), the VLAN provisioning recipe, and three real production architectures side by side:

🔗 [The Bouncer, the Wall, and the Straitjacket: How Multi-Tenant Sandboxes Actually Stay Isolated] (Link hier einfügen)

Which of the three does your platform actually have today?

#CloudSecurity #Kubernetes #gVisor #Containers #DevSecOps #Sandboxing #PlatformEngineering

---

## Veröffentlichungs-Checkliste

- [ ] `titel.svg` → PNG konvertieren (bereits unter `png/titel.png`) und als Post-Bild anhängen
- [ ] Alternativ: `three_layers.svg` als zweites Bild (die Kaskade ist der stärkste Save/Share-Hook)
- [ ] Platzhalter „(Link hier einfügen)" durch die URL des veröffentlichten Artikels ersetzen
- [ ] Erst Artikel veröffentlichen, dann Post — der Link muss live sein
- [ ] Hashtags: 5–7 Stück
