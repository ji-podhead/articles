#!/usr/bin/env node
// Auto-layout SVG renderer: JSON spec -> house-style SVG.
// Layout is computed by dagre (positions) + greedy text wrap (sizes).
// No hand-placed coordinates: overlaps are impossible by construction.
//
// Usage: node render.js spec.json out.svg
// Spec: see README.md. Modes: graph (default) and table.
"use strict";
const dagre = require("dagre");

const FS = 15, LH = 21, PADX = 16, PADY = 12;
const C = {
  green: "#4ade80", blue: "#60a5fa", amber: "#f59e0b", purple: "#a78bfa",
  red: "#f87171", gray: "#8b949e", white: "#ffffff"
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function wrap(text, maxChars) {
  const out = [];
  for (const para of String(text).split("\n")) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > maxChars && cur) { out.push(cur); cur = w; }
      else cur = (cur + " " + w).trim();
    }
    if (cur) out.push(cur);
    if (!words.length) out.push("");
  }
  return out.length ? out : [""];
}
function colorOf(name, fallback) { return C[name] || fallback || "#8b949e"; }

function measureNode(n) {
  const maxChars = n.widthChars || 30;
  const titleLines = n.title ? wrap(n.title, Math.max(12, maxChars - 2)) : [];
  const lines = wrap(n.label || "", maxChars);
  const wMax = Math.max(
    ...titleLines.map(l => l.length + 1),
    ...lines.map(l => l.length),
    6
  );
  const h = (titleLines.length + lines.length) * LH + 2 * PADY;
  const w = Math.min(n.maxWidth || 440, wMax * FS * 0.62 + 2 * PADX + 14);
  return { titleLines, lines, w: Math.ceil(w), h: Math.ceil(h) };
}

function layoutGraph(spec) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: spec.rankdir || "LR",
    nodesep: spec.nodesep || 34,
    ranksep: spec.ranksep || 78,
    marginx: 26, marginy: 26
  });
  g.setDefaultEdgeLabel(() => ({}));
  const sizes = {};
  for (const n of spec.nodes) {
    sizes[n.id] = measureNode(n);
    g.setNode(n.id, { width: sizes[n.id].w, height: sizes[n.id].h });
  }
  const seen = new Set();
  for (const e of spec.edges || []) {
    const key = e.from + "->" + e.to + "|" + (e.label || "");
    if (seen.has(key)) continue;
    seen.add(key);
    const lw = e.label ? Math.min(190, e.label.length * 7.0 + 18) : 10;
    g.setEdge(e.from, e.to, { label: e.label || "", width: lw, height: e.label ? 26 : 10, labeloffset: 10 });
  }
  dagre.layout(g);
  return { g, sizes };
}

function svgNode(n, m, x, y, defs) {
  const stroke = colorOf(n.color, "#8b949e");
  const parts = [];
  parts.push('<rect x="' + x + '" y="' + y + '" width="' + m.w + '" height="' + m.h +
    '" rx="11" fill="#161b22" stroke="' + stroke + '" stroke-width="2"/>');
  if (n.color && n.color !== "gray") {
    parts.push('<rect x="' + x + '" y="' + y + '" width="5" height="' + m.h +
      '" rx="2.5" fill="' + stroke + '"/>');
  }
  let ty = y + PADY + 2;
  for (const l of m.titleLines) {
    parts.push('<text x="' + (x + PADX + 8) + '" y="' + ty + '" font-size="' + FS +
      '" font-weight="bold" fill="' + stroke + '">' + esc(l) + "</text>");
    ty += LH;
  }
  for (const l of m.lines) {
    parts.push('<text x="' + (x + PADX + 8) + '" y="' + ty + '" font-size="' + FS +
      '" fill="#c9d1d9">' + esc(l) + "</text>");
    ty += LH;
  }
  return parts.join("\n");
}

