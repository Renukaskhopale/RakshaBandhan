/* ═══════════════════════════════════════════════════════════
   RAKSHA BANDHAN — CINEMATIC ENGINE
   Vanilla JS · Three.js · GSAP · Canvas Particles
═══════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────
   CONFIGURATION  ← Edit these values for your event
──────────────────────────────────────────────────────────*/
const CONFIG = {
  name:           'Your Name',
  date:           'August 19, 2025',      // e.g. "August 19, 2025"
  time:           '6:00 PM onwards',
  venue:          'Your Venue, City',
  mapsUrl:        '#',                    // paste Google Maps link here
  primaryColor:   '#C9963E',
  bgMusic:        'assets/audio/background.mp3',
  emotionalMusic: 'assets/audio/emotional.mp3',
  festiveMusic:   'assets/audio/celebration.mp3',
};

/* ────────────────────────────────────────────────────────
   STATE
──────────────────────────────────────────────────────────*/
let currentScene      = 0;
const TOTAL_SCENES    = 7; // 0–6
let isTransitioning   = false;
let isMuted           = false;
let audioStarted      = false;
let activeAudio       = null;
let threeRenderers    = {};
let threeScenes       = {};
let threeCameras      = {};
let animFrames        = {};
let particleSystems   = {};
let mouse             = { x: 0, y: 0 };
let isMobile          = window.innerWidth <= 768;

const PARTICLE_COUNTS = { intro: isMobile ? 60 : 130, bond: isMobile ? 80 : 180, blast: isMobile ? 150 : 350, invite: isMobile ? 50 : 100, ending: isMobile ? 60 : 120 };

/* ────────────────────────────────────────────────────────
   GSAP SETUP
──────────────────────────────────────────────────────────*/
gsap.registerPlugin(TextPlugin, CustomEase);
CustomEase.create('silk', 'M0,0 C0.23,0 0.32,1 1,1');

/* ════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════ */
function init() {
  populateEventDetails();
  setupAudio();
  setupNavigation();
  setupMouseParallax();
  setupVisibilityChange();
  handleResize();
  window.addEventListener('resize', handleResize);

  // Start on scene 0
  const s0 = document.getElementById('scene-0');
  s0.classList.add('active');
  gsap.to(s0, { opacity: 1, duration: 0.01 });

  initIntroCanvas();
  playScene0();
}

/* ════════════════════════════════════════════════════════
   POPULATE EVENT DETAILS
════════════════════════════════════════════════════════ */
function populateEventDetails() {
  const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
  setVal('event-date',  CONFIG.date);
  setVal('event-time',  CONFIG.time);
  setVal('event-venue', CONFIG.venue);
  const mapsBtn = document.getElementById('maps-btn');
  if (mapsBtn && CONFIG.mapsUrl && CONFIG.mapsUrl !== '#') {
    mapsBtn.href = CONFIG.mapsUrl;
  } else if (mapsBtn) {
    mapsBtn.style.display = 'none';
  }
}

/* ════════════════════════════════════════════════════════
   AUDIO
════════════════════════════════════════════════════════ */
function setupAudio() {
  const muteBtn = document.getElementById('mute-btn');
  muteBtn.addEventListener('click', toggleMute);
}

function startAudio(audioId, vol = 0.25) {
  if (!audioStarted) return;
  stopAllAudio();
  const el = document.getElementById(audioId);
  if (!el || !el.querySelector('source')?.src) return;
  el.volume = 0;
  el.play().then(() => {
    gsap.to(el, { volume: vol, duration: 2 });
    activeAudio = el;
  }).catch(() => {});
}

function stopAllAudio() {
  ['audio-bg', 'audio-emotional', 'audio-celebration'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.paused) {
      gsap.to(el, { volume: 0, duration: 1, onComplete: () => el.pause() });
    }
  });
}

function toggleMute() {
  isMuted = !isMuted;
  const muteBtn = document.getElementById('mute-btn');
  const icon = muteBtn.querySelector('.mute-icon');
  ['audio-bg', 'audio-emotional', 'audio-celebration'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.muted = isMuted;
  });
  icon.textContent = isMuted ? '✕' : '♪';
  muteBtn.classList.toggle('muted', isMuted);
}

