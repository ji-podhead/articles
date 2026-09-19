# JULES TASK: Figure Polish on the articles repo

## Context (read first)

- The repo uses a figure pipeline: specs in `pipeline/specs/` are the source
  of truth; renderers are `pipeline/render-flex.js` (yoga flex + chromium
  text measurement + orthogonal arrow router), `pipeline/render.js`
  (table mode), and d2 (`--theme 3 --layout elk`) for graph figures.
- Design tokens: `skills/figure-design-taste.md` in the agentic-knowledge
  repo (also summarized in `pipeline/README.md`): dark canvas #0d1117,
  cards #161b22, max two accent families per figure (green #3fb950,
  blue #4493f8, amber #d29922, red #f85149), never purple, never gradients,
  Space Grotesk for text, JetBrains Mono for code/numbers.
- **Hard rule: every text string in a figure must survive 1:1** (the specs
  carry all content; if you redesign, keep every label, number, and caption
  line — counts may change only via line-wrapping).
- **Do NOT touch any `titel.svg`** (title heroes) — they are final.
- Do not change blogpost markdown files; figure file names are immutable.

## Task

Improve the visual quality of the flex-generated figures (the current
output works geometrically but reads flat and generic). For each figure
spec under `pipeline/specs/*.flex.json`:

1. Refine spacing and hierarchy: title zone tightened, card padding
   consistent (14-16), group related cards with tighter gaps than unrelated
   ones (18 vs 28), let rows breathe (ranksep feel via explicit spacer rows
   or larger container gaps).
2. Strengthen the visual message: the primary path gets the accent color;
   neutral cards stay gray; one accent family for structure, one for
   emphasis. Remove decorative accents that carry no meaning.
3. Use the code card type (`type: code`) for any command-like lines and
   the `logo` field (brands from `pipeline/logos/`) where a tool is
   clearly named by the card text (docker, cloudflare, kubernetes,
   postgresql, redis, grafana, vault, ollama, nvidia, huggingface,
   tailscale, github, prometheus, surrealdb, hashicorp, anthropic).
4. Re-render and export: run the sweep commands from
   `pipeline/README.md` (render, then chromium 2x PNG export — always
   double-quoted file:// URLs; chromium is a snap at /snap/bin/chromium).
5. Verify per figure: PNG dimensions are exactly 2x the SVG header; pixel
   grid check (5x5: error pages are near-100% white, real output is dark);
   no text outside its card (the measured renderer guarantees this if you
   do not bypass cardMetrics).
6. Work on a branch `jules/figure-polish`, one commit per article folder,
   and summarize per figure what changed visually.

## Known traps

- `chips` at spec top level are ignored by render-flex.js; put chips as
  `{"type":"chip","text":"..."}` nodes inside the tree.
- Cards without a `color` field are neutral (light title, gray border) —
  that is intended.
- The ortho arrow router anchors on absolute positions; do not add hand
  coordinates anywhere.
- If a figure has arrows AND heavy nesting, consider converting it to a d2
  spec (`d2 --theme 3 --layout elk`) instead — d2 owns edge routing.

## Out of scope

- The three fallback figures (bad_fallback / good_fallback /
  good_fallback_small in llm-mesh-intro) have no SVG sources; leave them.
- The three overview/knowledge repos; this task is the articles repo only.