function renderGraph(spec) {
  const { g, sizes } = layoutGraph(spec);
  const gg = g.graph();
  const parts = [];

  const titleLines = spec.title ? wrap(spec.title, 52) : [];
  const TITLE_H = titleLines.length * 40 + (spec.subtitle ? 34 : 0) + (titleLines.length ? 26 : 0);
  const CHIP_H = (spec.chips || []).length ? 74 : 0;
  const W = Math.max(gg.width + 52, 620);
  const H = TITLE_H + gg.height + CHIP_H + 34;

  // background
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H +
    '" viewBox="0 0 ' + W + " " + H + '" font-family="DejaVu Sans, Verdana, sans-serif">');
  parts.push('<rect width="' + W + '" height="' + H + '" fill="#0d1117"/>');

  // title + subtitle
  let ty = 52;
  for (const l of titleLines) {
    parts.push('<text x="30" y="' + ty + '" font-size="30" font-weight="bold" fill="#ffffff">' + esc(l) + "</text>");
    ty += 40;
  }
  if (spec.subtitle) {
    parts.push('<text x="30" y="' + (ty + 6) + '" font-size="17" fill="#8b949e">' + esc(spec.subtitle) + "</text>");
  }

  // arrow markers (one per stroke color used on edges)
  const edgeColors = new Set((spec.edges || []).map(e => colorOf(e.color, "#8b949e")));
  let mi = 0;
  const markerId = {};
  for (const col of edgeColors) {
    const id = "arrow" + (++mi);
    markerId[col] = id;
    parts.push('<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="' + col + '"/></marker>');
  }

  // edges first (under nodes)
  const offsets = { x: (W - gg.width) / 2, y: TITLE_H };
  for (const e of spec.edges || []) {
    const eg = g.edge(e.from, e.to, undefined) || (g.edge(e.from, e.to));
    if (!eg || !eg.points) continue;
    const col = colorOf(e.color, "#8b949e");
    const pts = eg.points.map(p => Math.round((p.x + offsets.x) * 10) / 10 + "," + Math.round((p.y + offsets.y) * 10) / 10).join(" ");
    parts.push('<polyline points="' + pts + '" fill="none" stroke="' + col + '" stroke-width="2.2" marker-end="url(#' + markerId[col] + ')"/>');
    if (e.label) {
      const lx = eg.x + offsets.x, lyy = eg.y + offsets.y;
      const lines = wrap(e.label, 24);
      const bw = Math.max(...lines.map(l => l.length)) * 7.0 + 14;
      const bh = lines.length * 18 + 8;
      parts.push('<rect x="' + (lx - bw / 2) + '" y="' + (lyy - bh / 2) + '" width="' + bw + '" height="' + bh +
        '" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="1"/>');
      let lyy2 = lyy - bh / 2 + 16;
      for (const l of lines) {
        parts.push('<text x="' + lx + '" y="' + lyy2 + '" font-size="13" fill="#8b949e" text-anchor="middle">' + esc(l) + "</text>");
        lyy2 += 18;
      }
    }
  }

  // nodes
  for (const n of spec.nodes) {
    const gn = g.node(n.id);
    parts.push(svgNode(n, sizes[n.id], Math.round(gn.x - sizes[n.id].w / 2 + offsets.x), Math.round(gn.y - sizes[n.id].h / 2 + offsets.y)));
  }

  // chips row
  if ((spec.chips || []).length) {
    const cy = H - 58;
    let cx = 30;
    for (const chip of spec.chips) {
      const txt = typeof chip === "string" ? chip : chip.text;
      const col = typeof chip === "string" ? "#30363d" : colorOf(chip.color, "#30363d");
      const cw = txt.length * 7.6 + 30;
      parts.push('<rect x="' + cx + '" y="' + cy + '" width="' + cw + '" height="40" rx="9" fill="#0d1117" stroke="' + col + '" stroke-width="1.5"/>');
      parts.push('<text x="' + (cx + 15) + '" y="' + (cy + 26) + '" font-size="14.5" fill="#c9d1d9">' + esc(txt) + "</text>");
      cx += cw + 14;
    }
  }

  parts.push("</svg>");
  return parts.join("\n");
}

