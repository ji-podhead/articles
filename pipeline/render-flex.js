#!/usr/bin/env node
// Flex-SVG renderer: JSON spec -> house-style SVG.
// Layout by yoga (Meta flexbox engine). Text widths are MEASURED by headless
// Chromium (getBoundingClientRect per word, sans and mono families), so boxes
// always fit their text: no estimation, no overflow, no foreignObject.
// Extra node types: code (monospace card), cards carry optional logo (brand
// SVG from pipeline/logos, embedded as data URI).
// Usage: node render-flex.js spec.json out.svg
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const cp = require("child_process");
const router = require("./arrow-router.js");
let Y = null; // yoga, assigned in main() via dynamic import (3.x is ESM)

const LH = 21, TITLE_PX = 30, SUB_PX = 17, FS = 15, TFS = 15, CFS = 13.5;
const C = {
  green: "#4ade80", blue: "#60a5fa", amber: "#f59e0b", purple: "#a78bfa",
  red: "#f87171", gray: "#8b949e", white: "#ffffff"
};
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function col(name, fb) {
  if (name && String(name).charAt(0) === "#") return name; // hex direkt durchreichen
  return C[name] || fb || "#8b949e";
}

// ---------- text measurement via chromium ----------
const FAMS = {
  sans: "'Space Grotesk', 'DejaVu Sans', Verdana, sans-serif",
  mono: "'JetBrains Mono', 'DejaVu Sans Mono', monospace"
};
let widths = {}; // key: px|bold|fam|word
function measureAll(items) {
  if (!items.length) return;
  const dir = fs.mkdtempSync(path.join(__dirname, ".meas-")); // chromium kann /tmp nicht lesen
  const spans = items.map((it, i) =>
    '<span style="font-size:' + it[1] + "px;" + (it[2] ? "font-weight:bold;" : "") +
    "font-family:" + FAMS[it[3]] + ';white-space:pre;">' + esc(it[0]) + "</span>").join("");
  const html = '<!doctype html><html><head><meta charset="utf-8">' +
    '<style>body{margin:0;background:#fff}</style></head><body>' + spans +
    '<pre id="out"></pre><script>const sp=[...document.querySelectorAll("span")];' +
    'document.getElementById("out").textContent="MEAS:"+JSON.stringify(sp.map(s=>s.getBoundingClientRect().width));' +
    "</" + "script></body></html>";
  fs.writeFileSync(path.join(dir, "m.html"), html);
  const env = { ...process.env, PATH: "/snap/bin:" + process.env.PATH }; // snap chromium liegt nur dort
  const out = cp.execFileSync("chromium", [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--virtual-time-budget=3000", "--dump-dom", "file://" + path.join(dir, "m.html")
  ], { maxBuffer: 20 * 1024 * 1024, env }).toString();
  const m = out.match(/MEAS:(\[[^\]]*\])/);
  if (!m) { console.error("measure failed; fallback to estimation"); return; }
  const vals = JSON.parse(m[1]);
  items.forEach((it, i) => {
    widths[it[1] + "|" + (it[2] ? 1 : 0) + "|" + it[3] + "|" + it[0]] = vals[i];
  });
  fs.rmSync(dir, { recursive: true, force: true });
}
function w(text, px, bold, fam) {
  const key = px + "|" + (bold ? 1 : 0) + "|" + fam + "|" + text;
  if (widths[key] !== undefined) return widths[key];
  return String(text).length * px * (bold ? 0.68 : 0.62); // fallback
}
function sp(px, bold, fam) {
  const k = px + "|" + (bold ? 1 : 0) + "|" + fam + "| ";
  return widths[k] !== undefined ? widths[k] : px * 0.32;
}
function wrap(s, maxPx, px, bold, fam) {
  fam = fam || "sans";
  const words = String(s).split(/\s+/).filter(Boolean);
  const out = []; let cur = ""; let curW = 0;
  const gap = sp(px, bold, fam);
  for (const wd of words) {
    const wW = w(wd, px, bold, fam);
    const cand = curW ? curW + gap + wW : wW;
    if (cand > maxPx && cur) { out.push(cur); cur = wd; curW = wW; }
    else { cur = cur ? cur + " " + wd : wd; curW = cand; }
  }
  if (cur) out.push(cur);
  return out.length ? out : [""];
}

// ---------- word collection for the measure pass ----------
const allWords = new Set();
function collect(text, px, bold, fam) {
  fam = fam || "sans";
  for (const wd of String(text).split(/\s+/).filter(Boolean)) allWords.add([wd, px, bold ? 1 : 0, fam].join("\u0000"));
  allWords.add([" ", px, bold ? 1 : 0, fam].join("\u0000"));
}
function tuple(key) { const p = key.split("\u0000"); return [p[0], Number(p[1]), p[2] === "1", p[3]]; }

