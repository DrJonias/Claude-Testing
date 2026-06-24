// ── star field ──
const starsEl = document.getElementById('stars');
for (let i = 0; i < 120; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  const size = Math.random() * 2.5 + .5;
  s.style.cssText = `
    left:${Math.random()*100}%;
    top:${Math.random()*100}%;
    width:${size}px;
    height:${size}px;
    --d:${(Math.random()*5+3).toFixed(1)}s;
    --delay:${(Math.random()*6).toFixed(1)}s;
    --op:${(Math.random()*.5+.2).toFixed(2)};
  `;
  starsEl.appendChild(s);
}

// ── cursor glow ──
const glow = document.getElementById('glow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});
