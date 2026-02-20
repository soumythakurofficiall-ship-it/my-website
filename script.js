const loader = document.getElementById('loader');
const loaderProgress = document.getElementById('loaderProgress');
const mainContent = document.getElementById('mainContent');
const crown = document.getElementById('crown');
const surpriseModal = document.getElementById('surpriseModal');
const closeModal = document.getElementById('closeModal');
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const ambientSound = document.getElementById('ambientSound');

let royalMode = false;
let audioUnlocked = false;

function runLoader() {
  let progress = 0;
  ambientSound.volume = 0.2;
  ambientSound.play().catch(() => {});

  const timer = setInterval(() => {
    progress += Math.random() * 11;
    loaderProgress.style.width = `${Math.min(progress, 100)}%`;

    if (progress >= 100) {
      clearInterval(timer);
      document.body.classList.add('flash');
      setTimeout(() => {
        loader.classList.add('hide');
        mainContent.classList.remove('hidden');
      }, 650);
    }
  }, 180);
}

function nextBirthdayTarget() {
  const now = new Date();
  const thisYear = now.getFullYear();
  const target = new Date(thisYear, 1, 21, 0, 0, 0);
  return now > target ? new Date(thisYear + 1, 1, 21, 0, 0, 0) : target;
}

function setCountdown() {
  const target = nextBirthdayTarget();
  const ids = ['days', 'hours', 'minutes', 'seconds'];
  let prevValues = {};

  setInterval(() => {
    const now = new Date();
    const diff = Math.max(target - now, 0);

    const values = {
      days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((diff / 3600000) % 24)).padStart(2, '0'),
      minutes: String(Math.floor((diff / 60000) % 60)).padStart(2, '0'),
      seconds: String(Math.floor((diff / 1000) % 60)).padStart(2, '0')
    };

    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (prevValues[id] && prevValues[id] !== values[id]) {
        node.classList.remove('flip');
        void node.offsetWidth;
        node.classList.add('flip');
      }
      node.textContent = values[id];
      prevValues[id] = values[id];
    });
  }, 1000);
}

function setupTiltCards() {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rotateX = (y / r.height - 0.5) * -12;
      const rotateY = (x / r.width - 0.5) * 12;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

function setupStarTrail() {
  const layer = document.getElementById('starTrailLayer');
  window.addEventListener('mousemove', (e) => {
    const star = document.createElement('span');
    star.textContent = '✦';
    Object.assign(star.style, {
      position: 'absolute',
      left: `${e.clientX}px`,
      top: `${e.clientY}px`,
      color: 'rgba(255, 215, 0, 0.95)',
      textShadow: '0 0 10px #ffd700',
      fontSize: `${Math.random() * 10 + 8}px`,
      transform: 'translate(-50%, -50%)'
    });
    layer.appendChild(star);
    star.animate([{ opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%, -80%) scale(0.2)' }], { duration: 700, easing: 'ease-out' });
    setTimeout(() => star.remove(), 720);
  });
}

function setupGalaxyCanvas() {
  const canvas = document.getElementById('galaxyCanvas');
  const ctx = canvas.getContext('2d');
  const stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 180; i += 1) {
    stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.8, a: Math.random(), drift: Math.random() * 0.2 + 0.05 });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const nebula = ctx.createRadialGradient(canvas.width * 0.68, canvas.height * 0.25, 50, canvas.width * 0.68, canvas.height * 0.25, 420);
    nebula.addColorStop(0, 'rgba(126,82,206,0.20)');
    nebula.addColorStop(1, 'rgba(10,15,44,0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach((s) => {
      s.y += s.drift;
      if (s.y > canvas.height) s.y = -2;
      s.a += 0.02;
      ctx.fillStyle = `rgba(255,255,255,${0.45 + Math.sin(s.a) * 0.45})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function fadeAudio(audio, target = 1, duration = 1200) {
  const start = audio.volume;
  const delta = target - start;
  const startTime = performance.now();
  function tick(now) {
    const t = Math.min((now - startTime) / duration, 1);
    audio.volume = Math.max(0, Math.min(1, start + delta * t));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function celebrate() {
  royalMode = true;
  launchFireworks();
  triggerConfetti();
  crown.style.filter = 'drop-shadow(0 0 30px #ffe372) brightness(1.3)';
  const msg = document.getElementById('floatingMessage');
  msg.textContent = 'This Is Your Year, Soumy!';
  msg.classList.add('show');
  document.body.classList.add('shake');
  if (audioUnlocked) {
    bgMusic.play().catch(() => {});
    fadeAudio(bgMusic, 0.5, 1500);
  }
  setTimeout(() => document.body.classList.remove('shake'), 1200);
}

function launchFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const particles = [];

  for (let i = 0; i < 240; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    particles.push({ x: innerWidth * (0.3 + Math.random() * 0.4), y: innerHeight * (0.2 + Math.random() * 0.4), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 80 + Math.random() * 40 });
  }

  function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.life -= 1;
      ctx.fillStyle = `hsla(${Math.random() * 60 + 30},100%,60%,${p.life / 110})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    if (particles.some((p) => p.life > 0)) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

function triggerConfetti() {
  for (let i = 0; i < 100; i += 1) {
    const bit = document.createElement('span');
    bit.textContent = '◆';
    Object.assign(bit.style, {
      position: 'fixed',
      left: `${Math.random() * 100}vw`,
      top: '-10px',
      color: i % 2 ? '#ffd700' : '#f5d3ff',
      zIndex: 25,
      pointerEvents: 'none'
    });
    document.body.appendChild(bit);
    bit.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: `translateY(${innerHeight + 50}px) rotate(720deg)` }], { duration: 1800 + Math.random() * 1200, easing: 'ease-in' });
    setTimeout(() => bit.remove(), 3200);
  }
}

function setupGame() {
  const gameArea = document.getElementById('gameArea');
  const scoreEl = document.getElementById('score');
  const gameMsg = document.getElementById('gameMessage');
  let score = 0;

  setInterval(() => {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '⭐';
    star.style.left = `${Math.random() * 92}%`;
    star.style.animationDuration = `${2.5 + Math.random() * 2}s`;

    star.addEventListener('click', () => {
      score += 1;
      scoreEl.textContent = score;
      star.remove();
      if (score >= 14) {
        gameMsg.textContent = 'Level 14 Master Achieved 👑';
      }
    });

    gameArea.appendChild(star);
    setTimeout(() => star.remove(), 4200);
  }, 750);
}

function setupModalTimer() {
  setTimeout(() => surpriseModal.classList.add('show'), 14000);
  closeModal.addEventListener('click', () => surpriseModal.classList.remove('show'));
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  bgMusic.volume = 0;
}

document.addEventListener('pointerdown', unlockAudio, { once: true });

musicToggle.addEventListener('click', () => {
  unlockAudio();
  if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
    fadeAudio(bgMusic, 0.45, 1000);
    musicToggle.textContent = '⏸️';
  } else {
    fadeAudio(bgMusic, 0, 700);
    setTimeout(() => bgMusic.pause(), 760);
    musicToggle.textContent = '🎵';
  }
});

document.getElementById('celebrateBtn').addEventListener('click', celebrate);

runLoader();
setCountdown();
setupTiltCards();
setupStarTrail();
setupGalaxyCanvas();
setupGame();
setupModalTimer();