/* ════════════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════════════ */
function setupNavigation() {
  document.getElementById('btn-next').addEventListener('click', nextScene);
  document.getElementById('btn-prev').addEventListener('click', previousScene);

  document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const s = parseInt(dot.dataset.scene, 10);
      if (s !== currentScene) goToScene(s);
    });
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextScene(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); previousScene(); }
  });

  // Touch swipe
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? nextScene() : previousScene(); }
  }, { passive: true });

  // Begin button
  document.getElementById('begin-btn').addEventListener('click', () => {
    audioStarted = true;
    startAudio('audio-bg');
    showNavControls();
    goToScene(1);
  });

  // Join button ripple
  const joinBtn = document.getElementById('join-btn');
  joinBtn.addEventListener('click', e => { createRipple(e, joinBtn); });
}

function showNavControls() {
  document.querySelector('.cinema-nav').classList.add('visible');
  document.querySelector('.scene-indicators').classList.add('visible');
  document.getElementById('mute-btn').classList.add('visible');
}

function createRipple(e, btn) {
  const ripple = document.createElement('span');
  const rect   = btn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height) * 2;
  ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;background:rgba(201,150,62,0.15);border-radius:50%;pointer-events:none;`;
  btn.appendChild(ripple);
  gsap.to(ripple, { scale: 1.5, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => ripple.remove() });
}

function updateDots(idx) {
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function updateNavButtons() {
  document.getElementById('btn-prev').disabled = currentScene <= 0;
  document.getElementById('btn-next').disabled = currentScene >= TOTAL_SCENES - 1;
}

function nextScene()     { if (currentScene < TOTAL_SCENES - 1) goToScene(currentScene + 1); }
function previousScene() { if (currentScene > 0) goToScene(currentScene - 1); }

/* ════════════════════════════════════════════════════════
   SCENE TRANSITION ENGINE
════════════════════════════════════════════════════════ */
function goToScene(idx) {
  if (isTransitioning || idx === currentScene) return;
  isTransitioning = true;

  const fromEl = document.getElementById(`scene-${currentScene}`);
  const toEl   = document.getElementById(`scene-${idx}`);
  const dir    = idx > currentScene ? 1 : -1;

  // Teardown current scene animations
  teardownScene(currentScene);

  // Animate out
  gsap.to(fromEl, {
    opacity: 0,
    x: dir * -30,
    filter: 'blur(8px)',
    duration: 0.7,
    ease: 'power2.in',
    onComplete: () => {
      fromEl.classList.remove('active');
      fromEl.style.removeProperty('filter');
      fromEl.style.x = 0;

      // Animate in
      toEl.classList.add('active');
      gsap.fromTo(toEl,
        { opacity: 0, x: dir * 30, filter: 'blur(8px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out',
          onComplete: () => {
            currentScene = idx;
            isTransitioning = false;
            updateDots(idx);
            updateNavButtons();
            playSceneAnimation(idx);
            updateAudioForScene(idx);
          }
        }
      );
    }
  });
}

function updateAudioForScene(idx) {
  if (!audioStarted) return;
  if (idx <= 1)      startAudio('audio-emotional');
  else if (idx <= 3) startAudio('audio-bg');
  else if (idx === 4) startAudio('audio-celebration');
  else if (idx === 5) startAudio('audio-celebration');
  else               startAudio('audio-emotional');
}

/* ════════════════════════════════════════════════════════
   SCENE ANIMATIONS DISPATCHER
════════════════════════════════════════════════════════ */
function playSceneAnimation(idx) {
  switch (idx) {
    case 0: playScene0(); break;
    case 1: playScene1(); break;
    case 2: playScene2(); break;
    case 3: playScene3(); initRakhiCanvas(); break;
    case 4: playScene4(); break;
    case 5: playScene5(); initInviteCanvas(); break;
    case 6: playScene6(); initEndingCanvas(); break;
  }
}

function teardownScene(idx) {
  if (animFrames[idx]) { cancelAnimationFrame(animFrames[idx]); delete animFrames[idx]; }
  if (threeRenderers[idx]) {
    threeRenderers[idx].dispose();
    delete threeRenderers[idx];
    delete threeScenes[idx];
    delete threeCameras[idx];
  }
}

/* ════════════════════════════════════════════════════════
   SCENE 0 — INTRO
════════════════════════════════════════════════════════ */
function initIntroCanvas() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < PARTICLE_COUNTS.intro; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random(),
      dalpha: (Math.random() * 0.01) - 0.005,
      hue: 35 + Math.random() * 20,
    });
  }
  particleSystems[0] = particles;

  function draw() {
    if (currentScene !== 0) return;
    animFrames[0] = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.alpha += p.dalpha;
      if (p.alpha <= 0 || p.alpha >= 1) p.dalpha *= -1;
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
      ctx.fill();
    });
  }
  draw();
}

function playScene0() {
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to('.diya', { opacity: 1, duration: 1, ease: 'power2.out' }, 0)
    .to('.l0', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 0.8)
    .to('.l1', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 2.2)
    .to('.l2', { opacity: 1, y: 0, duration: 1,   ease: 'power2.out' }, 4.0)
    .to('.l3', { opacity: 1, y: 0, duration: 1,   ease: 'power2.out' }, 5.2)
    .to('.l4', { opacity: 1, y: 0, duration: 1,   ease: 'power2.out' }, 6.4)
    .to('.l5', { opacity: 1, y: 0, duration: 1.5, ease: 'silk' },       8.0)
    .to('.begin-btn', { opacity: 1, duration: 1, ease: 'power2.out' },  9.5);
}

/* ════════════════════════════════════════════════════════
   SCENE 1 — MEMORIES
════════════════════════════════════════════════════════ */
function playScene1() {
  const cards = document.querySelectorAll('.photo-card');
  const imgs  = document.querySelectorAll('.photo-card img');

  // Stagger photos in
  gsap.fromTo(cards,
    { opacity: 0, y: 40, rotationZ: (_i, el) => parseFloat(el.style.transform?.match(/rotate\(([^)]+)deg\)/)?.[1] || 0) + 10 },
    { opacity: 1, y: 0, duration: 1.4, stagger: 0.3, ease: 'power2.out', delay: 0.3 }
  );
  imgs.forEach(img => gsap.to(img, { scale: 1.03, duration: 12, ease: 'none', repeat: -1, yoyo: true }));

  // Text reveal
  const tl = gsap.timeline({ delay: 1.2 });
  ['.ml0','.ml1','.ml2','.ml3','.ml4'].forEach((sel, i) => {
    tl.to(sel, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, i * 1.4);
  });

  // Subtle card parallax on mouse
  document.addEventListener('mousemove', mem_parallax);
}
function mem_parallax(e) {
  if (currentScene !== 1) { document.removeEventListener('mousemove', mem_parallax); return; }
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
  document.querySelectorAll('.photo-card').forEach((card, i) => {
    const factor = (i - 1) * 0.5;
    gsap.to(card, { x: dx * 12 * factor, y: dy * 8, duration: 1, ease: 'power2.out' });
  });
}

/* ════════════════════════════════════════════════════════
   SCENE 2 — THE BOND (Three.js thread + particles)
════════════════════════════════════════════════════════ */
function playScene2() {
  spawnPetals();
  initBondCanvas();

  const tl = gsap.timeline({ delay: 0.6 });
  ['.bl0','.bl1','.bl2'].forEach((sel, i) => {
    tl.to(sel, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, i * 1.5);
  });
  tl.to('.bond-divider', { opacity: 1, scaleX: 1, duration: 0.8, ease: 'power2.out' }, 5)
    .to('.bl3', { opacity: 1, y: 0, duration: 1.2, ease: 'silk' }, 5.8)
    .to('.bl4', { opacity: 1, y: 0, duration: 1,   ease: 'power2.out' }, 7.0);
}

function spawnPetals() {
  const layer = document.getElementById('petals-layer');
  if (!layer) return;
  layer.innerHTML = '';
  for (let i = 0; i < (isMobile ? 10 : 22); i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (Math.random() * 6 + 6) + 's';
    p.style.animationDelay    = (Math.random() * 8) + 's';
    p.style.transform = `scale(${0.5 + Math.random()})`;
    p.style.opacity = (0.3 + Math.random() * 0.5).toString();
    layer.appendChild(p);
  }
}

function initBondCanvas() {
  const canvas = document.getElementById('bond-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  // 2D golden thread + particles
  const pts = []; const count = isMobile ? 60 : 100;
  for (let i = 0; i < count; i++) pts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 3 + 1, vy: -Math.random() * 0.4 - 0.1, vx: (Math.random() - 0.5) * 0.2, a: Math.random() });

  let t = 0;
  function drawBond() {
    if (currentScene !== 2) return;
    animFrames[2] = requestAnimationFrame(drawBond);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.012;

    // Draw golden thread curve
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const px = (i / 100) * canvas.width;
      const py = canvas.height * 0.5 + Math.sin(i * 0.2 + t) * 40 + Math.sin(i * 0.05 + t * 0.5) * 80;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    const grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grd.addColorStop(0, 'transparent');
    grd.addColorStop(0.3, 'rgba(201,150,62,0.5)');
    grd.addColorStop(0.7, 'rgba(240,201,106,0.5)');
    grd.addColorStop(1, 'transparent');
    ctx.strokeStyle = grd;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Particles
    pts.forEach(p => {
      p.y += p.vy; p.x += p.vx; p.a -= 0.003;
      if (p.y < -10 || p.a <= 0) {
        p.x = Math.random() * canvas.width; p.y = canvas.height + 10; p.a = Math.random();
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,150,62,${p.a * 0.7})`;
      ctx.fill();
    });
  }
  drawBond();
}