// ---------- logos ----------
const logoCache = {};
function logoURI(brand) {
  if (!(brand in logoCache)) {
    try {
      const b = fs.readFileSync(path.join(__dirname, "logos", brand + ".svg"));
      logoCache[brand] = "data:image/svg+xml;base64," + b.toString("base64");
    } catch (e) { logoCache[brand] = null; }
  }
  return logoCache[brand];
}

// ---------- yoga ----------
const boxById = {};
function setJustify(y, j) {
  const map = { "center": Y.JUSTIFY_CENTER, "flex-end": Y.JUSTIFY_FLEX_END, "space-between": Y.JUSTIFY_SPACE_BETWEEN };
  if (map[j]) y.setJustifyContent(map[j]);
}
function setAlign(y, a) {
  const map = { "center": Y.ALIGN_CENTER, "flex-end": Y.ALIGN_FLEX_END, "stretch": Y.ALIGN_STRETCH, "flex-start": Y.ALIGN_FLEX_START };
  if (map[a]) y.setAlignItems(map[a]);
}
function applyBox(y, st) {
  if (st.gap) y.setGap(Y.GUTTER_ALL, st.gap);
  if (st.flexWrap) y.setFlexWrap(Y.WRAP_WRAP);
  if (st.flexGrow) y.setFlexGrow(st.flexGrow);
  if (typeof st.width === "number") y.setWidth(st.width);
  if (st.minWidth) y.setMinWidth(st.minWidth);
  if (st.maxWidth) y.setMaxWidth(st.maxWidth);
  if (typeof st.height === "number") y.setHeight(st.height);
  if (st.padding) y.setPadding(Y.EDGE_ALL, st.padding);
}
function setFlexDir(y, d) {
  if (d === "row") y.setFlexDirection(Y.FLEX_DIRECTION_ROW);
  else y.setFlexDirection(Y.FLEX_DIRECTION_COLUMN);
}
function cardMetrics(n) {
  const st = n.style || {};
  const boxW = st.width || st.maxWidth || 380; // wrap an der WIRKSAMEN Breite
  const isCode = n.type === "code";
  const px = isCode ? CFS : FS;
  const fam = isCode ? "mono" : "sans";
  const budget = boxW - 36 - (n.logo ? 38 : 0);
  const titleLines = n.title ? wrap(n.title, budget, TFS, true, "sans") : [];
  const lines = n.lines ? n.lines.flatMap(l => wrap(l, boxW - 36, px, false, fam)) : [];
  const wMax = Math.max(
    titleLines.reduce((a, l) => Math.max(a, w(l, TFS, true, "sans")), 0),
    lines.reduce((a, l) => Math.max(a, w(l, px, false, fam)), 0),
    120
  );
  const h = (titleLines.length + lines.length) * LH + 24;
  return { titleLines, lines, w: (st.width ? st.width : Math.min(boxW, Math.ceil(wMax + 36))), h: Math.ceil(h) };
}
function build(n) {
  const y = Y.Node.create();
  const st = n.style || {};
  setFlexDir(y, (n.type === "row") ? "row" : "column");
  setJustify(y, st.justify);
  setAlign(y, st.align);
  applyBox(y, st);
  if (n.id) boxById[n.id] = { node: y, spec: n };
  if (n.type === "card" || n.type === "code") {
    const m = cardMetrics(n);
    y.setHeight(m.h);
    if (!st.width && !st.flexGrow) y.setWidth(m.w);
    y.setPadding(Y.EDGE_ALL, 12);
  }
  if (n.type === "text") {
    const tpx = st.fontSize || 17;
    y.setHeight(Math.ceil((n.lines || []).length * tpx * 1.35 + 8)); // ohne Hoehe rechnet yoga 0 = Ueberlappung
  }
  if (n.type === "chip") {
    y.setHeight(38);
    y.setWidth(Math.min(560, Math.ceil(w(n.text, 14.5, false, "sans") + 30)));
    if (st.flexGrow) y.setFlexGrow(st.flexGrow);
  }
  for (const c of (n.children || [])) y.insertChild(build(c), y.getChildCount());
  return y;
}

