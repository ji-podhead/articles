// fig-height: misst die WAHRE Inhalts-Hoehe einer Figuren-HTML (body.scrollHeight),
// unabhaengig vom Box-Filter (w>40/h>20) von dump-boxes/content-bottom — noetig,
// weil nach dem Flatten ganze Bereiche aus <section> bestehen, deren Text-Leafs
// unter der 20px-Hoehe fallen und content-bottom.py zu kurz misst.
// Nutzung: node fig-height.js <figure.html> [breite]  ->  "fig-height: <px>"
"use strict";
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const fig = path.resolve(process.argv[2]);
const W = process.argv[3] || "1200";
const dir = path.dirname(fig);
const html = fs.readFileSync(fig, "utf8");
var INJ = "<" + "script>";
INJ += "window.addEventListener('load', function(){ setTimeout(function(){";
INJ += " var h1 = document.body.scrollHeight;";
INJ += " var h2 = document.documentElement.scrollHeight;";
INJ += " var pre = document.createElement('pre'); pre.id='figh';";
INJ += " pre.textContent = 'FIGH:' + h1 + '|' + h2;";
INJ += " document.body.appendChild(pre);";
INJ += " }, 60); });";
INJ += "</" + "script></body>";
const probe = html.replace("</body>", INJ);
const pf = path.join(dir, ".probe-height.html");
fs.writeFileSync(pf, probe);
const env = { ...process.env, PATH: "/snap/bin:" + process.env.PATH };
const out = cp.execFileSync("chromium", [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  "--virtual-time-budget=3000", "--window-size=" + W + ",4000", "--dump-dom", "file://" + pf
], { maxBuffer: 30 * 1024 * 1024, cwd: dir, env }).toString();
fs.rmSync(pf, { force: true });
const m = out.match(/FIGH:([0-9]+)[|]([0-9]+)/);
if (!m) { console.error("probe fehlgeschlagen"); process.exit(2); }
console.log("fig-height: body=" + m[1] + " doc=" + m[2]);