/* ════════════════════════════════════════════════════════
   SCENE 3 — RAKHI REVEAL (Three.js)
════════════════════════════════════════════════════════ */
function initRakhiCanvas() {
  const canvas = document.getElementById('rakhi-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.width, canvas.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 100);
  camera.position.z = 4;

  // ── Rakhi: gold disc + red ring + beads ──
  const group = new THREE.Group();

  // Center disc
  const discGeo  = new THREE.CircleGeometry(0.5, 64);
  const discMat  = new THREE.MeshStandardMaterial({ color: 0xC9963E, metalness: 0.9, roughness: 0.2, emissive: 0x7A3000, emissiveIntensity: 0.4 });
  const disc     = new THREE.Mesh(discGeo, discMat);
  group.add(disc);

  // Red ring
  const ringGeo = new THREE.RingGeometry(0.5, 0.65, 64);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x8B0000, metalness: 0.5, roughness: 0.4, emissive: 0x5B0000, emissiveIntensity: 0.5, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(ringGeo, ringMat));

  // Outer gold ring
  const outerGeo = new THREE.RingGeometry(0.65, 0.72, 64);
  const outerMat = new THREE.MeshStandardMaterial({ color: 0xF0C96A, metalness: 0.95, roughness: 0.15, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(outerGeo, outerMat));

  // Beads
  const beadMat = new THREE.MeshStandardMaterial({ color: 0xF0C96A, metalness: 0.9, roughness: 0.1, emissive: 0xC9963E, emissiveIntensity: 0.5 });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const bead  = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), beadMat);
    bead.position.set(Math.cos(angle) * 0.85, Math.sin(angle) * 0.85, 0);
    group.add(bead);
  }

  // Gold star pattern on disc
  const starMat = new THREE.MeshStandardMaterial({ color: 0xF0C96A, metalness: 1, roughness: 0.05, emissive: 0xC9963E, emissiveIntensity: 0.8 });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.35), starMat);
    petal.rotation.z = angle;
    petal.position.z = 0.01;
    group.add(petal);
  }

  scene.add(group);

  // Lights
  scene.add(new THREE.AmbientLight(0xFFDDCC, 0.5));
  const gold = new THREE.PointLight(0xC9963E, 3, 8);
  gold.position.set(0, 0, 2);
  scene.add(gold);
  const rim = new THREE.PointLight(0xFFFFCC, 1.5, 6);
  rim.position.set(-2, 2, 1);
  scene.add(rim);

  // Floating gold particles
  const pCount = isMobile ? 80 : 200;
  const pGeo   = new THREE.BufferGeometry();
  const pPos   = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random() - 0.5) * 8;
    pPos[i*3+1] = (Math.random() - 0.5) * 8;
    pPos[i*3+2] = (Math.random() - 0.5) * 4;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xC9963E, size: 0.04, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(pGeo, pMat));

  threeRenderers[3] = renderer; threeScenes[3] = scene; threeCameras[3] = camera;
  let elapsed = 0;

  function animRakhi() {
    if (currentScene !== 3) return;
    animFrames[3] = requestAnimationFrame(animRakhi);
    elapsed += 0.01;

    group.rotation.y = elapsed * 0.6;
    group.rotation.x = Math.sin(elapsed * 0.4) * 0.15;
    group.position.y = Math.sin(elapsed * 0.7) * 0.12;
    gold.intensity = 2.5 + Math.sin(elapsed * 2.5) * 1;

    camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 0.15 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animRakhi();
}