// ---------- emit ----------
function render(n, y, x0, y0, parts) {
  const x = x0 + y.getComputedLeft();
  const yy = y0 + y.getComputedTop();
  const wBox = y.getComputedWidth();
  const hBox = y.getComputedHeight();
  const st = n.style || {};
  if (n.type === "card" || n.type === "code") {
    const isCode = n.type === "code";
    const border = n.color ? col(n.color) : "#30363d";
    const titleCol = n.color ? col(n.color) : "#e6edf3"; // neutrale Karten sonst unsichtbar
    const fill = isCode ? "#1c2128" : "#161b22";
    parts.push('<rect x="' + Math.round(x) + '" y="' + Math.round(yy) + '" width="' + Math.round(wBox) + '" height="' + Math.round(hBox) + '" rx="11" fill="' + fill + '" stroke="' + border + '" stroke-width="2"/>');
    if (n.color && n.color !== "gray") {
      parts.push('<rect x="' + Math.round(x) + '" y="' + Math.round(yy) + '" width="5" height="' + Math.round(hBox) + '" rx="2.5" fill="' + border + '"/>');
    }
    const m = cardMetrics(n);
    let ty = yy + 12 + 14;
    if (n.logo) {
      const uri = logoURI(n.logo);
      if (uri) parts.push('<image href="' + uri + '" x="' + Math.round(x + wBox - 38) + '" y="' + Math.round(yy + 10) + '" width="24" height="24"/>');
    }
    for (const l of m.titleLines) {
      parts.push('<text x="' + Math.round(x + 18) + '" y="' + Math.round(ty) + '" font-size="' + TFS + '" font-weight="bold" fill="' + titleCol + '">' + esc(l) + "</text>");
      ty += LH;
    }
    for (const l of m.lines) {
      const px = isCode ? CFS : FS;
      const fam = isCode ? "mono" : "sans";
      const fill2 = isCode ? "#79c0ff" : "#c9d1d9";
      parts.push('<text x="' + Math.round(x + 18) + '" y="' + Math.round(ty) + '" font-size="' + px + '" fill="' + fill2 + '" font-family="' + FAMS[fam] + '">' + esc(l) + "</text>");
      ty += LH;
    }
  }
  if (n.type === "chip") {
    const stroke = col(n.color, "#30363d");
    parts.push('<rect x="' + Math.round(x) + '" y="' + Math.round(yy) + '" width="' + Math.round(wBox) + '" height="' + Math.round(hBox) + '" rx="9" fill="#0d1117" stroke="' + stroke + '" stroke-width="1.5"/>');
    parts.push('<text x="' + Math.round(x + 15) + '" y="' + Math.round(yy + 25) + '" font-size="14.5" fill="#c9d1d9">' + esc(n.text) + "</text>");
  }
  if (n.type === "text") {
    const px = st.fontSize || 17;
    let lyy = yy + px;
    for (const l of (n.lines || [])) {
      parts.push('<text x="' + Math.round(x) + '" y="' + Math.round(lyy) + '" font-size="' + px + '"' + (st.bold ? ' font-weight="bold"' : "") + ' fill="' + (st.color || "#e6edf3") + '">' + esc(l) + "</text>");
      lyy += px * 1.35;
    }
  }
  for (const c of (n.children || [])) render(c, c.__yoga, x, yy, parts);
}
function drawArrows(spec, parts, ox, oy) {
  const markers = {}; let mi = 0;
  const boxes = [];
  for (const id of Object.keys(boxById)) {
    const b = boxById[id].abs || {
      x: ox + boxById[id].node.getComputedLeft(),
      y: oy + boxById[id].node.getComputedTop(),
      w: boxById[id].node.getComputedWidth(),
      h: boxById[id].node.getComputedHeight()
    };
    boxes.push({ id, x: b.x, y: b.y, w: b.w, h: b.h });
  }
  for (const a of (spec.connect || [])) {
    const A = boxById[a.from], B = boxById[a.to];
    if (!A || !B) continue;
    const ax = A.abs.x, ay = A.abs.y, aw = A.abs.w, ah = A.abs.h;
    const bx = B.abs.x, by = B.abs.y, bw = B.abs.w, bh = B.abs.h;
    const cx1 = ax + aw / 2, cy1 = ay + ah / 2;
    const cx2 = bx + bw / 2, cy2 = by + bh / 2;
    // Ankerkandidaten nach Box-Beziehung: vertikal getrennte Boxen unten/top,
    // bei Blockierung Seiten-Eintritt (Ziel links/rechts, Quelle rechts/links).
    const gapY = Math.max(by - (ay + ah), ay - (by + bh));
    const gapX = Math.max(bx - (ax + aw), ax - (bx + bw));
    const pairs = [];
    if (gapY > 6 && cy2 > cy1) {
      pairs.push([{ x: cx1, y: ay + ah }, { x: cx2, y: by }]);
      pairs.push([{ x: cx1, y: ay + ah }, { x: bx, y: cy2 }]);
      pairs.push([{ x: cx1, y: ay + ah }, { x: bx + bw, y: cy2 }]);
      pairs.push([{ x: ax + aw, y: cy1 }, { x: cx2, y: by }]);
      pairs.push([{ x: ax, y: cy1 }, { x: cx2, y: by }]);
    } else if (gapY > 6) {
      pairs.push([{ x: cx1, y: ay }, { x: cx2, y: by + bh }]);
      pairs.push([{ x: cx1, y: ay }, { x: bx, y: cy2 }]);
      pairs.push([{ x: cx1, y: ay }, { x: bx + bw, y: cy2 }]);
      pairs.push([{ x: ax + aw, y: cy1 }, { x: cx2, y: by + bh }]);
      pairs.push([{ x: ax, y: cy1 }, { x: cx2, y: by + bh }]);
    } else if (gapX > 6 && cx2 > cx1) {
      pairs.push([{ x: ax + aw, y: cy1 }, { x: bx, y: cy2 }]);
      pairs.push([{ x: ax + aw, y: cy1 }, { x: cx2, y: by }]);
      pairs.push([{ x: ax + aw, y: cy1 }, { x: cx2, y: by + bh }]);
      pairs.push([{ x: cx1, y: ay + ah }, { x: bx, y: cy2 }]);
      pairs.push([{ x: cx1, y: ay }, { x: bx, y: cy2 }]);
    } else if (gapX > 6) {
      pairs.push([{ x: ax, y: cy1 }, { x: bx + bw, y: cy2 }]);
      pairs.push([{ x: ax, y: cy1 }, { x: cx2, y: by }]);
      pairs.push([{ x: ax, y: cy1 }, { x: cx2, y: by + bh }]);
      pairs.push([{ x: cx1, y: ay + ah }, { x: bx + bw, y: cy2 }]);
      pairs.push([{ x: cx1, y: ay }, { x: bx + bw, y: cy2 }]);
    } else if (Math.abs(cx2 - cx1) >= Math.abs(cy2 - cy1)) {
      pairs.push([{ x: ax + aw, y: cy1 }, { x: bx, y: cy2 }]);
      pairs.push([{ x: ax, y: cy1 }, { x: bx + bw, y: cy2 }]);
      pairs.push([{ x: cx1, y: ay + ah }, { x: cx2, y: by }]);
      pairs.push([{ x: cx1, y: ay }, { x: cx2, y: by + bh }]);
    } else {
      pairs.push([{ x: cx1, y: ay + ah }, { x: cx2, y: by }]);
      pairs.push([{ x: cx1, y: ay }, { x: cx2, y: by + bh }]);
      pairs.push([{ x: ax + aw, y: cy1 }, { x: bx, y: cy2 }]);
      pairs.push([{ x: ax, y: cy1 }, { x: bx + bw, y: cy2 }]);
    }
    const PADR = 8;
    const blockers = boxes.filter(b => b.id !== a.from && b.id !== a.to).map(b => ({ x: b.x - PADR, y: b.y - PADR, w: b.w + 2 * PADR, h: b.h + 2 * PADR }));
    // from/to selbst schrumpft als Blocker: L-Schlenker duerfen nicht durch die
    // eigene Quell-/Ziel-Box tunneln (nur die Anker-Endpunkte liegen auf der Kante)
    for (const E of [A.abs, B.abs]) blockers.push({ x: E.x + 12, y: E.y + 12, w: E.w - 24, h: E.h - 24 });
    function routeHits(pts) {
      let n = 0;
      for (let i = 0; i + 1 < pts.length; i++) for (const b of blockers) if (router.segHitsRect(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, b)) { n++; break; }
      return n;
    }
    let pts = router.route(pairs[0][0], pairs[0][1], blockers);
    let bestH = routeHits(pts);
    for (let i = 1; i < pairs.length && bestH > 0; i++) {
      const r = router.route(pairs[i][0], pairs[i][1], blockers);
      const h = routeHits(r);
      if (h < bestH) { pts = r; bestH = h; }
    }
    const stroke = col(a.color, "#8b949e");
    if (!markers[stroke]) {
      markers[stroke] = "ar" + (++mi);
      parts.push('<marker id="' + markers[stroke] + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="' + stroke + '"/></marker>');
    }
    const pl = pts.map(p => Math.round(p.x) + "," + Math.round(p.y)).join(" ");
    parts.push('<polyline points="' + pl + '" fill="none" stroke="' + stroke + '" stroke-width="2.2" marker-end="url(#' + markers[stroke] + ')"/>');
    if (a.label) {
      const lines = wrap(a.label, 180, 13, false, "sans");
      const bw2 = Math.max(...lines.map(l => w(l, 13, false, "sans"))) + 14;
      const bh2 = lines.length * 17 + 8;
      // Label aufs laengste geroutete Segment
      let segI = 0, segLen = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const d = Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
        if (d > segLen) { segLen = d; segI = i; }
      }
      const mx = (pts[segI].x + pts[segI + 1].x) / 2, my = (pts[segI].y + pts[segI + 1].y) / 2;
      parts.push('<rect x="' + Math.round(mx - bw2 / 2) + '" y="' + Math.round(my - bh2 / 2) + '" width="' + Math.round(bw2) + '" height="' + Math.round(bh2) + '" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="1"/>');
      let lyy = my - bh2 / 2 + 15;
      for (const l of lines) {
        parts.push('<text x="' + Math.round(mx) + '" y="' + Math.round(lyy) + '" font-size="13" fill="#8b949e" text-anchor="middle">' + esc(l) + "</text>");
        lyy += 17;
      }
    }
  }
}
function titleH2(spec, W) {
  const lines = spec.title ? wrap(spec.title, W - 80, TITLE_PX, true, "sans") : [];
  return lines.length * 40 + (spec.subtitle ? 36 : 0) + (lines.length ? 30 : 0);
}
function renderFlex(spec) {
  const W = spec.width || 1200;
  const pad = spec.padding || 40;
  // measurement pass: gather every string
  (function scan(n) {
    if (n.title) collect(n.title, TFS, true, "sans");
    for (const l of (n.lines || [])) collect(l, n.type === "code" ? CFS : FS, false, n.type === "code" ? "mono" : "sans");
    if (n.type === "chip") collect(n.text, 14.5, false, "sans");
    if (n.type === "text") collect((n.lines || []).join(" "), (n.style && n.style.fontSize) || 17, !!(n.style && n.style.bold), "sans");
    for (const c of (n.children || [])) scan(c);
  })(spec.tree);
  if (spec.title) collect(spec.title, TITLE_PX, true, "sans");
  if (spec.subtitle) collect(spec.subtitle, SUB_PX, false, "sans");
  for (const a of (spec.connect || [])) if (a.label) collect(a.label, 13, false, "sans");
  measureAll([...allWords].map(tuple));
  // layout
  const yroot = build(spec.tree);
  yroot.calculateLayout(W - 2 * pad, undefined, Y.DIRECTION_LTR);
  const ch = Math.ceil(yroot.getComputedHeight());
  yroot.calculateLayout(W - 2 * pad, ch, Y.DIRECTION_LTR);
  const H = titleH2(spec, W) + ch + 34;
  const parts = [];
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" font-family="\'Space Grotesk\', DejaVu Sans, Verdana, sans-serif">');
  parts.push('<rect width="' + W + '" height="' + H + '" fill="#0d1117"/>');
  let ty = 54;
  for (const l of wrap(spec.title || "", W - 80, TITLE_PX, true, "sans")) {
    parts.push('<text x="40" y="' + ty + '" font-size="' + TITLE_PX + '" font-weight="bold" fill="#ffffff" letter-spacing="-0.5">' + esc(l) + "</text>");
    ty += 40;
  }
  if (spec.subtitle) parts.push('<text x="40" y="' + (ty + 6) + '" font-size="' + SUB_PX + '" fill="#8b949e">' + esc(spec.subtitle) + "</text>");
  (function attach(n, y, x0, y0) {
    n.__yoga = y;
    if (n.id && boxById[n.id]) {
      boxById[n.id].abs = {
        x: x0 + y.getComputedLeft(),
        y: y0 + y.getComputedTop(),
        w: y.getComputedWidth(),
        h: y.getComputedHeight()
      };
    }
    const kids = n.children || [];
    for (let i = 0; i < kids.length; i++) attach(kids[i], y.getChild(i), x0 + y.getComputedLeft(), y0 + y.getComputedTop());
  })(spec.tree, yroot, pad, titleH2(spec, W));
  render(spec.tree, yroot, pad, titleH2(spec, W), parts);
  drawArrows(spec, parts, pad, titleH2(spec, W));
  parts.push("</svg>");
  return parts.join("\n");
}
async function main() {
  const mod = await import("yoga-layout");
  Y = (mod.default && mod.default.Node) ? mod.default : mod;
  const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const out = renderFlex(spec);
  if (process.argv[3]) { fs.writeFileSync(process.argv[3], out); console.error("wrote " + process.argv[3]); }
  else process.stdout.write(out);
}
main().catch(e => { console.error(String(e)); process.exit(1); });
