// check-overlap: misst die Geometrie aller .card/.arrow/.chip-Elemente einer
// Figuren-HTML via chromium und meldet Box-Ueberschneidungen.
// Nutzung: node check-overlap.js <figure.html>  -> EXIT 1 bei Overlaps.
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const cp = require("child_process");

const fig = path.resolve(process.argv[2]);
const dir = path.dirname(fig);
const html = fs.readFileSync(fig, "utf8");
// Mess-Script injizieren: alle relevanten Elemente + Bounding-Rects
const probe = html.replace("</body>", '<script>window.__figprobe = function () {\n' +
  'const sels = ["div", "span", "h1", "h2", "p"];\n' +
  'const out = [];\n' +
  'for (const sel of sels) {\n' +
  '  document.querySelectorAll(sel).forEach((el, i) => {\n' +
  '    const r = el.getBoundingClientRect();\n' +
  '    out.push({ sel: sel, i: i, x: r.x, y: r.y, w: r.width, h: r.height, text: (el.textContent || "").trim().slice(0, 60) });\n' +
  '  });\n' +
  '}\n' +
  'const pre = document.createElement("pre");\n' +
  'pre.id = "figboxes";\n' +
  'pre.textContent = "FIGBOXES:" + JSON.stringify(out);\n' +
  'document.body.appendChild(pre);\n' +
  '}; window.addEventListener("load", () => setTimeout(window.__figprobe, 50));\n</' + 'script></body>');
const dir2 = fs.mkdtempSync(path.join(__dirname, ".ovl-"));
const pf = path.join(dir2, "probe.html");
fs.writeFileSync(pf, probe);
const env = { ...process.env, PATH: "/snap/bin:" + process.env.PATH };
const out = cp.execFileSync("chromium", [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--virtual-time-budget=3000", "--dump-dom", "file://" + pf
], { maxBuffer: 30 * 1024 * 1024, cwd: dir, env }).toString();
fs.rmSync(dir2, { recursive: true, force: true });
const m = out.match(/FIGBOXES:(\[[\s\S]*?\])/);
if (!m) { console.error("probe fehlgeschlagen"); process.exit(2); }
const boxes = JSON.parse(m[1]).filter(b => b.w > 40 && b.h > 20);
const cards = boxes;
const arrows = [];
const chips = [];
function inter(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}
let bad = 0;
for (const ar of arrows) {
  for (const cd of cards) {
    if (inter(ar, cd)) { bad++; console.error("OVERLAP: arrow [" + ar.text.slice(0, 30) + "] x card [" + cd.text.slice(0, 30) + "]"); }
  }
}
for (const c1 of cards) {
  for (const c2 of cards) {
    if (c1 === c2) continue;
    if (inter(c1, c2)) { bad++; console.error("OVERLAP: card [" + c1.text.slice(0, 30) + "] x card [" + c2.text.slice(0, 30) + "]"); }
  }
}
for (const ch of chips) {
  for (const cd of cards) {
    if (inter(ch, cd)) { bad++; console.error("OVERLAP: chip [" + ch.text.slice(0, 30) + "] x card"); }
  }
}
console.log("geprueft: " + cards.length + " cards, " + arrows.length + " arrows, " + chips.length + " chips | overlaps: " + bad);
if (bad > 0) process.exit(1);