function playScene3() {
  const tl = gsap.timeline({ delay: 0.5 });
  ['.rv0','.rv1','.rv2','.rv3'].forEach((sel, i) => {
    tl.to(sel, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, i * 1.8);
  });
}

/* ════════════════════════════════════════════════════════
   SCENE 4 — BLAST / TRANSFORMATION
════════════════════════════════════════════════════════ */
function playScene4() {
  const cWrap = document.getElementById('countdown-wrap');
  const cNum  = document.getElementById('cnum');
  const overlay = document.getElementById('blast-overlay');
  const canvas  = document.getElementById('blast-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const tl = gsap.timeline({ delay: 0.3 });

  // Countdown
  function showCount(n, at) {
    tl.add(() => {
      cNum.textContent = n === 0 ? '✦' : n;
      gsap.fromTo(cWrap,
        { opacity: 0, scale: 1.6 },
        { opacity: 1, scale: 1,   duration: 0.4, ease: 'back.out(2)' }
      );
      if (n > 0) {
        gsap.to(cWrap, { opacity: 0, scale: 0.7, duration: 0.6, ease: 'power2.in', delay: 0.55 });
      }
    }, at);
  }
  showCount(3, 0);
  showCount(2, 1.2);
  showCount(1, 2.4);

  // Blast
  tl.add(() => {
    gsap.to(cWrap, { opacity: 0, scale: 2, duration: 0.4, ease: 'power2.in' });
    runBlastParticles(ctx, canvas);
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.6, yoyo: true, repeat: 1 });
  }, 3.4);

  // Transition to invitation
  tl.add(() => {
    gsap.to(canvas, { opacity: 0, duration: 0.8 });
    setTimeout(() => {
      isTransitioning = false;
      goToScene(5);
    }, 900);
  }, 5.2);
}

