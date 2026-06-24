const ALL_QUOTES = [
  // ── ECHTE ZITATE ──────────────────────────────────────────────────────────
  {
    text: "Despite the constant negative press covfefe",
    real: true,
    type: "tweet",
    date: "31. Mai 2017, 00:06 Uhr",
    source: "Twitter / @realDonaldTrump",
    sourceUrl: "https://www.bbc.com/news/world-us-canada-40096116",
    note: "Der unvollständige Tweet blieb über 6 Stunden online, bevor er gelöscht wurde. Das Weiße Haus erklärte danach, nur bestimmte Personen würden die wahre Bedeutung verstehen."
  },
  {
    text: "I could stand in the middle of Fifth Avenue and shoot somebody and I wouldn't lose any voters, okay? It's, like, incredible.",
    real: true,
    type: "rede",
    date: "23. Januar 2016",
    source: "Wahlkampfveranstaltung, Sioux Center, Iowa",
    sourceUrl: "https://www.bbc.com/news/av/world-us-canada-35381008",
    note: "Das Publikum lachte und applaudierte."
  },
  {
    text: "Nobody knew health care could be so complicated.",
    real: true,
    type: "rede",
    date: "27. Februar 2017",
    source: "Treffen mit Gouverneuren im Weißen Haus",
    sourceUrl: "https://www.politico.com/story/2017/02/trump-health-care-complicated-235436",
    note: "Das amerikanische Gesundheitssystem gilt seit Jahrzehnten als eines der kompliziertesten der Welt."
  },
  {
    text: "The concept of global warming was created by and for the Chinese in order to make U.S. manufacturing non-competitive.",
    real: true,
    type: "tweet",
    date: "6. November 2012",
    source: "Twitter / @realDonaldTrump",
    sourceUrl: "https://www.politifact.com/truth-o-meter/statements/2016/jun/03/hillary-clinton/yes-donald-trump-did-call-climate-change-chinese-h/",
    note: "Dieser Tweet wurde später gelöscht, ist aber vielfach archiviert und von Politifact verifiziert."
  },
  {
    text: "Sorry losers and haters, but my I.Q. is one of the highest — and you all know it! Please don't feel so stupid or insecure; it's not your fault",
    real: true,
    type: "tweet",
    date: "8. Mai 2013",
    source: "Twitter / @realDonaldTrump",
    sourceUrl: "https://www.businessinsider.com/donald-trump-iq-tweet-2016-2",
    note: "Einer der bekanntesten Tweets von Trump. Kein IQ-Test-Ergebnis wurde je veröffentlicht."
  },
  {
    text: "Two Corinthians, 3:17, that's the whole ballgame. Where the spirit of the Lord — right? Where the spirit of the Lord is, there is liberty.",
    real: true,
    type: "rede",
    date: "18. Januar 2016",
    source: "Rede an der Liberty University, Lynchburg, Virginia",
    sourceUrl: "https://www.washingtonpost.com/news/acts-of-faith/wp/2016/01/18/donald-trump-just-said-two-corinthians-and-the-crowd-loved-it/",
    note: "Die korrekte Bezeichnung lautet \"Second Corinthians\" (oder \"2. Korinther\"). Theologen und Gläubige bemerkten den Fehler sofort."
  },
  {
    text: "And then I see the disinfectant, where it knocks it out in a minute — one minute — and is there a way we can do something like that by injection inside, or almost a cleaning?",
    real: true,
    type: "rede",
    date: "23. April 2020",
    source: "COVID-19-Pressekonferenz im Weißen Haus",
    sourceUrl: "https://www.bbc.com/news/world-us-canada-52407177",
    note: "Ärzte und Gesundheitsbehörden reagierten mit Entsetzen. Danach stieg die Anzahl von Anrufen bei Giftnotrufzentralen stark an. Trump erklärte später, er habe es \"sarkastisch\" gemeint."
  },
  {
    text: "They say the noise causes cancer. You tell me that one, okay?",
    real: true,
    type: "rede",
    date: "2. April 2019",
    source: "Dinner des National Republican Congressional Committee, Washington D.C.",
    sourceUrl: "https://www.independent.co.uk/news/world/americas/us-politics/trump-windmills-cancer-noise-renewable-energy-a8853126.html",
    note: "Über Windräder. Es gibt keinen wissenschaftlichen Beleg dafür, dass Windräder Krebs verursachen."
  },
  {
    text: "I alone can fix it.",
    real: true,
    type: "rede",
    date: "21. Juli 2016",
    source: "Republican National Convention, Cleveland, Ohio",
    sourceUrl: "https://www.nytimes.com/2016/07/22/us/politics/transcript-donald-trump-nomination-acceptance-speech-at-rnc.html",
    note: "Die Kernaussage seiner Rede zur offiziellen Nominierung als Präsidentschaftskandidat der Republikaner."
  },
  {
    text: "I know more about ISIS than the generals do, believe me.",
    real: true,
    type: "rede",
    date: "12. November 2015",
    source: "Wahlkampfveranstaltung, Fort Dodge, Iowa",
    sourceUrl: "https://www.politifact.com/truth-o-meter/statements/2016/jan/17/donald-trump/donald-trump-said-he-knows-more-about-isis-militar/",
    note: "Er wiederholte diese Aussage in leicht abgewandelter Form mehrmals während des Wahlkampfs."
  },
  {
    text: "Look at my African-American over here! Look at him.",
    real: true,
    type: "rede",
    date: "3. Juni 2016",
    source: "Wahlkampfveranstaltung, Redding, Kalifornien",
    sourceUrl: "https://www.theguardian.com/us-news/2016/jun/03/donald-trump-look-at-my-african-american-rally",
    note: "Er deutete dabei auf einen schwarzen Unterstützer in der Menge. Der Betreffende erklärte später, kein Trump-Unterstützer zu sein."
  },
  {
    text: "I have a natural instinct for science.",
    real: true,
    type: "interview",
    date: "15. Oktober 2018",
    source: "60 Minutes, CBS News",
    sourceUrl: "https://www.cbsnews.com/news/donald-trump-full-interview-60-minutes-transcript-2018-10-14/",
    note: "Gesagt im Kontext der Frage, ob er an den menschengemachten Klimawandel glaube. Er sagte, das Klima werde sich \"irgendwann wieder abkühlen\"."
  },

  // ── ERFUNDENE ZITATE ──────────────────────────────────────────────────────
  {
    text: "I've read more books than any president in history. More than Lincoln, more than Jefferson — people are genuinely stunned when they find out.",
    real: false,
    type: "interview",
    date: "—",
    note: "Frei erfunden. Mehrere Journalisten berichteten, Trump lese selten Bücher und bevorzuge TV. Sein ehemaliger Stabschef beschrieb ihn als jemanden, der keine Freude am Lesen habe."
  },
  {
    text: "Sharks are very, very unfair animals. They have no respect. Everybody talks about how dangerous they are — nobody talks about how unfair they are. Very dishonest animals.",
    real: false,
    type: "rede",
    date: "—",
    note: "Frei erfunden. Trump hat aber tatsächlich eine bekannte Abneigung gegen Haie — er soll in Interviews geäußert haben, Schadenfreude zu empfinden, wenn Haie Wissenschaftler angreifen."
  },
  {
    text: "I basically invented Twitter. People don't talk about this. Without my presence, without what I built on that platform — there is no Twitter. Jack knows this.",
    real: false,
    type: "interview",
    date: "—",
    note: "Frei erfunden. Twitter wurde 2006 von Jack Dorsey, Noah Glass, Biz Stone und Evan Williams gegründet."
  },
  {
    text: "My doctor — great doctor, one of the best — he looked at my bloodwork and he started crying. He said, 'Sir, in 40 years I have never seen numbers like this.' The most perfect blood.",
    real: false,
    type: "rede",
    date: "—",
    note: "Frei erfunden — aber angelehnt an einen echten Arztbrief: Trumps Arzt Dr. Harold Bornstein schrieb 2015, Trump wäre \"der gesündeste Einzelperson, der jemals für die Präsidentschaft kandidiert hat\"."
  },
  {
    text: "Coffee is a total disaster. Overrated, very overrated. I've never had a cup of coffee in my life. Smart people don't drink coffee — this is a fact.",
    real: false,
    type: "interview",
    date: "—",
    note: "Frei erfunden. Es stimmt allerdings, dass Trump keinen Kaffee und keinen Alkohol trinkt."
  },
  {
    text: "I speak six languages. I don't like to talk about it — I'm very humble — but people who work with me know. Six languages, very fluently.",
    real: false,
    type: "rede",
    date: "—",
    note: "Frei erfunden. Trump spricht ausschließlich Englisch."
  },
  {
    text: "The Great Wall of China — beautiful wall, very good wall — was actually inspired by some of my early ideas on border security. Several historians have confirmed this to me.",
    real: false,
    type: "tweet",
    date: "—",
    note: "Frei erfunden. Die Große Mauer wurde zwischen dem 7. Jahrhundert v. Chr. und dem 17. Jahrhundert n. Chr. gebaut."
  },
  {
    text: "Every dog I've ever met immediately loved me. Immediately. They run to me. Animals sense greatness — they really do. It's incredible.",
    real: false,
    type: "rede",
    date: "—",
    note: "Frei erfunden. Trump ist tatsächlich der erste US-Präsident seit über 100 Jahren ohne Haustier im Weißen Haus."
  },
  {
    text: "Trees are not doing a great job, frankly. We should be getting a lot more out of them. They are very, very lazy. Sad!",
    real: false,
    type: "tweet",
    date: "—",
    note: "Frei erfunden — auch wenn es stilistisch täuschend echt klingt."
  },
  {
    text: "I invented the concept of the press conference. Before me, nobody really did press conferences properly. I made them what they are today. You're welcome.",
    real: false,
    type: "rede",
    date: "—",
    note: "Frei erfunden. Pressekonferenzen im Weißen Haus gehen auf Woodrow Wilson (1913) zurück."
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── State ────────────────────────────────────────────────────────────────────
let questions = [];
let current = 0;
let score = 0;
let answered = false;

const BADGE_ICONS = { tweet: "🐦 Tweet", rede: "🎤 Rede", interview: "📺 Interview" };
const RATINGS = [
  { min: 90, emoji: "🏆", title: "Perfekter Fake-O-Meter!", text: "Du erkennst Trump-Nonsense aus 100 Metern Entfernung." },
  { min: 70, emoji: "🔍", title: "Scharfe Nase!", text: "Du lässt dich kaum täuschen. Respekt." },
  { min: 50, emoji: "🤔", title: "Durchschnitt", text: "Trump ist eben unberechenbar – das Echte klingt oft gefakter als das Erfundene." },
  { min: 30, emoji: "🎲", title: "Kaum besser als Zufall", text: "Vielleicht nochmal lesen, was er wirklich gesagt hat?" },
  { min:  0, emoji: "😵", title: "Glaubst du alles?", text: "Du wärst ein gefundenes Fressen für Desinformation." },
];

// ── DOM ──────────────────────────────────────────────────────────────────────
const startScreen   = document.getElementById('startScreen');
const gameScreen    = document.getElementById('gameScreen');
const endScreen     = document.getElementById('endScreen');

const quoteBadge    = document.getElementById('quoteBadge');
const quoteText     = document.getElementById('quoteText');
const quoteDate     = document.getElementById('quoteDate');
const quoteCard     = document.getElementById('quoteCard');

const revealArea    = document.getElementById('revealArea');
const verdictEl     = document.getElementById('verdict');
const sourceInfo    = document.getElementById('sourceInfo');
const quoteNoteEl   = document.getElementById('quoteNote');

const guessButtons  = document.getElementById('guessButtons');
const nextArea      = document.getElementById('nextArea');

const scoreCorrectEl = document.getElementById('scoreCorrect');
const scoreTotalEl   = document.getElementById('scoreTotal');
const progressFill   = document.getElementById('progressFill');
const questionCounter= document.getElementById('questionCounter');

// ── Init ─────────────────────────────────────────────────────────────────────
function startGame() {
  questions = shuffle(ALL_QUOTES);
  current = 0;
  score = 0;
  answered = false;
  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  showQuestion();
}

function showQuestion() {
  answered = false;
  const q = questions[current];

  quoteCard.className = 'quote-card';
  quoteBadge.textContent = BADGE_ICONS[q.type] || '💬';
  quoteText.textContent = `„${q.text}"`;
  quoteDate.textContent = q.date !== '—' ? q.date : '';

  revealArea.classList.add('hidden');
  guessButtons.classList.remove('hidden');
  nextArea.classList.add('hidden');

  scoreCorrectEl.textContent = score;
  scoreTotalEl.textContent = current;
  progressFill.style.width = `${(current / questions.length) * 100}%`;
  questionCounter.textContent = `Frage ${current + 1} / ${questions.length}`;
}

function guess(userSaysReal) {
  if (answered) return;
  answered = true;
  const q = questions[current];
  const correct = userSaysReal === q.real;
  if (correct) score++;

  // visual feedback on card
  quoteCard.classList.add(correct ? 'card-correct' : 'card-wrong');

  // verdict
  if (correct) {
    verdictEl.innerHTML = `<span class="verdict-correct">✅ Korrekt!</span>`;
  } else {
    verdictEl.innerHTML = `<span class="verdict-wrong">❌ Falsch!</span> Das war <strong>${q.real ? 'ECHT' : 'FAKE'}</strong>.`;
  }

  // source
  if (q.real) {
    sourceInfo.innerHTML = q.sourceUrl
      ? `<span class="source-label">Quelle:</span> <a href="${q.sourceUrl}" target="_blank" rel="noopener">${q.source}</a>`
      : `<span class="source-label">Quelle:</span> ${q.source}`;
  } else {
    sourceInfo.innerHTML = `<span class="source-label">Dieses Zitat ist frei erfunden.</span>`;
  }

  quoteNoteEl.textContent = q.note || '';
  quoteNoteEl.classList.toggle('hidden', !q.note);

  revealArea.classList.remove('hidden');
  guessButtons.classList.add('hidden');
  nextArea.classList.remove('hidden');

  // update score display
  scoreCorrectEl.textContent = score;
  scoreTotalEl.textContent = current + 1;
}

function nextQuestion() {
  current++;
  if (current >= questions.length) {
    showEndScreen();
  } else {
    showQuestion();
  }
}

function showEndScreen() {
  progressFill.style.width = '100%';
  gameScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');

  const pct = Math.round((score / questions.length) * 100);
  const rating = RATINGS.find(r => pct >= r.min);

  document.getElementById('endEmoji').textContent = rating.emoji;
  document.getElementById('endTitle').textContent = rating.title;
  document.getElementById('endText').textContent = rating.text;
  document.getElementById('endScore').textContent = `${score} / ${questions.length}`;
  document.getElementById('endPct').textContent = `${pct}%`;
}

function restartGame() {
  endScreen.classList.add('hidden');
  startGame();
}

window.startGame   = startGame;
window.guess       = guess;
window.nextQuestion = nextQuestion;
window.restartGame = restartGame;
