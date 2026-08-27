// ─── Element References ──────────────────────────────────────────────────────
const page1          = document.getElementById('page1');
const page2          = document.getElementById('page2');
const pageTransition = document.getElementById('pageTransition');

const openBtn          = document.getElementById('openBtn');
const doorScene        = document.getElementById('doorScene');
const doorGlow         = document.getElementById('doorGlow');
const homeZoomImg      = document.getElementById('homeZoomImg');
const goldenFadeOverlay = document.getElementById('goldenFadeOverlay');

// ─── Navigation helper ────────────────────────────────────────────────────────
function showPage(id) {
    page1.style.display          = 'none';
    pageTransition.style.display = 'none';
    page2.style.display          = 'none';

    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

// ─── Cinematic Home Zoom Sequence ─────────────────────────────────────────────
//
//  Timeline (ms from OPEN click):
//   0        — door starts opening
//   1 400    — door fully open  → switch to transition page
//   1 600    — home image fades in (small, far away)
//   2 200    — zoom-in class added  → slow cinematic zoom begins  (2 800 ms)
//   5 000    — golden overlay starts fading in
//   6 200    — transition page hides, Page 2 appears
//
function playCinematicTransition() {
    // Show transition page (black screen initially)
    showPage('pageTransition');

    // Reset any leftover state from a previous run
    homeZoomImg.classList.remove('appear', 'zoom-in');
    goldenFadeOverlay.classList.remove('active');

    // Step 1 — small image fades in (200 ms after page switch)
    setTimeout(() => {
        homeZoomImg.classList.add('appear');
    }, 200);

    // Step 2 — begin slow zoom (600 ms after page switch)
    setTimeout(() => {
        homeZoomImg.classList.remove('appear');
        homeZoomImg.classList.add('zoom-in');
    }, 600);

    // Step 3 — golden warmth blooms over the image
    setTimeout(() => {
        goldenFadeOverlay.classList.add('active');
    }, 3600);

    // Step 4 — reveal the invitation
    setTimeout(() => {
        showPage('page2');
    }, 4800);
}

// ─── Door Open ────────────────────────────────────────────────────────────────
function openDoor() {
    if (doorScene.classList.contains('opened')) return;

    // Prevent double-trigger
    openBtn.disabled = true;

    // Warm glow behind door
    doorGlow.classList.add('active');

    // Door swing animation
    doorScene.classList.add('opened');

    // After door finishes (~1 400 ms), start cinematic transition
    setTimeout(() => {
        playCinematicTransition();
    }, 1400);
}

// ─── Event Listeners ─────────────────────────────────────────────────────────
openBtn.addEventListener('click', openDoor);

// Keyboard support — Enter on Page 1 opens the door
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && page1.style.display !== 'none') {
        openDoor();
    }
});

// ─── Init ─────────────────────────────────────────────────────────────────────
showPage('page1');