function runBlastParticles(ctx, canvas) {
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const count = PARTICLE_COUNTS.blast;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const speed  = Math.random() * 12 + 3;
    const size   = Math.random() * 5 + 1.5;
    const hue    = 30 + Math.random() * 30;
    const sat    = 70 + Math.random() * 30;
    particles.push({
      x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: size, hue, sat, alpha: 1, decay: Math.random() * 0.015 + 0.008, trail: [],
    });
  }
  // Flower petals
  for (let i = 0; i < (isMobile ? 20 : 40); i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push({
      x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
      r: Math.random() * 6 + 3, hue: 0, sat: 80, isPetal: true, alpha: 1,
      decay: Math.random() * 0.012 + 0.006, trail: [],
    });
  }

  let frame;
  function blast() {
    if (currentScene !== 4) { cancelAnimationFrame(frame); return; }
    frame = requestAnimationFrame(blast);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Central bloom glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
    grd.addColorStop(0, 'rgba(240,201,106,0.15)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let alive = 0;
    particles.forEach(p => {
      if (p.alpha <= 0) return;
      alive++;
      p.x  += p.vx; p.y += p.vy + (p.isPetal ? 0.2 : 0);
      p.vy += p.isPetal ? 0.05 : 0.08;
      p.vx *= 0.98; p.alpha -= p.decay;

      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 8) p.trail.shift();

      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        p.trail.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, 65%, ${p.alpha * 0.4})`;
        ctx.lineWidth = p.r * 0.5;
        ctx.stroke();
      }

      if (p.isPetal) {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, p.vx * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, 55%, ${p.alpha})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `hsla(${p.hue}, 100%, 90%, ${p.alpha})`);
        g.addColorStop(1, `hsla(${p.hue}, 80%, 60%, ${p.alpha * 0.2})`);
        ctx.fillStyle = g;
        ctx.fill();
      }
    });
    if (alive === 0) cancelAnimationFrame(frame);
  }
  blast();
}

/* ════════════════════════════════════════════════════════
   SCENE 5 — INVITATION
════════════════════════════════════════════════════════ */
function initInviteCanvas() {
  const canvas = document.getElementById('invite-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const count = PARTICLE_COUNTS.invite;
  const pts = [];
  for (let i = 0; i < count; i++) pts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 0.5, vy: -(Math.random() * 0.3 + 0.05), a: Math.random(), da: Math.random() * 0.005 - 0.0025 });

  function draw() {
    if (currentScene !== 5) return;
    animFrames[5] = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.y += p.vy; p.a += p.da;
      if (p.a <= 0 || p.a >= 1) p.da *= -1;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,150,62,${p.a * 0.5})`;
      ctx.fill();
    });
  }
  draw();
}

