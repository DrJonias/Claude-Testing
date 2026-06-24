// QuickDraw — app.js

const CELL        = 10;   // each drawn pixel = 10×10 on the 280px canvas
const CANVAS_SIZE = 280;
const INFER_MS    = 500;  // classification interval
const WIN_TOP_K   = 10;   // check top-10 results for a match
const WIN_CONF    = 0.08; // minimum confidence to accept a win

// ── Data (loaded async) ───────────────────────────────────────
let labels   = {}; // { "airplane": "Flugzeug", ... }
let playable = []; // ["airplane", "alarm clock", ...]

async function loadData() {
  const [l, p] = await Promise.all([
    fetch('../data/quickdraw-labels.json').then(r => r.json()),
    fetch('../data/quickdraw-playable.json').then(r => r.json()),
  ]);
  labels   = l;
  playable = p;
}

function toDE(en) {
  return labels[en.toLowerCase()] ?? en;
}

// ── Game state ────────────────────────────────────────────────
let classifier  = null;
let p5sketch    = null;
let currentWord = null; // { en, de }
let penSize     = 1;    // grid cells
let timerHandle = null;
let inferHandle = null;
let startTime   = null;
let hasDrawn    = false;
let round       = 1;
let won         = false;

// ── p5.js sketch (instance mode) ─────────────────────────────
function initSketch() {
  new p5(p => {
    p5sketch = p;
    let isDrawing = false;

    p.setup = () => {
      p.pixelDensity(1);
      p.createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent('canvas-container');
      p.background(255);
      p.noStroke();
    };

    p.draw = () => {};

    function paintCell(x, y) {
      const gx = Math.floor(x / CELL) * CELL;
      const gy = Math.floor(y / CELL) * CELL;
      p.fill(0);
      p.rect(gx, gy, penSize * CELL, penSize * CELL);
    }

    function paintLine(x1, y1, x2, y2) {
      const dx = x2 - x1, dy = y2 - y1;
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (CELL / 2)));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        paintCell(x1 + dx * t, y1 + dy * t);
      }
    }

    function beginStroke() {
      isDrawing = true;
      document.getElementById('canvas-container').classList.add('drawing');
      if (!hasDrawn && !won) { hasDrawn = true; startTimer(); }
    }

    function endStroke() {
      isDrawing = false;
      document.getElementById('canvas-container').classList.remove('drawing');
    }

    function inBounds() {
      return p.mouseX >= 0 && p.mouseX <= p.width
          && p.mouseY >= 0 && p.mouseY <= p.height;
    }

    p.mousePressed  = () => { if (!inBounds()) return; beginStroke(); paintCell(p.mouseX, p.mouseY); };
    p.mouseDragged  = () => { if (!isDrawing || won) return; paintLine(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY); };
    p.mouseReleased = () => endStroke();

    p.touchStarted = () => {
      if (!inBounds()) return false;
      beginStroke(); paintCell(p.mouseX, p.mouseY); return false;
    };
    p.touchMoved = () => {
      if (!isDrawing || won) return false;
      const t = p.touches[0];
      const r = p.canvas.getBoundingClientRect();
      const x = (t.clientX - r.left) * (p.width  / r.width);
      const y = (t.clientY - r.top)  * (p.height / r.height);
      paintLine(p.pmouseX, p.pmouseY, x, y);
      return false;
    };
    p.touchEnded = () => { endStroke(); return false; };
  });
}

// ── Model ─────────────────────────────────────────────────────
function getClassifyCanvas() {
  const tmp = document.createElement('canvas');
  tmp.width = 28; tmp.height = 28;
  const ctx = tmp.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(p5sketch.canvas, 0, 0, 28, 28);
  return tmp;
}

async function initClassifier() {
  try {
    classifier = await ml5.imageClassifier('DoodleNet');
    document.getElementById('statusDot').className    = 'status-dot ready';
    document.getElementById('statusText').textContent = 'KI bereit!';
    document.getElementById('startBtn').disabled      = false;
  } catch (err) {
    document.getElementById('statusText').textContent = 'Ladefehler – Seite neu laden';
    console.error('DoodleNet load error:', err);
  }
}

// ── Timer ─────────────────────────────────────────────────────
function startTimer() {
  startTime   = Date.now();
  timerHandle = setInterval(() => {
    const s  = (Date.now() - startTime) / 1000;
    const el = document.getElementById('timer');
    el.textContent = s.toFixed(1) + 's';
    el.className   = 'timer ' + (s < 10 ? 'fast' : s < 20 ? '' : 'slow');
  }, 100);
}

function stopTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
}

