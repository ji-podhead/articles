# JiMesh Brand-Assets

## Ordnerstruktur

- **`svg/`** — aktive Quell-SVGs. Jede Datei ist die editierbare Quelle; PNGs sind nur Exporte davon (nie umgekehrt).
- **`png/`** — gerenderte Exporte aus `svg/`, für Kontexte ohne SVG-Support (Reverse-Image-Search, Slack-Previews o.ä.).
- **`old/`** — archivierte Vorgänger-Designs (Igel/Hedgehog-Familie, Circular-Hub-Badge). Nicht mehr aktiv verlinkt, aber aus Referenzgründen aufgehoben statt gelöscht.
- **`jimesh-hero.html`** — eigenständiger Brand-Loop (eine Datei, keine Abhängigkeiten).
- **`HANDOFF-CLAUDE.md`** — Übergabe-Notizen aus der Entwicklung der animierten Circular-Hub-Variante (jetzt in `old/`); historisch, für den aktuellen Stand siehe diese Datei.

## `svg/` — aktuelle Logo-Kandidaten

| Datei | Zweck |
|---|---|
| `jimesh-mesh-cube.svg` | **Hauptkandidat „Mesh-Cube"**: hexagonales Mesh (6 Connector-Nodes, radial symmetrisch) um einen isometrischen Sandbox-Würfel, mit leuchtendem Core-Cube im Zentrum („Security-Rune"). Farbig, Neon-Glow, 800×800, zentriert auf (400,400). |
| `jimesh-mesh-cube-mono.svg` | Mesh-Cube monochrom über `currentColor` (frei einfärbbar) — für Inline-Einbindung in Seiten, die selbst die Farbe per CSS steuern. Kein eigener Hintergrund. |
| `jimesh-mesh-cube-neon-small.svg` | Farb-Variante mit verdickten Strichstärken/Radien + engerem Glow, für kleine Darstellungsgrößen (Favicon, Tab-Icon). Eigener dunkler Hintergrund-Kreis für garantierten Kontrast. |
| `jimesh-mesh-cube-mono-small.svg` | Wie oben, monochrom: **festes Weiß + eigener Hintergrund-Kreis** (kein `currentColor`-Fallback) — wichtig, weil `<img src="...svg">`-Einbindung (der übliche Favicon-Weg) NICHT von der Host-Seite erbt; ohne festen Kontrast wäre das Icon auf dunklem Grund unsichtbar. |
| `jimesh-wordmark.svg` | Eigenständiger „JiMesh"-Schriftzug als geometrische Letterform-Pfade (Monoline, font-unabhängig). M- und e-Glyph wurden gefixt (lasen sich vorher als „JiNssh"). |
| `jimesh-text-solo.svg` | „JIMESH" + Subtitle „GATEWAY, LLM & APP SECURITY", echter Font (Segoe UI). |
| `jimesh-text-solo-plain.svg` | Wie oben, aber **ohne** die Subtitle-Zeile — nur „JIMESH", für Platzierung über eigenem animiertem Untertext. |

**Getestete Lesbarkeit bei Icon-Größen** (echter `<img width/height>`-Scaling-Test, nicht nur Browserfenster-Crop): Mesh-Cube liest sich ab 32px klar, bei 16px noch als erkennbarer Punkt-Cluster im Kreis — am unteren Ende des Machbaren, aber funktional, auf hellem wie dunklem Grund (dank eigenem Hintergrund-Kreis in den `-small`-Varianten).

**Offen:** Die 4 diagonalen Mesh-Edges (oben-links/rechts, unten-links/rechts) sind aktuell keine exakten Verlängerungen der Würfelkanten, sondern gespiegelte Diagonalen mit gleichem Winkel-Betrag — optisch stimmig, aber geometrisch keine echte Kantenfortsetzung. Rein senkrechte Edges (oben/unten) passen bereits exakt.

## `jimesh-hero.html` — wie der Loop funktioniert

Layout: Icon (`.icon-wrap`, animiertes Circular-Hub-Badge, `old/jimesh-circular-hub-badge-animated.svg` inline) + Wordmark (`.wordmark-wrap`, geometrische Letterforms) + Capability-Tagline (`.text-area`, morphender String rechts daneben).

- **Heartbeat**: `.icon-wrap` skaliert sanft (1 → 1.015 → 1), 4,6 s, endlos.
- **Shine-Sweep**: `.wordmark-shine` — alle 10 s läuft ein Lichtstreif diagonal über den **Schriftzug** (nicht mehr über das Icon; Maske ist der `overflow:hidden`-Wrapper des Wordmarks statt einer Kreis-Maske).
- **Capability-Morph**: alle `IDLE_MS` (6000 ms) klappt das Text-Panel rechts vom Wordmark auf, ein String aus `STRINGS` (`script`-Block) wird per Wipe-Reveal/Scramble eingeblendet, hält `HOLD_MS` (2800 ms), blendet aus, Panel klappt zu.
- `prefers-reduced-motion` bzw. `?still=1` → statisches Frame, Text-Panel dauerhaft offen, keine CSS-Animationen (SMIL im Badge läuft weiter).

**Bekannter Punkt:** Die Strahlungs-/Flash-Trigger an den 4 äußeren Kugeln des animierten Badges sind korrekt positioniert (folgen der Kugel-Kaskade), aber pro 21-s-Zyklus nur ~0,7 s sichtbar — leicht zu übersehen, technisch aber funktionsfähig.

## Benutzen

- `jimesh-hero.html` direkt im Browser öffnen (kein Server nötig).
- Einbetten: `<iframe src="jimesh-hero.html" style="width:100%;height:100vh;border:0"></iframe>`
- Tuning: `STRINGS` / `IDLE_MS` / `HOLD_MS` oben im `<script>`; Marken-Verlauf `#22d3ee` → `#a78bfa`.
