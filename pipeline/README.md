# Figure Pipeline

Alle Figuren werden aus deklarativen Specs generiert. Keine handgesetzten
Koordinaten mehr: d2 berechnet das Layout (Auto-Positionierung, Textumbruch
in Nodes, keine Ueberlappungen). Ueberschriebene Koordinaten sind der Fehler
der alten Figuren, nicht der Renderer.

## Werkzeuge

- **d2 v0.9.0** (installiert): Auto-Layout-Diagramme. Spec-Dateien in
  `d2/*.d2`, kompiliert zu SVG in Millisekunden. Theme 3 (Neutral Dark) als
  Haus-Look, Node-Farben per `style`-Block.
- **chromium** (headless): SVG -> PNG im 2x-Faktor (2400px-Klasse fuer Blogs).
- **render.js** (npm dagre, in diesem Ordner): nur noch fuer Tabellen-Figuren
  (`mode: table`), weil d2-SQL-Tabellen fuer Vergleichstabellen zu sperrig sind.

## Workflow fuer eine neue Figur

1. Spec schreiben: `pipeline/d2/<figure>.d2` (Nodes mit `label`-Key im Block,
   Farben per `style`, Kanten mit `a -> b: label`). Siehe
   `d2/lora_adapter_flow.d2` als Vorlage.
2. SVG rendern (Output direkt in den Artikel-Ordner):
   `cd pipeline && d2 --theme 3 d2/<figure>.d2 ../<article>/<figure>.svg`
3. PNG exportieren:
   `W=$(grep -oE 'width="[0-9]+"' ../<article>/<figure>.svg | head -1 | grep -oE '[0-9]+'); H=$(...)`
   `chromium --headless=new --disable-gpu --no-sandbox --screenshot=../<article>/png/<figure>.png --window-size=$W,$H --force-device-scale-factor=2 --hide-scrollbars file://<absoluter Pfad zum SVG>`
4. Spec committen: die .d2-Datei ist die Quelle, das SVG/PNG ist Artefakt.
   Nachmessen nachtraeglich ist damit obsolet: Spec aendern, neu rendern.

## Tabellen-Figur (render.js)

`node render.js specs/<name>.json ../<article>/<name>.svg` (Spec-Format:
`mode: table`, `cols`, `rows`, `title`). PNG-Export wie oben.

## Gotchas

- **Quoting-Falle (hat eine ganze Export-Runde erwischt)**: die file://-URL
  in double quotes oder als vorbereitete Variable. Single quotes lassen
  `$PWD` literal, Chromium rendert die deutsche Fehlerseite
  ("Website nicht erreichbar") ins PNG. Verifikation immer per Pixel-Sampling
  (5x5-Raster: Fehlerseite fast 100 Prozent weiss, echte Figures dunkel oder
  farbig), nie nur ueber Dimensionen.
- d2 verlangt Labels als `label: "..." `: im Block, NICHT `key: "label" { ... }`
  (quoted label + Block hintereinander ist ein Syntaxfehler).
- Style-Werte mit Semikolon trennen: `style: {stroke: "#4ade80"; fill: "#161b22"}`.
- Theme 3 setzt dunklen Hintergrund und helle Texte; eigene `stroke`/`font-color`
  ueberschreiben pro Node.
- d2 waehlt die Canvas-Groesse selbst (LR-Ketten werden breit); das Blog skaliert.
