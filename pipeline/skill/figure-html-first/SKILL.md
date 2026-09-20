---
name: figure-html-first
description: "Build article figures as self-contained HTML with CSS flex/grid only (no absolute positioning, no z-index, no negative margins - lint-enforced), render to 2x PNG via headless Chromium, and emit the markdown embed snippet. Use for any article figure: flows, comparisons, posters, title art."
---

# figure-html-first

Build figures as HTML. The browser does the layout (flex/grid), so overlaps
are impossible by construction. Rules are lint-enforced before every render.

## When to use

Any figure for an article or docs page: flows, comparisons, posters, title
art. For arrow-heavy directed graphs where arrows must route around boxes,
use d2 (`--theme 3 --layout elk`) instead — HTML-first figures connect
cards with arrow glyphs as flex items, which cannot overlap.

## Rules (lint-enforced, run scripts/lint-fig.sh before rendering)

1. **No** `position: absolute|fixed|sticky` — flex/grid only.
2. **No** `z-index` — no layers.
3. **No** negative margins, **no** transform-translate positioning.
4. `<meta charset="utf-8">` required.
5. Arrows are flex items (glyphs like &#8594; with an optional label span),
   never drawn overlays.
6. Design tokens via CSS variables in :root (see resources/tokens.css):
   canvas #0d1117, panels #161b22, ink #e6edf3/#8b949e, line #30363d,
   max two accent families per figure from green/blue/amber/red. No purple,
   no gradients, no emoji. Space Grotesk text, JetBrains Mono for code.

## Workflow

1. Write the HTML into `pipeline/html/<name>.html` (self-contained, inline
   styles in the head, body is the figure).
2. Lint: `pipeline/lint-fig.sh pipeline/html/<name>.html`
3. Render + embed: `pipeline/render-fig.sh pipeline/html/<name>.html
   <article-folder>` — produces `<article-folder>/png/<name>.png` at 2x
   and prints the markdown embed snippet (alt text + caption pattern).
4. Reference the PNG in the article markdown; the caption describes content
   only (no process talk, no em-dashes).
5. Commit the HTML (source of truth) and the PNG (artifact).

## Traps

- Chromium is a snap at /snap/bin/chromium: file:// URLs in double quotes,
  snap cannot read /tmp (keep measurement/screenshot files in the workspace).
- Window size defines the crop: set body width fixed (e.g. 1200px) and pick
  the window height to fit the content, or render tall and crop.
- Single-quoted file:// URLs keep $PWD literal and rasterize the browser
  error page into the PNG. Verify renders by pixel sampling (a 5x5 grid:
  an error page is near-100% white).
