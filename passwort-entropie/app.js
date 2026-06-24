// Passwort-Entropie — app.js

// ── DOM ────────────────────────────────────────────────────────
const input    = document.getElementById('pw-input');
const fillBar  = document.getElementById('strength-fill');
const strLabel = document.getElementById('strength-label');
const entropyEl = document.getElementById('entropy-number');
const descEl    = document.getElementById('entropy-desc');

const chipEls = {
  lower:  document.getElementById('chip-lower'),
  upper:  document.getElementById('chip-upper'),
  digits: document.getElementById('chip-digits'),
  symbol: document.getElementById('chip-symbol'),
};

const timeEls = {
  online:  document.getElementById('time-online'),
  fast:    document.getElementById('time-fast'),
  gpu:     document.getElementById('time-gpu'),
  cluster: document.getElementById('time-cluster'),
};

// ── Constants ──────────────────────────────────────────────────
const SPEEDS = {
  online:  1e3,   // throttled online attack
  fast:    1e8,   // dedicated offline cracker
  gpu:     1e11,  // high-end GPU rig
  cluster: 1e14,  // nation-state cluster
};

const STRENGTH_LEVELS = [
  { max: 25,       label: 'Sehr schwach', color: '#ff4d6d', pct: 10  },
  { max: 40,       label: 'Schwach',      color: '#ff9500', pct: 28  },
  { max: 55,       label: 'Mittel',       color: '#ffe600', pct: 50  },
  { max: 70,       label: 'Stark',        color: '#00e676', pct: 72  },
  { max: 90,       label: 'Sehr stark',   color: '#00e5ff', pct: 88  },
  { max: Infinity, label: 'Extrem',       color: '#b06fff', pct: 100 },
];

const DESCRIPTIONS = [
  [25,       'Trivial zu knacken — selbst ein Smartphone schafft das in Sekunden.'],
  [40,       'Zu schwach für ernsthafte Sicherheit. Leicht mit Standard-Tools knackbar.'],
  [55,       'Akzeptabel für wenig kritische Accounts, aber kein Hochsicherheitspasswort.'],
  [70,       'Gute Entropie. Hält schnellen Offline-Angriffen mehrere Tage stand.'],
  [90,       'Sehr stark. Selbst GPU-Cluster brauchen Jahre.'],
  [Infinity, 'Außergewöhnlich stark. Praktisch unknackbar mit heutiger Hardware.'],
];

// ── Entropy math ───────────────────────────────────────────────
function getCharPool(pw) {
  const has = {
    lower:  /[a-z]/.test(pw),
    upper:  /[A-Z]/.test(pw),
    digits: /[0-9]/.test(pw),
    symbol: /[^a-zA-Z0-9]/.test(pw),
  };
  let size = 0;
  if (has.lower)  size += 26;
  if (has.upper)  size += 26;
  if (has.digits) size += 10;
  if (has.symbol) size += 32;
  return { size, has };
}

function calcEntropy(pw) {
  const { size } = getCharPool(pw);
  return pw.length && size ? pw.length * Math.log2(size) : 0;
}

function crackTime(bits, guessesPerSec) {
  if (!bits) return '—';
  const avgGuesses = Math.pow(2, bits) / 2;
  return formatTime(avgGuesses / guessesPerSec);
}

function formatTime(secs) {
  if (secs < 1e-3)            return '< 1 ms';
  if (secs < 1)               return `${(secs * 1000).toFixed(0)} ms`;
  if (secs < 60)              return `${secs.toFixed(1)} Sek`;
  if (secs < 3600)            return `${(secs / 60).toFixed(1)} Min`;
  if (secs < 86400)           return `${(secs / 3600).toFixed(1)} Std`;
  if (secs < 365.25 * 86400)  return `${(secs / 86400).toFixed(0)} Tage`;
  const years = secs / (365.25 * 86400);
  if (years < 1e6)  return `${years.toLocaleString('de-DE', { maximumFractionDigits: 0 })} Jahre`;
  if (years < 1e9)  return `${(years / 1e6).toFixed(1)} Mio. Jahre`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} Mrd. Jahre`;
  return '> Universumsalter';
}

function getLevel(bits) {
  return STRENGTH_LEVELS.find(l => bits <= l.max) ?? STRENGTH_LEVELS.at(-1);
}

function getDescription(bits) {
  return DESCRIPTIONS.find(([max]) => bits <= max)?.[1] ?? DESCRIPTIONS.at(-1)[1];
}

// ── Render ─────────────────────────────────────────────────────
function update() {
  const pw   = input.value;
  const bits = calcEntropy(pw);
  const { has } = getCharPool(pw);
  const level = getLevel(bits);
  const empty = !pw.length;

  entropyEl.textContent = empty ? '—'         : Math.round(bits);
  entropyEl.style.color = empty ? 'var(--muted)' : level.color;

  descEl.textContent = empty
    ? 'Gib ein Passwort ein, um die Entropie zu berechnen.'
    : getDescription(bits);

  fillBar.style.width      = empty ? '0%'    : level.pct + '%';
  fillBar.style.background = level.color;
  strLabel.textContent     = empty ? ''       : level.label;
  strLabel.style.color     = level.color;

  Object.entries(has).forEach(([key, active]) => {
    chipEls[key].classList.toggle('active', active);
  });

  Object.entries(SPEEDS).forEach(([key, speed]) => {
    timeEls[key].textContent = crackTime(bits, speed);
    timeEls[key].style.color = empty ? 'var(--muted)' : level.color;
  });
}

// ── Password visibility toggle ────────────────────────────────
const toggleBtn = document.getElementById('toggle-vis');
const eyeOpen   = document.getElementById('eye-open');
const eyeClosed = document.getElementById('eye-closed');

toggleBtn.addEventListener('click', () => {
  const reveal = input.type === 'password';
  input.type              = reveal ? 'text'  : 'password';
  eyeOpen.style.display   = reveal ? 'none'  : '';
  eyeClosed.style.display = reveal ? ''      : 'none';
});

// ── Init ───────────────────────────────────────────────────────
input.addEventListener('input', update);
update();
