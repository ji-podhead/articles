#!/usr/bin/env node
// spec-to-html.js: konvertiert Flex/Table-Specs in HTML-first Figures
// (House-Stylesheet, Flex-Layout, Pfeile als Glyph-Flex-Items).
// Nutzung: node spec-to-html.js <spec.json> <out.html> [override.css-name]
"use strict";
const fs = require("fs");

const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const out = process.argv[3];
const override = process.argv[4] || "";

const COLORS = { green: "green", blue: "blue", amber: "amber", red: "red" };
function colClass(name) { return COLORS[name] ? " " + COLORS[name] : ""; }

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// tree -> html
function renderNode(n, isRoot) {
  if (n.type === "card" || n.type === "code") {
    const cls = "card" + colClass(n.color) + (n.type === "code" ? " code" : "");
    let logoSrc = null;
    if (n.logo) {
      if (fs.existsSync(require("path").join(__dirname, "html/logos/jimesh/icons/dev_logos", n.logo + ".svg"))) logoSrc = "../logos/jimesh/icons/dev_logos/" + n.logo + ".svg";
      else if (fs.existsSync(require("path").join(__dirname, "logos", n.logo + ".svg"))) logoSrc = "../logos/" + n.logo + ".svg";
    }
    const logo = logoSrc ? '<img class="cardlogo" src="' + esc(logoSrc) + '" alt="' + esc(n.logo) + '">' : "";
    const title = n.title ? '<div class="t">' + esc(n.title) + "</div>" : "";
    const lines = (n.lines || []).map(l => '<div class="d">' + esc(l) + "</div>").join("\n");
    return '<div class="' + cls + '">' + logo + title + lines + "</div>";
  }
  if (n.type === "arrow") {
    const cls = n.color && n.color.charAt(0) === "#" ? "" : (n.color ? " " + n.color : "");
    const style = n.color && n.color.charAt(0) === "#" ? ' style="color:' + n.color + '"' : "";
    const lbl = n.label ? '<span class="lbl">' + esc(n.label) + "</span>" : "";
    return '<div class="arrow' + cls + '"' + style + '>&#8594;' + lbl + "</div>";
  }
  if (n.type === "chip") {
    return '<div class="chip">' + esc(n.text) + "</div>";
  }
  if (n.type === "text") {
    const px = (n.style && n.style.fontSize) || 17;
    const cls = (n.style && n.style.bold) ? ' style="font-weight:700;font-size:' + px + 'px"' : ' style="font-size:' + px + 'px;color:var(--ink2)"';
    const lines = (n.lines || []).map(l => '<div' + cls + ">" + esc(l) + "</div>").join("\n");
    return "<div>" + lines + "</div>";
  }
  // row/column container
  const cls = (n.type === "row" ? "row" : "col") + (isRoot ? " root" : "");
  const kids = (n.children || []).map(c => renderNode(c, false)).join("\n");
  return '<div class="' + cls + '">' + kids + "</div>";
}

// Pfeile: Geschwister-Connects als Glyph-Items zwischen den Cards einfuegen
function insertSiblingArrows(tree, spec) {
  for (const a of (spec.connect || [])) {
    const parent = findParent(tree, a.from);
    if (!parent || !(parent.children)) continue;
    const kids = parent.children;
    const fi = kids.findIndex(k => k.id === a.from);
    const ti = kids.findIndex(k => k.id === a.to);
    if (fi >= 0 && ti === fi + 1) {
      kids.splice(ti, 0, { type: "arrow", id: a.to + "@arrow", label: a.label || "", color: a.color || "" });
    }
  }
  // cross-branch connects als Flow-Strip sammeln
  const flows = (spec.connect || []).filter(a => !hasSiblingArrow(a));
  if (flows.length) {
    spec.__flowstrip = flows.map(f => {
      const A = titleOf(tree, f.from), B = titleOf(tree, f.to);
      return (A || f.from) + " &#8594; " + (f.label ? esc(f.label) + " &#8594; " : "") + (B || f.to);
    });
  }
  function hasSiblingArrow(a) {
    const parent = findParent(tree, a.from);
    if (!parent) return false;
    const kids = parent.children || [];
    const fi = kids.findIndex(k => k.id === a.from);
    return fi >= 0 && kids[fi + 1] && (kids[fi + 1].id === a.to || (kids[fi + 1].type === "arrow" && kids[fi + 1].id === a.to + "@arrow"));
  }
  function findParent(node, id) {
    for (const k of (node.children || [])) {
      if (k.id === id) return node;
      const r = findParent(k, id);
      if (r) return r;
    }
    return null;
  }
  function titleOf(node, id) {
    if (node.id === id) return node.title || node.text || id;
    for (const k of (node.children || [])) {
      const r = titleOf(k, id);
      if (r) return r;
    }
    return null;
  }
}

insertSiblingArrows(spec.tree, spec);

const titleHtml = spec.title ? "<h1>" + esc(spec.title) + "</h1>" : "";
const subHtml = spec.subtitle ? '<div class="sub">' + esc(spec.subtitle) + "</div>" : "";
const treeHtml = renderNode(spec.tree, true);
const flowHtml = (spec.__flowstrip || []).length
  ? '<div class="flowstrip">' + spec.__flowstrip.map(f => "<div>" + f + "</div>").join("\n") + "</div>"
  : "";
const chipHtml = (spec.chips || []).length
  ? '<div class="chips">' + spec.chips.map(c => '<div class="chip">' + esc(typeof c === "string" ? c : c.text) + "</div>").join("\n") + "</div>"
  : "";
const ovLink = override ? '<link rel="stylesheet" href="styles/' + esc(override) + '">' : "";

const html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
  '<link rel="stylesheet" href="styles/_house.css">\n' + ovLink +
  '<style>\n.root { gap: 28px; }\n.flowstrip { display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: var(--ink2); border-top: 1px solid var(--line); padding-top: 14px; }\n.card.code .d { font-family: var(--font-mono); font-size: 13.5px; color: var(--code); }\n.card.code { background: var(--elevated); }\n.cardlogo { height: 24px; opacity: 0.85; margin-left: 12px; }
.arrow.green { color: var(--green); }
.arrow.blue { color: var(--blue); }
.arrow.amber { color: var(--amber); }
.arrow.red { color: var(--red); }\n</style>\n</head>\n<body>\n' +
  titleHtml + "\n" + subHtml + "\n" + treeHtml + "\n" + flowHtml + "\n" + chipHtml + "\n</body>\n</html>\n";

fs.writeFileSync(out, html);
console.error("wrote " + out);
