# HANDOFF für Claude — JiMesh Brand-Assets (Badge, Hero, Wordmark)

Stand: 7.9.2026 · Vorgänger-Session: opencode (GLM). Dieser Text fasst zusammen, was gebaut wurde, was funktioniert und was offen ist.

## Ziel

Ein animiertes Brand-Logo („Circular Hub Badge" — dunkler Badge-Kreis, Cyan-Ring, 4 Mesh-Strahlen mit Knoten-Kugeln, weißer Igel-Kern) für die Navbar/Hero-Nutzung, plus Varianten. Alles in `repo-assets/brand/`.

## Datei-Inventar & Status

| Datei | Status |
|---|---|
| `variants/jimesh-circular-hub-badge-animated.svg` | Kernstück. SMIL-Animationen (funktionieren auch in `<img>`). Valide XML. Wird inline in `jimesh-hero.html` eingebettet (Tag: `<svg class="icon-svg" ... viewBox="-165 -165 1130 1130">`). |
| `variants/jimesh-wordmark.svg` | NEU: eigenständiger „JiMesh"-Schriftzug als **geometrische Letterform-Pfade** (kein Font!). Valide. |
| `jimesh-hero.html` | Brand-Loop (Aurora, Sternenfeld, Navbar-Lockup: Icon 200 px + Wordmark-SVG 92 px + Morph-Tagline-Panel). Achtung: historisch **nicht XHTML-valide** (`<meta>` ungeändert geschlossen) — Browser stören sich nicht daran, `xmllint`/expat schon. |
| `variants/jimesh-ant-mesh.svg`, `.../jimesh-ant-mesh copy.svg`, `.../jimesh-ant-mesh-neon.svg` | Würfel-Variante „NETMESH" — Namespace- + Geometrie-Fixes drin, aktuell pausiert. |
| `variants/jimesh-circular-hub-badge-neon.svg`, `.../jimesh-satellite-orbit.svg` | Statische Alternativen. |
| `variants/jimesh-circular-hub-badge.svg` | Plain-Badge (nicht animiert) — Basis der animierten Version. |

## Design-Konstanten (nicht ändern ohne Absprache)

- Farben: Badge-Grund `#0f172a→#1e293b` (Gradient), Ring `#38bdf8`, Beams `#e0f2fe`, Nodes grün `#10b981` (±249,−249), cyan `#38bdf8` (0,−350), grau `#94a3b8` (−350,0), Kern weiß `#f8fafc` (Gruppe `translate(0,-17)`, r=133). Markenverlauf `#22d3ee→#a78bfa`.
- Badge-Geometrie: Disc r=380 bei (400,400); Ring r=230; Nodes-Basispositionen: (±249,−249), (0,−350), (−350,0). Beams: Innensegmente enden an r≈230 (Ring), Außensegmente an den Nodes. Inneres D-Segment startet bei x=−120 (unter dem Kern! sonst Gap), innere Beam-Enden A/C bei (±94,∓94), B bei (0,−133).
- ViewBox animiertes Badge: `-165 -165 1130 1130` (Platz für auslaufende Strahlung).
- Hero: Icon 200 px (`.icon-wrap`, Anker `margin-left:-100px`), Wordmark-SVG 92 px Höhe, Morph-Text 48 px, `IDLE_MS=6000`, `HOLD_MS=2800`, Heartbeat `scale(1.015)` / 4,6 s.

## Animationssystem (SMIL, 21-s-Master-Zyklus)

1. **Kugel-Kaskade:** Jede der 4 großen Kugeln hat 3 unregelmäßige Events pro 21-s-Zyklus (`animate cx/cy` bzw. Strahl-`x2/y2` mit identischen keyTimes/keySplines): schnell raus (Ease-Out-Splines, verschiedene), 1,2–3,4 s halten, weich zurück. Distanzen 28–66 px entlang der Beam-Richtung (±45°-Diagonale, oben, links) — immer exakt kollinear zum Strahl.
2. **Paketfluss:** 11 leuchtende Punkte (`animateMotion` + Opacity-Fade) auf den Beams. Pfade enden **am Kugelrand der Basisposition** (nicht dahinter!), starten außerhalb des Rings (r≥242) bzw. ≥145 Einheiten vom Kernzentrum — **Pakete dürfen NIE über Kugeln, Ring oder den weißen Kern hinauslaufen**.
3. **Einschlag-Effekte an der Kugel** (begin = Paket-Arrival, Takt = Paket-dur):
   - Halo: `#a5f3fc`-Kreis hinter der Kugel blitzt (0→0,75→0).
   - Strahlung: EIN Halbkreis-Bogen (`path A`-Arc, Öffnung nach außen in Beam-Richtung), wird per `<g>`-Wrapper mit **identischem Translate-Keyframe-Set wie die Kugel** mitbewegt (Trigger sitzt also an der transformierten Position!), reist per zusätzlichem Translate-Wrapper nach außen (±48…65), skaliert 0,75→2, blendet bis 65 % der Dauer aus.
4. **Kern:** statisch, malt als Letztes — verdeckt alle Durchgänge in der Mitte.

## Verifikations-Setup (wichtig!)

- Chromium ist ein **Snap** und darf nur nach `~/Downloads` schreiben (NICHT `/tmp`!).
- Render: `chromium --headless --disable-gpu --no-sandbox --screenshot=out.png --window-size=800,800 [--virtual-time-budget=MS] file.svg`
- `--virtual-time-budget` ist bei SMIL+rAF-Kombination **nichtdeterministisch** — zwei Renders mit gleichem Budget können unterschiedliche Frames zeigen. Für Text-Zustand im Hero: `hero.html?still=1` (statischer Modus, Tagline immer sichtbar).
- ASCII-Sichtung: Pixel-Sampling per PIL (Tinten-Karte), dunkler Hintergrund via `--default-background-color=FF000000` bei hellen Assets.
- Hero-Laufzeit: Morph-Loop startet nach `IDLE_MS`; `prefers-reduced-motion` und `?still=1` deaktivieren CSS-Animationen (SMIL im Badge läuft weiter!).

## Offene Punkte (für Claude)

1. **Strahlungs-Trigger visuell verifizieren:** Nutzer meldete, der Flash erschien „in der Mitte hinter dem weißen Mascot" statt an der Kugel. Der mitlaufende `<g>`-Wrapper (identische 21s-Translate-Keyframes wie die Kugel-cx/cy-Animation) sollte das fixen — **bitte per Screenshot bei einem Kaskaden-High verifizieren** (z. B. Node A ext bei t≈0,5–2,5 s, Flash bei 1,0 s; Node B ext bei 1,3–4,2 s, Flash bei 2,0 s).
2. Halbkreis-Bogen öffnet aktuell in Beam-Richtung (A/C ±45° nach oben-außen, B oben, D links) — Richtung/Öffnungswinkel nach Nutzerwunsch prüfen.
3. README (`repo-assets/brand/README.md`) + `docs/backlog/BACKLOG.md` um `jimesh-wordmark.svg` ergänzen (Dokumentations-Mandat der Repo-CLAUDE.md).
4. Optional: SMIL-Animationen bei `prefers-reduced-motion` via JS entfernen (aktuell nur CSS-Animationen deaktiviert).
5. Optional: `jimesh-hero.html` zu gültigem XHTML machen (`<meta ... />`), falls Tooling meckert.

## Die Anforderungen des Nutzers (chronologisch, SINNGEMÄSS — seine Prompts)

1. „Die lila Linien müssen genau auf die Ecken des blauen Würfels zeigen und denselben Winkel haben wie die blaue Linie, auf die sie zeigen." — Speichen = exakte Kanten-Verlängerungen.
2. „Die gestrichelten Linien beim Würfel sind schief / überlappen." — echte verdeckte Kanten, keine Duplikate, nichts schneidet durch Flächen.
3. „Nimm den lila Ring raus, schwarzer Kreis als Hintergrund; Box in der Mitte größer."
4. „Warum rendert das SVG nicht?" → `<svg xmlns="http://w3.org">` ist falsch, muss `http://www.w3.org/2000/svg` sein (Gemini-Bug, trat wiederholt auf).
5. „Die viereckigen grünen Linien weiter runter / auf die unteren Würfel-Ecken / um die Seitenlänge transformieren, dass es aussieht als würde der Cube daraus kommen."
6. „Die Kugeln sollen nicht aus dem schwarzen Kreis ragen — gleicher Abstand zum Außenkreis wie die obere."
7. „Die vertikalen Seitenlinien haben keine 90 Grad" → Ursache: fehlende vordere Würfelkante + Stummel; ISO-Winkel 60°/120° sind Projektions-Feature, kein Fehler.
8. „Der JiMesh-Schriftzug im Badge: keine Standardschrift — eigene Letterforms, standalone SVG, passt zum Logo (Node-Dots, 45°-Geometrie)."
9. „Mach die Punkte und Linien cooler, als Alternativen speichern" → Badge-Neon + Satellite-Orbit.
10. „Paketfluss auf den Linien simulieren; Kugeln random skalieren/verschieben mit smoother Animation."
11. „Kugeln in Richtung ihres Strichs transformieren, Strich wächst mit; erst schnell dann langsam (Ease-Out)."
12. „Nicht alle gleichzeitig: eine transformiert, bleibt 1–2 s, dann die nächste; Abstände unterschiedlich, Haltedauer random mit Clamp."
13. „Kleine Kugeln dürfen NIEMALS über die weiße Linie, andere Kugeln oder den Kern hinaus. Wenn eine ankommt: große Kugel leuchtet auf."
14. „Strahlung statt Kugel: nur ein Halbkreis, startet an der transformierten Kugel, schießt in Beam-Richtung, wächst, blendet aus."
15. Hero: „Animiertes Badge einbauen; Heartbeat weniger stark/langsamer (beißt sich); Text-Hold länger; Navbar-Lockup: Logo+Schriftzug größer, kleiner seitlicher Abstand; dezente blinkende Sterne im Hintergrund; JiMesh-Schriftzug nicht vergessen."
16. „Hör auf, so lange nachzudenken" — Arbeitsstil: direkt fixen, kurz berichten, exakte Geometrie programmatisch verifizieren statt schätzen.