function playScene5() {
  const els = ['.ganesh-line','.invite-title','.invite-sub','.invite-divider','.invite-dear','.invite-body','.event-cards','.invite-actions'];
  const tl  = gsap.timeline({ delay: 0.4 });
  els.forEach((sel, i) => {
    tl.to(sel, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, i * 0.28);
  });
}

/* ════════════════════════════════════════════════════════
   SCENE 6 — ENDING
════════════════════════════════════════════════════════ */
function initEndingCanvas() {
  const canvas = document.getElementById('ending-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const count = PARTICLE_COUNTS.ending;
  const pts = [];
  for (let i = 0; i < count; i++) pts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2.5 + 0.5, vx: (Math.random()-0.5)*0.2, vy: -(Math.random()*0.25+0.05), a: Math.random(), da: Math.random()*0.005-0.0025 });
  function draw() {
    if (currentScene !== 6) return;
    animFrames[6] = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.a += p.da;
      if (p.a<=0||p.a>=1) p.da*=-1;
      if (p.y<-10){p.y=canvas.height+10;p.x=Math.random()*canvas.width;}
      if (p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(201,150,62,${p.a*0.55})`;
      ctx.fill();
    });
  }
  draw();
}

function playScene6() {
  const lines = ['.el0','.el1','.el2','.el3','.el4','.el5','.el6','.el7'];
  const tl = gsap.timeline({ delay: 0.5 });
  lines.forEach((sel, i) => {
    if (sel === '.el4') {
      tl.to(sel, { opacity: 1, scale: 1, duration: 1.4, ease: 'back.out(1.4)' }, i * 1.3);
    } else {
      tl.to(sel, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, i * 1.3);
    }
  });
  // Fade to black at the end
  tl.to('#scene-6', { backgroundColor: '#000000', duration: 3, ease: 'power2.in' }, 12);
}

/* ════════════════════════════════════════════════════════
   MOUSE PARALLAX (global)
════════════════════════════════════════════════════════ */
function setupMouseParallax() {
  document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * -2;
  });
}

/* ════════════════════════════════════════════════════════
   VISIBILITY CHANGE — pause when tab hidden
════════════════════════════════════════════════════════ */
function setupVisibilityChange() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      Object.values(animFrames).forEach(id => cancelAnimationFrame(id));
    } else {
      playSceneAnimation(currentScene);
    }
  });
}

/* ════════════════════════════════════════════════════════
   HANDLE RESIZE
════════════════════════════════════════════════════════ */
function handleResize() {
  isMobile = window.innerWidth <= 768;
  const canvasIds = ['intro-canvas','bond-canvas','rakhi-canvas','blast-canvas','invite-canvas','ending-canvas'];
  canvasIds.forEach(id => {
    const c = document.getElementById(id);
    if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
  });
  if (threeRenderers[3] && threeCameras[3]) {
    const r = threeRenderers[3];
    r.setSize(window.innerWidth, window.innerHeight);
    threeCameras[3].aspect = window.innerWidth / window.innerHeight;
    threeCameras[3].updateProjectionMatrix();
  }
}

/* ════════════════════════════════════════════════════════
   REDUCED MOTION CHECK
════════════════════════════════════════════════════════ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(2);
}

/* ════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
