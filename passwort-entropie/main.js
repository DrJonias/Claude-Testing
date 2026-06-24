const input     = document.getElementById('pw-input');
const fillBar   = document.getElementById('strength-fill');
const strLabel  = document.getElementById('strength-label');
const entropyEl = document.getElementById('entropy-number');
const descEl    = document.getElementById('entropy-desc');
const chipEls   = {
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

// guesses per second for each attacker tier
const SPEEDS = {
  online:  1e3,        // throttled online attack
  fast:    1e8,        // dedicated offline cracker
  gpu:     1e11,       // high-end GPU rig
  cluster: 1e14,       // nation-state cluster
};

function getPool(pw) {
  let pool = 0;
  const has = {
    lower:  /[a-z]/.test(pw),
    upper:  /[A-Z]/.test(pw),
    digits: /[0-9]/.test(pw),
    symbol: /[^a-zA-Z0-9]/.test(pw),
  };
  if (has.lower)  pool += 26;
  if (has.upper)  pool += 26;
  if (has.digits) pool += 10;
  if (has.symbol) pool += 32;
  return { pool, has };
}

function entropy(pw) {
  const { pool } = getPool(pw);
  if (!pw.length || pool === 0) return 0;
  return pw.length * Math.log2(pool);
}

function formatTime(seconds) {
  if (seconds < 1e-3)   return '< 1 ms';
  if (seconds < 1)      return `${(seconds * 1000).toFixed(0)} ms`;
  if (seconds < 60)     return `${seconds.toFixed(1)} Sek`;
  if (seconds < 3600)   return `${(seconds / 60).toFixed(1)} Min`;
  if (seconds < 86400)  return `${(seconds / 3600).toFixed(1)} Std`;
  if (seconds < 365.25 * 86400) return `${(seconds / 86400).toFixed(0)} Tage`;
  const years = seconds / (365.25 * 86400);
  if (years < 1e6)      return `${years.toLocaleString('de-DE', {maximumFractionDigits: 0})} Jahre`;
  if (years < 1e9)      return `${(years / 1e6).toFixed(1)} Mio. Jahre`;
  if (years < 1e12)     return `${(years / 1e9).toFixed(1)} Mrd. Jahre`;
  return '> Universumsalter';
}

function crackTime(bits, guessesPerSec) {
  if (bits === 0) return '—';
  // average case: half the keyspace
  const avgGuesses = Math.pow(2, bits) / 2;
  const secs = avgGuesses / guessesPerSec;
  return formatTime(secs);
}

const LEVELS = [
  { max: 25,  label: 'Sehr schwach', color: '#ff4d6d', pct: 10 },
  { max: 40,  label: 'Schwach',      color: '#ff9500', pct: 28 },
  { max: 55,  label: 'Mittel',       color: '#ffe600', pct: 50 },
  { max: 70,  label: 'Stark',        color: '#00e676', pct: 72 },
  { max: 90,  label: 'Sehr stark',   color: '#00e5ff', pct: 88 },
  { max: Infinity, label: 'Extrem',  color: '#b06fff', pct: 100 },
];

function getLevel(bits) {
  return LEVELS.find(l => bits <= l.max) ?? LEVELS.at(-1);
}

const DESCS = [
  [25,  'Trivial zu knacken — selbst ein Smartphone schafft das in Sekunden.'],
  [40,  'Zu schwach für ernsthafte Sicherheit. Leicht mit Standard-Tools knackbar.'],
  [55,  'Akzeptabel für wenig kritische Accounts, aber kein Hochsicherheitspasswort.'],
  [70,  'Gute Entropie. Hält schnellen Offline-Angriffen mehrere Tage stand.'],
  [90,  'Sehr stark. Selbst GPU-Cluster brauchen Jahre.'],
  [Infinity, 'Außergewöhnlich stark. Praktisch unknackbar mit heutiger Hardware.'],
];

function getDesc(bits) {
  return DESCS.find(([max]) => bits <= max)?.[1] ?? DESCS.at(-1)[1];
}

function update() {
  const pw = input.value;
  const bits = entropy(pw);
  const { has } = getPool(pw);
  const level = getLevel(bits);

  // entropy number
  entropyEl.textContent = pw.length ? Math.round(bits) : '—';
  entropyEl.style.color = pw.length ? level.color : 'var(--muted)';

  // description
  descEl.textContent = pw.length ? getDesc(bits) : 'Gib ein Passwort ein, um die Entropie zu berechnen.';

  // strength bar
  fillBar.style.width  = pw.length ? level.pct + '%' : '0%';
  fillBar.style.background = level.color;
  strLabel.textContent = pw.length ? level.label : '';
  strLabel.style.color = level.color;

  // pool chips
  Object.entries(has).forEach(([key, active]) => {
    chipEls[key].classList.toggle('active', active);
  });

  // crack times
  Object.entries(SPEEDS).forEach(([key, speed]) => {
    timeEls[key].textContent = crackTime(bits, speed);
    timeEls[key].style.color = pw.length ? level.color : 'var(--muted)';
  });
}

input.addEventListener('input', update);

// show / hide password
const toggleBtn = document.getElementById('toggle-vis');
const eyeOpen   = document.getElementById('eye-open');
const eyeClosed = document.getElementById('eye-closed');

toggleBtn.addEventListener('click', () => {
  const hidden = input.type === 'password';
  input.type = hidden ? 'text' : 'password';
  eyeOpen.style.display   = hidden ? 'none'  : 'block';
  eyeClosed.style.display = hidden ? 'block' : 'none';
});

// init
update();
