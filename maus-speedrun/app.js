// Maus-Speedrun — app.js

// ── Config ────────────────────────────────────────────────────
const CONFIG = {
  canvasW:     800,
  canvasH:     450,
  trackHalfW:  22,    // half-width of the track in pixels
  splinePoints: 1600, // total points along the spline
  gridCols:    5,
  gridRows:    5,
  // x-centers of the 5 grid columns
  colX: [140, 270, 400, 530, 660],
  // y-centers of the 5 grid rows
  rowY: [60,  143, 225, 308, 390],
};

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
canvas.width  = CONFIG.canvasW;
canvas.height = CONFIG.canvasH;

// ── Track generation ──────────────────────────────────────────

/** Randomised DFS Hamiltonian path across the 5×5 grid. Starts in column 0,
 *  ends in column 4 – guaranteed by the column-snake fallback. */
function generateGridPath() {
  const { gridCols: C, gridRows: R } = CONFIG;
  const vis = Array.from({ length: R }, () => new Uint8Array(C));
  let result = null;
  let steps  = 0;
  const startRow = Math.floor(Math.random() * R);

  function dfs(c, r, path) {
    if (result || steps > 150_000) return;
    steps++;
    if (path.length === C * R) {
      if (c === C - 1) result = path.slice();
      return;
    }
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (let i = 3; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    for (const [dc, dr] of dirs) {
      const nc = c + dc, nr = r + dr;
      if (nc < 0 || nc >= C || nr < 0 || nr >= R || vis[nr][nc]) continue;
      vis[nr][nc] = 1;
      path.push([nc, nr]);
      dfs(nc, nr, path);
      if (result) return;
      vis[nr][nc] = 0;
      path.pop();
    }
  }

  vis[startRow][0] = 1;
  dfs(0, startRow, [[0, startRow]]);

  // Column-snake fallback (always ends at column 4)
  if (!result) {
    result = [];
    for (let c = 0; c < C; c++) {
      if (c % 2 === 0) for (let r = 0; r < R; r++) result.push([c, r]);
      else             for (let r = R - 1; r >= 0; r--) result.push([c, r]);
    }
  }

  return [
    [40,               CONFIG.rowY[result[0][1]]],
    ...result.map(([c, r]) => [CONFIG.colX[c], CONFIG.rowY[r]]),
    [760, CONFIG.rowY[result[result.length - 1][1]]],
  ];
}

/** Catmull-Rom interpolation between four control points. */
function catmullRom(p0, p1, p2, p3, t) {
  const [x0,y0]=p0,[x1,y1]=p1,[x2,y2]=p2,[x3,y3]=p3, t2=t*t, t3=t2*t;
  return [
    .5*((2*x1)+(-x0+x2)*t+(2*x0-5*x1+4*x2-x3)*t2+(-x0+3*x1-3*x2+x3)*t3),
    .5*((2*y1)+(-y0+y2)*t+(2*y0-5*y1+4*y2-y3)*t2+(-y0+3*y1-3*y2+y3)*t3),
  ];
}

function buildSpline(ctrl, totalPoints) {
  const pts  = [];
  const segs = ctrl.length - 1;
  const sps  = Math.floor(totalPoints / segs);
  for (let i = 0; i < segs; i++) {
    const p0 = ctrl[Math.max(0, i - 1)];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[Math.min(segs, i + 2)];
    for (let j = 0; j < sps; j++) pts.push(catmullRom(p0, p1, p2, p3, j / sps));
  }
  pts.push(ctrl[ctrl.length - 1]);
  return pts;
}

function buildNormals(pts) {
  return pts.map((_, i) => {
    const [ax,ay] = pts[Math.max(0, i - 1)];
    const [bx,by] = pts[Math.min(pts.length - 1, i + 1)];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  });
}

// ── Track (rebuilt on each reset) ─────────────────────────────
let PATH, NORM, LEFT, RIGHT;

function buildTrack() {
  const ctrl = generateGridPath();
  PATH  = buildSpline(ctrl, CONFIG.splinePoints);
  NORM  = buildNormals(PATH);
  LEFT  = PATH.map(([x,y], i) => [x + NORM[i][0] * CONFIG.trackHalfW, y + NORM[i][1] * CONFIG.trackHalfW]);
  RIGHT = PATH.map(([x,y], i) => [x - NORM[i][0] * CONFIG.trackHalfW, y - NORM[i][1] * CONFIG.trackHalfW]);
}

buildTrack();

// ── Game state ────────────────────────────────────────────────
const game = {
  status:      'idle',  // 'idle' | 'playing' | 'dead' | 'win'
  mx:          -999,
  my:          -999,
  startTime:   0,
  elapsed:     0,
  best:        null,
  progressIdx: 0,
  flashTimer:  0,
};

// ── DOM ────────────────────────────────────────────────────────
const dom = {
  timer:     document.getElementById('timer'),
  best:      document.getElementById('best-display'),
  overlays:  {
    start: document.getElementById('overlay-start'),
    dead:  document.getElementById('overlay-dead'),
    win:   document.getElementById('overlay-win'),
  },
  info: {
    dead:      document.getElementById('dead-info'),
    winTime:   document.getElementById('win-time-info'),
    winRecord: document.getElementById('win-record-info'),
  },
};

// ── Helpers ────────────────────────────────────────────────────
function formatTime(ms) {
  return (ms / 1000).toFixed(3) + ' s';
}

function nearestPoint(px, py) {
  let bestDist = Infinity, bestIdx = 0;
  const lo = Math.max(0, game.progressIdx - 60);
  const hi = Math.min(PATH.length - 1, game.progressIdx + 280);
  for (let i = lo; i <= hi; i++) {
    const dx = PATH[i][0] - px, dy = PATH[i][1] - py;
    const d  = dx * dx + dy * dy;
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  return { idx: bestIdx, dist: Math.sqrt(bestDist) };
}

function inZone(px, py, idx) {
  const [zx, zy] = PATH[idx];
  return Math.hypot(px - zx, py - zy) < CONFIG.trackHalfW;
}

// ── Game flow ──────────────────────────────────────────────────
function reset() {
  buildTrack();
  game.status      = 'idle';
  game.elapsed     = 0;
  game.progressIdx = 0;
  game.flashTimer  = 0;
  dom.timer.textContent  = '0.000 s';
  dom.timer.style.color  = 'white';
  dom.overlays.start.classList.remove('hidden');
  dom.overlays.dead.classList.add('hidden');
  dom.overlays.win.classList.add('hidden');
}

function die() {
  if (game.status !== 'playing') return;
  game.status     = 'dead';
  game.flashTimer = 1.0;
  const pct = Math.round(game.progressIdx / PATH.length * 100);
  dom.info.dead.innerHTML =
    `Zeit: <strong>${formatTime(game.elapsed)}</strong> &mdash; ${pct}&thinsp;% geschafft`;
  dom.overlays.dead.classList.remove('hidden');
  dom.timer.style.color = '#ff4d6d';
}

function win() {
  if (game.status !== 'playing') return;
  game.status = 'win';
  const isNew = game.best === null || game.elapsed < game.best;
  if (isNew) game.best = game.elapsed;
  dom.info.winTime.innerHTML   = `Zeit: <strong>${formatTime(game.elapsed)}</strong>`;
  dom.info.winRecord.textContent = isNew ? '🏆 Neuer Rekord!' : `Bestzeit: ${formatTime(game.best)}`;
  dom.best.textContent           = `Best: ${formatTime(game.best)}`;
  dom.overlays.win.classList.remove('hidden');
  dom.timer.style.color = '#00e5ff';
}

// ── Rendering ──────────────────────────────────────────────────
function polyPath(pts, from, to) {
  ctx.moveTo(pts[from][0], pts[from][1]);
  for (let i = from + 1; i <= to; i++) ctx.lineTo(pts[i][0], pts[i][1]);
}

function drawBackground() {
  ctx.fillStyle = '#04071a';
  ctx.fillRect(0, 0, CONFIG.canvasW, CONFIG.canvasH);
  ctx.fillStyle = 'rgba(61,90,254,0.065)';
  for (let x = 20; x < CONFIG.canvasW; x += 40)
    for (let y = 20; y < CONFIG.canvasH; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
}

function drawTrack() {
  ctx.beginPath();
  polyPath(LEFT, 0, LEFT.length - 1);
  for (let i = RIGHT.length - 1; i >= 0; i--) ctx.lineTo(RIGHT[i][0], RIGHT[i][1]);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8,14,46,0.97)';
  ctx.fill();

  ctx.lineWidth   = 2.5;
  ctx.strokeStyle = 'rgba(61,90,254,0.7)';
  [LEFT, RIGHT].forEach(side => {
    ctx.beginPath(); polyPath(side, 0, side.length - 1); ctx.stroke();
  });
}

function drawTrail() {
  if (game.progressIdx < 2) return;
  ctx.beginPath();
  polyPath(PATH, 0, game.progressIdx);
  ctx.strokeStyle = 'rgba(0,229,255,0.2)';
  ctx.lineWidth   = CONFIG.trackHalfW * 2 - 7;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.stroke();
}

function drawZones(ts) {
  const pulse = (Math.sin(ts * 0.0042) + 1) / 2;

  const [sx, sy] = PATH[0];
  const g1 = ctx.createRadialGradient(sx, sy, 0, sx, sy, CONFIG.trackHalfW);
  g1.addColorStop(0, `rgba(0,230,118,${0.35 + pulse * 0.25})`);
  g1.addColorStop(1, 'rgba(0,230,118,0)');
  ctx.beginPath(); ctx.arc(sx, sy, CONFIG.trackHalfW, 0, Math.PI * 2);
  ctx.fillStyle = g1; ctx.fill();
  ctx.fillStyle = `rgba(0,230,118,${0.7 + pulse * 0.3})`;
  ctx.font = 'bold 10px Inter,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('START', sx, sy);

  const [fx, fy] = PATH[PATH.length - 1];
  const g2 = ctx.createRadialGradient(fx, fy, 0, fx, fy, CONFIG.trackHalfW);
  g2.addColorStop(0, `rgba(0,229,255,${0.35 + pulse * 0.25})`);
  g2.addColorStop(1, 'rgba(0,229,255,0)');
  ctx.beginPath(); ctx.arc(fx, fy, CONFIG.trackHalfW, 0, Math.PI * 2);
  ctx.fillStyle = g2; ctx.fill();
  ctx.fillStyle = `rgba(0,229,255,${0.7 + pulse * 0.3})`;
  ctx.fillText('ZIEL', fx, fy);
}

function drawCursor() {
  if (game.mx < -100) return;
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.shadowBlur  = 10;
  ctx.beginPath(); ctx.arc(game.mx, game.my, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'white'; ctx.fill();
  ctx.shadowBlur = 0;
}

function drawFlash() {
  ctx.fillStyle = `rgba(255,55,75,${game.flashTimer * 0.45})`;
  ctx.fillRect(0, 0, CONFIG.canvasW, CONFIG.canvasH);
  game.flashTimer = Math.max(0, game.flashTimer - 0.055);
}

// ── Game loop ──────────────────────────────────────────────────
requestAnimationFrame(function loop(ts) {
  requestAnimationFrame(loop);

  if (game.status === 'playing') {
    game.elapsed = ts - game.startTime;
    dom.timer.textContent = formatTime(game.elapsed);

    const { idx, dist } = nearestPoint(game.mx, game.my);
    if (idx > game.progressIdx) game.progressIdx = idx;
    if (dist > CONFIG.trackHalfW + 2) die();
    else if (game.progressIdx > PATH.length * 0.92 && inZone(game.mx, game.my, PATH.length - 1)) win();
  }

  if (game.status === 'idle' && inZone(game.mx, game.my, 0)) {
    game.status      = 'playing';
    game.startTime   = ts;
    game.elapsed     = 0;
    game.progressIdx = 0;
    dom.overlays.start.classList.add('hidden');
  }

  drawBackground();
  drawTrack();
  if (game.status === 'playing' || game.status === 'win') drawTrail();
  drawZones(ts);
  drawCursor();
  if (game.flashTimer > 0) drawFlash();
});

// ── Input ──────────────────────────────────────────────────────
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  game.mx = (e.clientX - r.left) * (CONFIG.canvasW / r.width);
  game.my = (e.clientY - r.top)  * (CONFIG.canvasH / r.height);
});

canvas.addEventListener('mouseleave', () => {
  if (game.status === 'playing') {
    dom.info.dead.innerHTML = 'Maus hat den Bereich verlassen!';
    die();
  }
  game.mx = -999; game.my = -999;
});

// ── Canvas scaling ─────────────────────────────────────────────
function scaleCanvas() {
  const s = Math.min(
    (window.innerWidth - 32)  / CONFIG.canvasW,
    (window.innerHeight - 80) / CONFIG.canvasH,
    1.5
  );
  canvas.style.transform = `scale(${s})`;
}

window.addEventListener('resize', scaleCanvas);
scaleCanvas();

// ── Overlay buttons ────────────────────────────────────────────
document.getElementById('btn-start').addEventListener('click', () => {
  dom.overlays.start.classList.add('hidden');
});
document.getElementById('btn-retry').addEventListener('click', reset);
document.getElementById('btn-again').addEventListener('click', reset);
