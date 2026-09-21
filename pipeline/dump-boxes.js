// dump-boxes: Diagnose-Tool wie check-overlap.js, gibt ALLE Box-Koordinaten aus.
// Nutzung: node dump-boxes.js <figure.html> [viewport WxH]
"use strict";
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const fig = path.resolve(process.argv[2]);
const sizeArg = process.argv[3] || "";
const dir = path.dirname(fig);
const html = fs.readFileSync(fig, "utf8");
var INJ = "<" + "script>";
INJ += "window.addEventListener('load', function(){ setTimeout(function(){";
INJ += " var out = [];";
INJ += ' ["div","span","h1","h2","p"].forEach(function(sel){';
INJ += " document.querySelectorAll(sel).forEach(function(el, i){";
INJ += "  var r = el.getBoundingClientRect();";
INJ += '  out.push({sel: sel, i: i, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), text: (el.textContent||"").trim().slice(0,40)});';
INJ += " });});";
INJ += " var pre = document.createElement('pre'); pre.id='figboxes';";
INJ += " pre.textContent = 'FIGBOXES:' + JSON.stringify(out);";
INJ += " document.body.appendChild(pre);";
INJ += " }, 50); });";
INJ += "</" + "script></body>";
const probe = html.replace("</body>", INJ);
const pf = path.join(dir, ".probe-dump.html");
fs.writeFileSync(pf, probe);
const env = { ...process.env, PATH: "/snap/bin:" + process.env.PATH };
const args = [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--virtual-time-budget=3000", "--dump-dom", "file://" + pf
];
if (sizeArg) args.push("--window-size=" + sizeArg);
const out = cp.execFileSync("chromium", args, { maxBuffer: 30 * 1024 * 1024, cwd: dir, env }).toString();
fs.rmSync(pf, { force: true });
const idx = out.indexOf("FIGBOXES:[");
if (idx < 0) { console.error("probe fehlgeschlagen"); process.exit(2); }
const start = idx + 9;
const end = out.indexOf("</pre>", start);
const boxes = JSON.parse(out.slice(start, end));
console.log("viewport: " + (sizeArg || "default"));
for (const b of boxes) {
  if (b.w <= 40 || b.h <= 20) continue;
  console.log(b.sel + b.i + " x=" + b.x + " y=" + b.y + " w=" + b.w + " h=" + b.h + "  " + JSON.stringify(b.text).slice(0, 60));
}
