// Fake-O-Meter — app.js

const RATINGS = [
  { min: 90, emoji: '🎯', title: 'Meisterdetektiv!',     text: 'Du erkennst Trumps Realität vom Chaos. Beeindruckend.' },
  { min: 70, emoji: '🦅', title: 'Scharfsinnig!',        text: 'Gut gemacht – du lässt dich selten täuschen.' },
  { min: 50, emoji: '😕', title: 'Durchschnittlich verwirrt', text: 'Trump macht das absichtlich schwer. Du bist nicht allein.' },
  { min: 30, emoji: '😱', title: 'Leicht beeinflussbar', text: 'Vorsicht: die Realität ist oft absurder als Fiktion.' },
  { min: 0,  emoji: '🤦', title: 'Du glaubst alles',     text: 'Tipp: Wenn es unglaublich klingt, googel es zuerst.' },
];

// State
let quotes   = [];
let shuffled = [];
let current  = 0;
let score    = 0;

// ── Data ──────────────────────────────────────────────────────
async function loadQuotes() {
  const res = await fetch('../data/fakemeter-quotes.json');
  quotes = await res.json();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── DOM helpers ───────────────────────────────────────────────
const el = id => document.getElementById(id);

function show(id)   { el(id).classList.remove('hidden'); }
function hide(id)   { el(id).classList.add('hidden'); }
function toggle(id, visible) { el(id).classList.toggle('hidden', !visible); }

// ── Screens ───────────────────────────────────────────────────
function showStart() {
  show('startScreen');
  hide('gameScreen');
  hide('endScreen');
}

function showGame() {
  hide('startScreen');
  hide('endScreen');
  show('gameScreen');
}

function showEnd() {
  hide('startScreen');
  hide('gameScreen');

  const pct = Math.round((score / shuffled.length) * 100);
  const rating = RATINGS.find(r => pct >= r.min);

  el('endEmoji').textContent  = rating.emoji;
  el('endTitle').textContent  = rating.title;
  el('endScore').textContent  = `${score} / ${shuffled.length}`;
  el('endRating').textContent = rating.text;

  show('endScreen');
}

// ── Game ──────────────────────────────────────────────────────
function startGame() {
  shuffled = shuffle(quotes);
  current  = 0;
  score    = 0;
  showGame();
  renderQuestion();
}

function renderQuestion() {
  const q = shuffled[current];

  el('quoteText').textContent   = q.text;
  el('quoteSource').textContent = 'Trump-Zitat';
  el('questionNum').textContent = current + 1;
  el('questionTotal').textContent = shuffled.length;

  const pct = (current / shuffled.length) * 100;
  el('progressFill').style.width = pct + '%';

  el('quoteCard').className = 'quote-card';
  hide('revealArea');
  show('guessButtons');

  el('scoreDisplay').textContent = score;
}

function guess(userSaysReal) {
  const q       = shuffled[current];
  const correct = userSaysReal === q.isReal;

  if (correct) score++;

  // Colour the quote card
  el('quoteCard').classList.add(correct ? 'card-correct' : 'card-wrong');

  // Populate reveal
  el('revealVerdict').textContent  = correct ? '✓ Richtig!' : '✗ Falsch!';
  el('revealVerdict').className    = `reveal-verdict ${correct ? 'correct' : 'wrong'}`;
  el('revealNote').textContent     = q.isReal
    ? `Echt — ${q.note}`
    : `Erfunden — ${q.note}`;

  const sourceLink = el('revealSourceLink');
  if (q.source) {
    sourceLink.href        = q.source;
    sourceLink.textContent = `Quelle: ${q.sourceLabel} →`;
    sourceLink.classList.remove('hidden');
  } else {
    sourceLink.classList.add('hidden');
  }

  hide('guessButtons');
  show('revealArea');
}

function nextQuestion() {
  current++;
  if (current >= shuffled.length) {
    showEnd();
  } else {
    renderQuestion();
  }
}

// ── Events ────────────────────────────────────────────────────
el('startBtn').addEventListener('click', startGame);
el('restartBtn').addEventListener('click', startGame);
el('btnEcht').addEventListener('click', () => guess(true));
el('btnFake').addEventListener('click', () => guess(false));
el('nextBtn').addEventListener('click', nextQuestion);

// ── Init ──────────────────────────────────────────────────────
loadQuotes().catch(err => {
  console.error('Fehler beim Laden der Fragen:', err);
});