// ── Classification ────────────────────────────────────────────
function runClassify() {
  if (!classifier || !hasDrawn || won || !p5sketch) return;
  classifier.classify(getClassifyCanvas()).then(results => {
    if (!results || won) return;
    updatePredUI(results.slice(0, 5));
    const match = results.slice(0, WIN_TOP_K).find(
      r => r.label.toLowerCase() === currentWord.en.toLowerCase()
    );
    if (match?.confidence > WIN_CONF) triggerWin();
  }).catch(() => {});
}

function updatePredUI(results) {
  const target = currentWord.en.toLowerCase();
  document.getElementById('predList').innerHTML = results.map(r => {
    const pct     = Math.round(r.confidence * 100);
    const isMatch = r.label.toLowerCase() === target;
    return `
      <div class="pred-item">
        <div class="pred-top">
          <span class="pred-name ${isMatch ? 'match' : ''}">${toDE(r.label)}</span>
          <span class="pred-pct">${pct}%</span>
        </div>
        <div class="pred-bar-wrap">
          <div class="pred-bar ${isMatch ? 'match' : ''}" style="width:${Math.min(pct, 100)}%"></div>
        </div>
      </div>`;
  }).join('');

  if (results[0]) {
    document.getElementById('topGuess').textContent = toDE(results[0].label);
  }
}

// ── Game actions ──────────────────────────────────────────────
function startGame() {
  document.getElementById('startScreen').classList.add('hidden');
  nextRound();
}

function nextRound() {
  won = false; hasDrawn = false;
  stopTimer();
  clearInterval(inferHandle);
  document.getElementById('winOverlay').classList.add('hidden');
  document.getElementById('canvas-container').classList.remove('win');

  const en    = playable[Math.floor(Math.random() * playable.length)];
  currentWord = { en, de: toDE(en) };

  document.getElementById('wordDE').textContent   = currentWord.de;
  document.getElementById('wordEN').textContent   = `(${currentWord.en})`;
  document.getElementById('roundNum').textContent = round++;
  document.getElementById('timer').textContent    = '0.0s';
  document.getElementById('timer').className      = 'timer';
  document.getElementById('topGuess').textContent = '–';
  document.getElementById('predList').innerHTML   =
    '<div class="pred-empty">Fange an zu zeichnen…</div>';

  if (p5sketch) p5sketch.background(255);
  inferHandle = setInterval(runClassify, INFER_MS);
}

function clearDrawing() {
  if (p5sketch) p5sketch.background(255);
  hasDrawn = false;
  stopTimer();
  document.getElementById('timer').textContent    = '0.0s';
  document.getElementById('timer').className      = 'timer';
  document.getElementById('predList').innerHTML   =
    '<div class="pred-empty">Fange an zu zeichnen…</div>';
  document.getElementById('topGuess').textContent = '–';
}

function triggerWin() {
  if (won) return;
  won = true;
  stopTimer();
  clearInterval(inferHandle);
  document.getElementById('canvas-container').classList.add('win');
  const elapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '?';
  document.getElementById('winSub').textContent  = `Die KI hat „${currentWord.de}" erkannt!`;
  document.getElementById('winTime').textContent = elapsed;
  document.getElementById('winOverlay').classList.remove('hidden');
  launchConfetti();
}

// ── Confetti ──────────────────────────────────────────────────
function launchConfetti() {
  const cc  = document.getElementById('confettiCanvas');
  cc.width  = window.innerWidth;
  cc.height = window.innerHeight;
  const ctx    = cc.getContext('2d');
  const COLORS = ['#7c6aff', '#ff6ab0', '#3dffa0', '#ffb347', '#4fc3f7'];

  const pieces = Array.from({ length: 130 }, () => ({
    x:     Math.random() * cc.width,
    y:     -10 - Math.random() * 300,
    r:     4 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx:    (Math.random() - .5) * 5,
    vy:    2 + Math.random() * 5,
    angle: Math.random() * 360,
    spin:  (Math.random() - .5) * 7,
  }));

  let frame = 0;
  (function tick() {
    ctx.clearRect(0, 0, cc.width, cc.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      ctx.restore();
    });
    if (++frame < 150) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, cc.width, cc.height);
  })();
}

// ── Pen size buttons ──────────────────────────────────────────
document.querySelectorAll('.pen-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    penSize = parseInt(btn.dataset.size, 10);
    document.querySelectorAll('.pen-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Action buttons ────────────────────────────────────────────
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('nextRoundBtn').addEventListener('click', nextRound);
document.getElementById('clearBtn').addEventListener('click', clearDrawing);
document.getElementById('skipBtn').addEventListener('click', nextRound);

// ── Init ──────────────────────────────────────────────────────
(async function init() {
  await loadData();
  initSketch();
  // Wait for ml5 to be available (loaded via CDN script tag)
  const waitForMl5 = () =>
    typeof ml5 !== 'undefined' ? initClassifier() : setTimeout(waitForMl5, 100);
  waitForMl5();
})();
