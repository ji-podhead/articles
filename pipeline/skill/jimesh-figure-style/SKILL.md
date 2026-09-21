---
name: jimesh-figure-style
description: "JiMesh article figure style: generate explanation diagram figures via the Google Stitch MCP. Base style extracted from the approved Agent Identity Console (M3-dark violet). Figures are STANDALONE DIAGRAMS for articles: no app chrome, no navigation, no mock UI — the full canvas is the diagram. Generate via MCP, download HTML, render 2x PNG + vector SVG locally."
---

# jimesh-figure-style

Article figures via Google Stitch MCP. Base style extracted from the
approved Agent Identity Console screen.

## The base style (from the approved screen)

- Canvas: **#0c0d18** full-bleed (no white edges anywhere)
- Panels: **#12131d**, elevated **#282935** / **#333440**, borders **#494454**
- Primary accent: **violet #d0bcff** (variants #d2bbff, #cebdff), status red #ffb4ab
- Text: **#e2e1f1**
- Radii: **sharp 2px** (no roundness)
- Label style: uppercase mono section titles; body Space Grotesk; numbers JetBrains Mono
- Full-bleed rule: the HTML must set html/body background #0c0d18 with margin 0
  (inject `html, body { background: #0c0d18 !important; margin: 0 !important }`)

## The figure format (what Stitch must produce)

A **standalone diagram figure for a technical article** — NOT a webpage,
NOT an app screen:

- NO navigation bar, NO app shell, NO mock product UI, NO buttons, NO tables
  of unrelated content
- The FULL canvas is one large flow chart / diagram with real labels and
  real numbers from the article
- Figure title small top-left (the diagram is the hero)
- Flow stages as panels left-to-right (or top-down) with arrow glyphs between
- Key takeaways as small chips below the flow
- Generous spacing, nothing overlapping

## Prompt template

`SCREEN: <Name> — Article Diagram. This is a STANDALONE DIAGRAM FIGURE for a
technical article: NO navigation, NO app chrome, NO mock product UI, NO
buttons. The FULL canvas is one large <flow chart / diagram> left to right.
Title top-left small: '<title>'. <THE DIAGRAM CONTENT with real labels and
numbers>. Style: dark #0c0d18 full-bleed canvas, panels #12131d with 2px
#333440 borders, violet #d0bcff accents, text #e2e1f1, sharp 2px radii,
label-caps mono section titles, Space Grotesk body, JetBrains Mono numbers,
generous spacing, nothing overlapping.`

## Workflow (MCP)

1. `generate_screen_from_text` `{projectId: "18208781056688578837",
   deviceType: "DESKTOP", prompt}` (60-120s; save the full response!)
2. Extract screenId + contribution URLs from the response (download
   IMMEDIATELY, signed URLs expire)
3. `edit_screens` refinement round: "Fix layout: nothing may overlap,
   increase spacing, full-bleed dark #0c0d18, no white edges. Keep content."
4. Download refined HTML, inject full-bleed CSS, render 2x PNG locally
   (chromium, workspace paths — snap cannot write /tmp), export vector SVG
   via print-to-pdf + pdftocairo (@page in pt = px * 0.75)
5. Pixel-verify: dark > 0.15, no near-100%-white areas
6. Overlap check (PFlicht): node scripts/check-overlap.js <html> — misst
   alle Elemente paarweise via headless-chromium-Probe; 0 Overlaps Pflicht
   (Stitch-Layouts ueberlappen haeufig: Titel ueber Stage-Karten, Navbar
   ueber Content). Fixe via edit_screens oder lokale CSS-Injektion
   (Abstand statt z-index).
7. Einmalig pro Repo: Settings > Pages > Source GitHub Actions.

## Local render chain

- PNG: chromium --headless=new --no-sandbox --screenshot=<workspace path>
  --window-size=1600,1000 --force-device-scale-factor=2 --hide-scrollbars
  "file://<html>"
- SVG: print-to-pdf in the workspace, pdftocairo -svg, @page size in pt
- Snap chromium cannot read/write /tmp — workspace paths only, double-quoted
  file:// URLs
