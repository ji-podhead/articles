// Orthogonal arrow router: straight if clear, else L-detour above/below/left/right
// around blockers (Liang-Barsky segment-rect hit test). Pure function, no deps.
"use strict";
function segHitsRect(x1, y1, x2, y2, r) {
  let t0 = 0, t1 = 1;
  const dx = x2 - x1, dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}
function hits(poly, blockers) {
  let n = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    for (const b of blockers) {
      if (segHitsRect(poly[i].x, poly[i].y, poly[i + 1].x, poly[i + 1].y, b)) { n++; break; }
    }
  }
  return n;
}
// start/end sitzen auf den Boxkanten (Anchor). blockers: andere Boxen, infl.
function route(start, end, blockers) {
  const straight = [{ x: start.x, y: start.y }, { x: end.x, y: end.y }];
  const straightH = hits(straight, blockers);
  if (straightH === 0) return straight;
  const topY = Math.min(start.y, end.y) - 36;
  const botY = Math.max(start.y, end.y) + 36;
  const leftX = Math.min(start.x, end.x) - 36;
  const rightX = Math.max(start.x, end.x) + 36;
  const cands = [
    [{ x: start.x, y: start.y }, { x: start.x, y: topY }, { x: end.x, y: topY }, { x: end.x, y: end.y }],
    [{ x: start.x, y: start.y }, { x: start.x, y: botY }, { x: end.x, y: botY }, { x: end.x, y: end.y }],
    [{ x: start.x, y: start.y }, { x: leftX, y: start.y }, { x: leftX, y: end.y }, { x: end.x, y: end.y }],
    [{ x: start.x, y: start.y }, { x: rightX, y: start.y }, { x: rightX, y: end.y }, { x: end.x, y: end.y }]
  ];
  let best = straight, bestH = straightH;
  // Mittelkorridor: bei weit auseinanderliegenden Endpunkten kann eine
  // Z-Route durch eine freie horizontal Bahn zwischen den Boxen laufen
  if (Math.abs(end.y - start.y) > 90) {
    const y0 = Math.min(start.y, end.y), y1 = Math.max(start.y, end.y);
    const ys = new Set();
    for (const b of blockers) {
      if (b.y > y0 + 10 && b.y < y1 - 10) ys.add(b.y - 8);
      if (b.y + b.h > y0 + 10 && b.y + b.h < y1 - 10) ys.add(b.y + b.h + 8);
    }
    for (const cY of ys) {
      cands.push([{ x: start.x, y: start.y }, { x: start.x, y: cY }, { x: end.x, y: cY }, { x: end.x, y: end.y }]);
    }
  }
  for (const c of cands) {
    const h = hits(c, blockers);
    if (h < bestH) { best = c; bestH = h; }
    if (h === 0) break;
  }
  return best;
}
module.exports = { route, segHitsRect };
