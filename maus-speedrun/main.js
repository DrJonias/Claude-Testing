const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 800;
canvas.height = 450;

const HALF_W = 28;
const N_PTS  = 1600;

function rnd(a, b) { return a + Math.random() * (b - a); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── Procedural path generator ────────────────────────────────
// Cursor-based: short segments (rise, fall, bump, S-curve, U-turn)
// chained in random order. Dir=+1 right, Dir=-1 left.

function generateControlPoints() {
  const YMIN = 52, YMAX = 398;
  const STEP = rnd(88, 118); // base segment width for this path

  const pts = [[40, 225]];
  let x = 40, y = 225, dir = 1;

  // ── forward segment (advances x by dir*STEP) ──
  function fwdSeg() {
    const s  = STEP * rnd(0.85, 1.2);
    const nx = clamp(x + dir * s, 44, 756);

    switch (Math.floor(Math.random() * 6)) {
      case 0: { // smooth rise
        const ny = clamp(y - rnd(55, 100), YMIN, YMAX);
        pts.push([clamp(x + dir*s*0.55, 44, 756), clamp((y+ny)*0.5, YMIN, YMAX)]);
        pts.push([nx, ny]);
        y = ny; break;
      }
      case 1: { // smooth fall
        const ny = clamp(y + rnd(55, 100), YMIN, YMAX);
        pts.push([clamp(x + dir*s*0.55, 44, 756), clamp((y+ny)*0.5, YMIN, YMAX)]);
        pts.push([nx, ny]);
        y = ny; break;
      }
      case 2: { // arch up (bump up, return near same y)
        const top = clamp(y - rnd(72, 118), YMIN, YMAX);
        const ny  = clamp(y + rnd(-22, 22), YMIN, YMAX);
        pts.push([clamp(x+dir*s*0.28,44,756), top]);
        pts.push([clamp(x+dir*s*0.72,44,756), top]);
        pts.push([nx, ny]);
        y = ny; break;
      }
      case 3: { // arch down (bump down, return near same y)
        const bot = clamp(y + rnd(72, 118), YMIN, YMAX);
        const ny  = clamp(y + rnd(-22, 22), YMIN, YMAX);
        pts.push([clamp(x+dir*s*0.28,44,756), bot]);
        pts.push([clamp(x+dir*s*0.72,44,756), bot]);
        pts.push([nx, ny]);
        y = ny; break;
      }
      case 4: { // S-curve: up then down
        const amp = rnd(58, 98);
        const ny  = clamp(y + rnd(-25, 25), YMIN, YMAX);
        pts.push([clamp(x+dir*s*0.32,44,756), clamp(y-amp,YMIN,YMAX)]);
        pts.push([clamp(x+dir*s*0.68,44,756), clamp(y+amp,YMIN,YMAX)]);
        pts.push([nx, ny]);
        y = ny; break;
      }
      case 5: { // S-curve: down then up
        const amp = rnd(58, 98);
        const ny  = clamp(y + rnd(-25, 25), YMIN, YMAX);
        pts.push([clamp(x+dir*s*0.32,44,756), clamp(y+amp,YMIN,YMAX)]);
        pts.push([clamp(x+dir*s*0.68,44,756), clamp(y-amp,YMIN,YMAX)]);
        pts.push([nx, ny]);
        y = ny; break;
      }
    }
    x = nx;
  }

  // ── U-turn: flips direction, shifts Y ──
  function uTurn() {
    const h   = rnd(70, 118);
    const goUp = (y - h > YMIN) && (Math.random() < 0.5 || y + h > YMAX);
    const py  = clamp(y + (goUp ? -h : h), YMIN, YMAX);
    const px  = clamp(x + dir * rnd(24, 50), 44, 756);

    pts.push([px, y + (py - y) * 0.33]);        // approaching peak
    pts.push([px, py]);                           // peak of turn
    pts.push([clamp(x - dir*rnd(6,24), 44,756), py]); // start going other way

    y = py;
    dir = -dir;
  }

  // ── main build loop ──
  const maxIter = 8 + Math.floor(Math.random() * 5);

  for (let i = 0; i < maxIter && pts.length < 26; i++) {
    const toRight = 760 - x;
    const toLeft  = x - 40;

    // Force U-turn when hitting a wall
    if ((dir ===  1 && toRight < STEP * 1.05) ||
        (dir === -1 && toLeft  < STEP * 1.05)) {
      uTurn();
    } else {
      // Random U-turn — only if there is enough room to come back
      const canTurn = (dir ===  1 && x > 210) ||
                      (dir === -1 && x < 590);
      canTurn && Math.random() < 0.28 ? uTurn() : fwdSeg();
    }
  }

  // Make sure we're heading right before the finish
  if (dir === -1) uTurn();

  // Smooth guide to finish
  if (x < 680) pts.push([clamp(rnd(680,728), 44,756), clamp(y + rnd(-28,28), YMIN,YMAX)]);
  pts.push([760, 225]);

  return pts.map(([px, py]) => [clamp(px, 44, 756), clamp(py, YMIN, YMAX)]);
}

// ── Catmull-Rom spline ───────────────────────────────────────
function cr(p0, p1, p2, p3, t) {
  const [x0,y0]=p0,[x1,y1]=p1,[x2,y2]=p2,[x3,y3]=p3, t2=t*t, t3=t2*t;
  return [
    .5*((2*x1)+(-x0+x2)*t+(2*x0-5*x1+4*x2-x3)*t2+(-x0+3*x1-3*x2+x3)*t3),
    .5*((2*y1)+(-y0+y2)*t+(2*y0-5*y1+4*y2-y3)*t2+(-y0+3*y1-3*y2+y3)*t3),
  ];
}

function buildPath(ctrl, n) {
  const pts=[], segs=ctrl.length-1, sps=Math.floor(n/segs);
  for (let i=0;i<segs;i++) {
    const p0=ctrl[Math.max(0,i-1)],p1=ctrl[i],p2=ctrl[i+1],p3=ctrl[Math.min(segs,i+2)];
    for (let j=0;j<sps;j++) pts.push(cr(p0,p1,p2,p3,j/sps));
  }
  pts.push(ctrl[ctrl.length-1]);
  return pts;
}

function buildNormals(pts) {
  return pts.map((_,i) => {
    const [ax,ay]=pts[Math.max(0,i-1)], [bx,by]=pts[Math.min(pts.length-1,i+1)];
    const dx=bx-ax, dy=by-ay, len=Math.hypot(dx,dy)||1;
    return [-dy/len, dx/len];
  });
}

// ── Mutable track ────────────────────────────────────────────
let PATH, NORM, LEFT, RIGHT;

function hasIntersection() {
  const step = 20;                     // sample every 20th point
  const minGap = 260;                  // skip comparisons within 260 indices along path
  const thr2 = (HALF_W * 2 + 4) ** 2; // squared overlap threshold

  for (let i = 0; i < PATH.length - minGap; i += step) {
    const [ax, ay] = PATH[i];
    for (let j = i + minGap; j < PATH.length; j += step) {
      const dx = ax - PATH[j][0], dy = ay - PATH[j][1];
      if (dx * dx + dy * dy < thr2) return true;
    }
  }
  return false;
}

function buildTrack() {
  let attempts = 0;
  do {
    const ctrl = generateControlPoints();
    PATH  = buildPath(ctrl, N_PTS);
    NORM  = buildNormals(PATH);
    LEFT  = PATH.map(([x,y],i) => [x+NORM[i][0]*HALF_W, y+NORM[i][1]*HALF_W]);
    RIGHT = PATH.map(([x,y],i) => [x-NORM[i][0]*HALF_W, y-NORM[i][1]*HALF_W]);
  } while (hasIntersection() && ++attempts < 12);
}

buildTrack();

// ── Game state ───────────────────────────────────────────────
let state='idle', mx=-999, my=-999;
let t0=0, elapsed=0, best=null;
let progressIdx=0, flashTimer=0;

// ── Helpers ──────────────────────────────────────────────────
function nearest(px, py) {
  let bestD=Infinity, bestI=0;
  const lo=Math.max(0, progressIdx-60);
  const hi=Math.min(PATH.length-1, progressIdx+280);
  for (let i=lo;i<=hi;i++) {
    const dx=PATH[i][0]-px, dy=PATH[i][1]-py, d=dx*dx+dy*dy;
    if (d<bestD){bestD=d;bestI=i;}
  }
  return {i:bestI, d:Math.sqrt(bestD)};
}

function inZone(px, py, idx) {
  const [zx,zy]=PATH[idx];
  return Math.hypot(px-zx, py-zy) < HALF_W;
}

function fmt(ms) { return (ms/1000).toFixed(3)+' s'; }

// ── DOM ──────────────────────────────────────────────────────
const timerEl      = document.getElementById('timer');
const bestEl       = document.getElementById('best-display');
const overlayStart = document.getElementById('overlay-start');
const overlayDead  = document.getElementById('overlay-dead');
const overlayWin   = document.getElementById('overlay-win');
const deadInfoEl   = document.getElementById('dead-info');
const winTimeEl    = document.getElementById('win-time-info');
const winRecEl     = document.getElementById('win-record-info');

document.getElementById('btn-start').addEventListener('click', () => {
  overlayStart.classList.add('hidden');
});
document.getElementById('btn-retry').addEventListener('click', reset);
document.getElementById('btn-again').addEventListener('click', reset);

function reset() {
  buildTrack();
  state='idle'; elapsed=0; progressIdx=0; flashTimer=0;
  timerEl.textContent='0.000 s';
  timerEl.style.color='white';
  overlayStart.classList.remove('hidden');
  overlayDead.classList.add('hidden');
  overlayWin.classList.add('hidden');
}

function die() {
  if (state!=='playing') return;
  state='dead'; flashTimer=1.0;
  const pct=Math.round(progressIdx/PATH.length*100);
  deadInfoEl.innerHTML=`Zeit: <strong>${fmt(elapsed)}</strong> &mdash; ${pct} % geschafft`;
  overlayDead.classList.remove('hidden');
  timerEl.style.color='#ff4d6d';
}

function win() {
  if (state!=='playing') return;
  state='win';
  const isNew=best===null||elapsed<best;
  if (isNew) best=elapsed;
  winTimeEl.innerHTML=`Zeit: <strong>${fmt(elapsed)}</strong>`;
  winRecEl.textContent=isNew ? '🏆 Neuer Rekord!' : `Bestzeit: ${fmt(best)}`;
  bestEl.textContent=`Best: ${fmt(best)}`;
  overlayWin.classList.remove('hidden');
  timerEl.style.color='#00e5ff';
}

// ── Render ───────────────────────────────────────────────────
function polyPath(pts, from, to) {
  ctx.moveTo(pts[from][0], pts[from][1]);
  for (let i=from+1;i<=to;i++) ctx.lineTo(pts[i][0],pts[i][1]);
}

function drawBg() {
  ctx.fillStyle='#04071a';
  ctx.fillRect(0,0,800,450);
  ctx.fillStyle='rgba(61,90,254,0.065)';
  for (let x=20;x<800;x+=40)
    for (let y=20;y<450;y+=40){
      ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
    }
}

function drawTrack() {
  ctx.beginPath();
  polyPath(LEFT,0,LEFT.length-1);
  for (let i=RIGHT.length-1;i>=0;i--) ctx.lineTo(RIGHT[i][0],RIGHT[i][1]);
  ctx.closePath();
  ctx.fillStyle='rgba(8,14,46,0.97)';
  ctx.fill();

  ctx.lineWidth=2.5;
  ctx.strokeStyle='rgba(61,90,254,0.7)';
  [LEFT,RIGHT].forEach(side=>{
    ctx.beginPath(); polyPath(side,0,side.length-1); ctx.stroke();
  });
}

function drawTrail() {
  if (progressIdx<2) return;
  ctx.beginPath();
  polyPath(PATH,0,progressIdx);
  ctx.strokeStyle='rgba(0,229,255,0.2)';
  ctx.lineWidth=HALF_W*2-7;
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.stroke();
}

function drawZones(ts) {
  const p=(Math.sin(ts*0.0042)+1)/2;
  const drawZone = ([zx,zy], color) => {
    const g=ctx.createRadialGradient(zx,zy,0,zx,zy,HALF_W);
    g.addColorStop(0,color.replace(')',`,${0.35+p*0.25})`).replace('rgb','rgba'));
    g.addColorStop(1,color.replace(')',',0)').replace('rgb','rgba'));
    ctx.beginPath(); ctx.arc(zx,zy,HALF_W,0,Math.PI*2);
    ctx.fillStyle=g; ctx.fill();
  };

  const [sx,sy]=PATH[0];
  const g1=ctx.createRadialGradient(sx,sy,0,sx,sy,HALF_W);
  g1.addColorStop(0,`rgba(0,230,118,${0.35+p*0.25})`);
  g1.addColorStop(1,'rgba(0,230,118,0)');
  ctx.beginPath(); ctx.arc(sx,sy,HALF_W,0,Math.PI*2);
  ctx.fillStyle=g1; ctx.fill();
  ctx.fillStyle=`rgba(0,230,118,${0.7+p*0.3})`;
  ctx.font='bold 10px Inter,sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('START',sx,sy);

  const [fx,fy]=PATH[PATH.length-1];
  const g2=ctx.createRadialGradient(fx,fy,0,fx,fy,HALF_W);
  g2.addColorStop(0,`rgba(0,229,255,${0.35+p*0.25})`);
  g2.addColorStop(1,'rgba(0,229,255,0)');
  ctx.beginPath(); ctx.arc(fx,fy,HALF_W,0,Math.PI*2);
  ctx.fillStyle=g2; ctx.fill();
  ctx.fillStyle=`rgba(0,229,255,${0.7+p*0.3})`;
  ctx.fillText('ZIEL',fx,fy);
}

function drawCursor() {
  if (mx<-100) return;
  ctx.shadowColor='rgba(255,255,255,0.8)';
  ctx.shadowBlur=10;
  ctx.beginPath(); ctx.arc(mx,my,5,0,Math.PI*2);
  ctx.fillStyle='white'; ctx.fill();
  ctx.shadowBlur=0;
}

function drawFlash() {
  ctx.fillStyle=`rgba(255,55,75,${flashTimer*0.45})`;
  ctx.fillRect(0,0,800,450);
  flashTimer=Math.max(0,flashTimer-0.055);
}

// ── Game loop ────────────────────────────────────────────────
requestAnimationFrame(function loop(ts) {
  requestAnimationFrame(loop);

  if (state==='playing') {
    elapsed=ts-t0;
    timerEl.textContent=fmt(elapsed);
    const {i,d}=nearest(mx,my);
    if (i>progressIdx) progressIdx=i;
    if (d>HALF_W+2) die();
    else if (progressIdx>PATH.length*0.92 && inZone(mx,my,PATH.length-1)) win();
  }

  if (state==='idle' && inZone(mx,my,0)) {
    state='playing'; t0=ts; elapsed=0; progressIdx=0;
    overlayStart.classList.add('hidden');
  }

  drawBg();
  drawTrack();
  if (state==='playing'||state==='win') drawTrail();
  drawZones(ts);
  drawCursor();
  if (flashTimer>0) drawFlash();
});

// ── Mouse ────────────────────────────────────────────────────
canvas.addEventListener('mousemove', e => {
  const r=canvas.getBoundingClientRect();
  mx=(e.clientX-r.left)*(800/r.width);
  my=(e.clientY-r.top)*(450/r.height);
});

canvas.addEventListener('mouseleave', () => {
  if (state==='playing') { deadInfoEl.innerHTML='Maus hat den Bereich verlassen!'; die(); }
  mx=-999; my=-999;
});

// ── Scaling ──────────────────────────────────────────────────
function scaleCanvas() {
  const s=Math.min((window.innerWidth-32)/800,(window.innerHeight-80)/450,1.5);
  canvas.style.transform=`scale(${s})`;
}
window.addEventListener('resize',scaleCanvas);
scaleCanvas();