// --- table mode
function renderTable(spec) {
  const cols = spec.cols, rows = spec.rows;
  const colChars = cols.map((c, ci) => {
    let m = wrap(c, 34).reduce((a, l) => Math.max(a, l.length), 0);
    for (const r of rows) {
      for (const l of wrap(String(r[ci] || ""), 34)) m = Math.max(m, l.length);
    }
    return m;
  });
  const colW = colChars.map(cc => Math.ceil(cc * FS * 0.62 + 2 * PADX));
  const rowH = rows.map(r => Math.max(...r.map((c, ci) => wrap(String(c || ""), 34).length)) * LH + 2 * PADY);
  const headH = LH + 2 * PADY;
  const W = colW.reduce((a, b) => a + b, 0) + 60;
  const footLines = spec.footer ? wrap(String(spec.footer), W - 60, 13) : [];
  const footH = footLines.length ? footLines.length * 18 + 16 : 0;
  const H = headH + rowH.reduce((a, b) => a + b, 0) + (spec.title ? 96 : 30) + footH + 20;

  const parts = [];
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H +
    '" viewBox="0 0 ' + W + " " + H + '" font-family="DejaVu Sans, Verdana, sans-serif">');
  parts.push('<rect width="' + W + '" height="' + H + '" fill="#0d1117"/>');
  let ty = 52;
  if (spec.title) {
    for (const l of wrap(spec.title, 52)) {
      parts.push('<text x="30" y="' + ty + '" font-size="30" font-weight="bold" fill="#ffffff">' + esc(l) + "</text>");
      ty += 40;
    }
    ty += 12;
  }
  const y0 = ty;
  let x = 30;
  // header
  for (let ci = 0; ci < cols.length; ci++) {
    parts.push('<rect x="' + x + '" y="' + y0 + '" width="' + colW[ci] + '" height="' + headH + '" fill="#1c2128" stroke="#30363d"/>');
    const hl = wrap(cols[ci], 34);
    let hy = y0 + PADY + 2;
    for (const l of hl) {
      parts.push('<text x="' + (x + PADX) + '" y="' + hy + '" font-size="' + FS + '" font-weight="bold" fill="#ffffff">' + esc(l) + "</text>");
      hy += LH;
    }
    x += colW[ci];
  }
  // rows
  let y = y0 + headH;
  rows.forEach((r, ri) => {
    x = 30;
    for (let ci = 0; ci < cols.length; ci++) {
      if (ri % 2 === 1) parts.push('<rect x="' + x + '" y="' + y + '" width="' + colW[ci] + '" height="' + rowH[ri] + '" fill="#11161d"/>');
      parts.push('<rect x="' + x + '" y="' + y + '" width="' + colW[ci] + '" height="' + rowH[ri] + '" fill="none" stroke="#30363d"/>');
      const lines = wrap(String(r[ci] || ""), 34);
      let cy = y + PADY + 2;
      for (const l of lines) {
        const strong = ci === 0 && !!spec.boldFirstCol;
        parts.push('<text x="' + (x + PADX) + '" y="' + cy + '" font-size="' + FS + (strong ? '" font-weight="bold" fill="#ffffff' : '" fill="#c9d1d9') + '">' + esc(l) + "</text>");
        cy += LH;
      }
      x += colW[ci];
    }
    y += rowH[ri];
  });
  if (footLines.length) {
    let fy = y + 14;
    for (const l of footLines) {
      parts.push('<text x="30" y="' + fy + '" font-size="13" fill="#8b949e">' + esc(l) + "</text>");
      fy += 18;
    }
  }
  parts.push("</svg>");
  return parts.join("\n");
}

// --- main
const fs = require("fs");
const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const out = spec.mode === "table" ? renderTable(spec) : renderGraph(spec);
const target = process.argv[3];
if (target) { fs.writeFileSync(target, out); console.error("wrote " + target); }
else process.stdout.write(out);
