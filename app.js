const root = document.getElementById("gameRoot");
const heartsLayer = document.getElementById("hearts");

const rewardModal = document.getElementById("rewardModal");
const rewardWordEl = document.getElementById("rewardWord");
const closeRewardBtn = document.getElementById("closeReward");

const unlockFlash = document.getElementById("unlockFlash");

// Music
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

const NICKNAME = "Miji";

// progress stored locally
const KEY = "miji_new_year_progress_v7";
const progress = JSON.parse(localStorage.getItem(KEY) || "{}");

// used to auto-return home after closing reward
let returnHomeAfterReward = false;
// only play unlock animation once per page load
let unlockPlayed = false;

/* -----------------------------
   AUDIO FILES (put in /assets)
-------------------------------- */
const CONFETTI_SOUND_SRC = "./assets/confetti.mp3";

// Music settings
const MUSIC_KEY = "miji_music_enabled_v1"; // "1" enabled, "0" muted
const BASE_VOL = 0.35;
const DUCK_VOL = 0.12;
let musicStarted = false;

/* ---------- Persistence ---------- */
function save() {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

function setDone(k) {
  progress[k] = true;
  save();
  maybeShowReward(k);
}

function doneCount() {
  return ["memory", "hearts", "quiz"].filter((k) => progress[k]).length;
}

function allDone() {
  return doneCount() === 3;
}

/* ---------- Floating Hearts Background ---------- */
function spawnHeart() {
  const el = document.createElement("div");
  el.className = "heart";

  const roll = Math.random();
  el.textContent = roll < 0.14 ? "✨" : roll < 0.62 ? "💖" : "💗";
  el.style.left = Math.random() * 100 + "vw";
  el.style.setProperty("--drift", Math.random() * 120 - 60 + "px");

  const dur = 6 + Math.random() * 6;
  el.style.animationDuration = dur + "s";
  el.style.fontSize = 14 + Math.random() * 20 + "px";

  heartsLayer.appendChild(el);
  setTimeout(() => el.remove(), (dur + 0.5) * 1000);
}
setInterval(spawnHeart, 220);

function burst(n = 14) {
  for (let i = 0; i < n; i++) setTimeout(spawnHeart, i * 25);
}

/* =========================
   MUSIC: toggle + fade + duck
   ========================= */

function isMusicEnabled() {
  return localStorage.getItem(MUSIC_KEY) !== "0";
}

function setMusicEnabled(v) {
  localStorage.setItem(MUSIC_KEY, v ? "1" : "0");
  updateMusicIcon();
}

function updateMusicIcon() {
  if (!musicToggle) return;
  musicToggle.textContent = isMusicEnabled() ? "🔊" : "🔇";
}

function fadeMusicTo(target, ms = 450) {
  if (!bgMusic) return;
  const start = Number.isFinite(bgMusic.volume) ? bgMusic.volume : BASE_VOL;
  const t0 = performance.now();

  function step(t) {
    const p = Math.min(1, (t - t0) / ms);
    bgMusic.volume = start + (target - start) * p;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

async function startMusicIfAllowed() {
  if (!bgMusic) return;
  if (!isMusicEnabled()) return;
  if (musicStarted) return;

  bgMusic.volume = 0;
  try {
    await bgMusic.play();
    musicStarted = true;
    fadeMusicTo(BASE_VOL, 600);
  } catch {
    // blocked until user gesture
  }
}

function pauseMusicWithFade() {
  if (!bgMusic) return;
  fadeMusicTo(0, 350);
  setTimeout(() => {
    try { bgMusic.pause(); } catch {}
  }, 360);
}

async function resumeMusicWithFade() {
  if (!bgMusic) return;
  try {
    bgMusic.volume = 0;
    await bgMusic.play();
    musicStarted = true;
    fadeMusicTo(BASE_VOL, 600);
  } catch {
    // blocked
  }
}

// Duck music volume temporarily (lower it), then restore
let duckDepth = 0;
function duckMusic(on) {
  if (!bgMusic) return;

  if (on) duckDepth++;
  else duckDepth = Math.max(0, duckDepth - 1);

  if (!musicStarted) return;

  const target = duckDepth > 0 ? DUCK_VOL : BASE_VOL;
  fadeMusicTo(target, 220);
}

// Toggle button
if (musicToggle) {
  musicToggle.addEventListener("click", async () => {
    if (isMusicEnabled()) {
      setMusicEnabled(false);
      pauseMusicWithFade();
    } else {
      setMusicEnabled(true);
      await resumeMusicWithFade();
    }
  });
}

// Start music on first user interaction anywhere (best practice)
document.addEventListener("click", () => startMusicIfAllowed(), { once: true });

updateMusicIcon();

/* ---------- Confetti sound ---------- */
let pendingConfettiSound = false;

function playConfettiSound() {
  try {
    const a = new Audio(CONFETTI_SOUND_SRC);
    a.volume = 0.9;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        pendingConfettiSound = true;
      });
    }
  } catch {
    pendingConfettiSound = true;
  }
}

// If blocked, try again on next click
document.addEventListener(
  "click",
  () => {
    if (!pendingConfettiSound) return;
    pendingConfettiSound = false;
    playConfettiSound();
  },
  { once: true }
);

/* ---------- Reward Popup ---------- */
const REWARD_MAP = {
  memory: "SERENDIPITOUS",
  hearts: "ARDOR",
  quiz: "TELEIOS",
};

function showReward(word) {
  rewardWordEl.textContent = word;
  rewardModal.classList.add("show");
  rewardModal.setAttribute("aria-hidden", "false");

  // lower bg music while popup is open
  duckMusic(true);

  burst(18);
}

function hideReward() {
  rewardModal.classList.remove("show");
  rewardModal.setAttribute("aria-hidden", "true");

  // restore bg music after popup closes
  duckMusic(false);

  if (returnHomeAfterReward) {
    returnHomeAfterReward = false;
    renderHome();
  }
}

closeRewardBtn.addEventListener("click", hideReward);
rewardModal.addEventListener("click", (e) => {
  if (e.target === rewardModal) hideReward();
});

function maybeShowReward(completedKey) {
  const word = REWARD_MAP[completedKey];
  if (!word) return;

  showReward(word);
  returnHomeAfterReward = true;
}

/* ---------- Dramatic Unlock FX ---------- */
function flashUnlock() {
  if (!unlockFlash) return;
  unlockFlash.classList.remove("play");
  void unlockFlash.offsetWidth;
  unlockFlash.classList.add("play");
}

function confettiBoom(count = 120) {
  flashUnlock();

  // duck music while confetti + sound plays
  duckMusic(true);

  for (let i = 0; i < count; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";

    const dx = Math.random() * 240 - 120 + "px";
    const rot = Math.random() * 720 - 360 + "deg";
    c.style.setProperty("--dx", dx);
    c.style.setProperty("--rot", rot);

    const w = 6 + Math.random() * 8;
    const h = 10 + Math.random() * 10;
    c.style.width = w + "px";
    c.style.height = h + "px";

    const dur = 1.8 + Math.random() * 1.8;
    c.style.animationDuration = dur + "s";

    const palette = ["#ff4da6", "#ff87c7", "#ffb3dd", "#ffd1ea", "#ffffff"];
    c.style.background = palette[Math.floor(Math.random() * palette.length)];

    document.body.appendChild(c);
    setTimeout(() => c.remove(), (dur + 0.25) * 1000);
  }

  playConfettiSound();
  burst(28);

  // restore music volume after the moment
  setTimeout(() => duckMusic(false), 1200);
}

/* ---------- Home Screen ---------- */
function renderHome() {
  const percent = Math.round((doneCount() / 3) * 100);

  root.innerHTML = `
    <div class="row" style="justify-content:space-between; align-items:flex-start;">
      <div style="flex:1; min-width:240px;">
        <h2 style="margin:0;">Home 💗</h2>
        <p class="muted" style="margin:8px 0 0;">
          Choose a game, ${NICKNAME}. Finish all 3 to unlock the letter.
        </p>
      </div>

      <div class="card" style="min-width:260px;">
        <div class="progress-wrap">
          <div><strong>Progress:</strong> ${doneCount()}/3 (${percent}%)</div>
          <div class="progress"><div class="bar" style="width:${percent}%"></div></div>
          <div class="muted" style="font-size:13px;">
            Memory ${progress.memory ? "✅" : "⬜"} • Hearts ${progress.hearts ? "✅" : "⬜"} • Quiz ${progress.quiz ? "✅" : "⬜"}
          </div>
          <button id="resetProgress" class="btn-danger">Reset progress</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:12px;">
      <div class="big"><strong>Pick a game:</strong></div>
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top:10px;">
        <button id="goMemory">1) Memory Icons 🧠💘</button>
        <button id="goHearts">2) Catch the Hearts 💞</button>
        <button id="goQuiz">3) Quiz (5 Questions) 🎯</button>
      </div>
      <p class="muted" style="margin-top:10px;">
        After each game, you’ll get a reward 🎁 then return here.
      </p>
    </div>

    <div class="card" style="margin-top:12px;">
      <div class="big"><strong>Final Letter Gate 💌</strong></div>
      <p class="muted" style="margin-top:6px;">Complete all games to unlock.</p>

      <div id="letterGate" class="letter-gate ${allDone() ? "unlocking" : "locked"}" style="margin-top:10px;">
        <a id="letterBtn" class="letter-btn" href="letter.html" aria-disabled="${allDone() ? "false" : "true"}" tabindex="${allDone() ? "0" : "-1"}">
          Open the Final Letter 💗
        </a>
        <div class="chains"></div>
        <div class="heart-lock">💗</div>
        <div class="heart-key" aria-hidden="true">🗝️💗</div>
      </div>
    </div>
  `;

  root.querySelector("#goMemory").addEventListener("click", () => loadGame("memory"));
  root.querySelector("#goHearts").addEventListener("click", () => loadGame("hearts"));
  root.querySelector("#goQuiz").addEventListener("click", () => loadGame("quiz"));

  root.querySelector("#resetProgress").addEventListener("click", () => {
    localStorage.removeItem(KEY);
    location.reload();
  });

  // attempt to start music if enabled (will actually start after first click if blocked)
  startMusicIfAllowed();

  // Unlock animation logic
  if (allDone()) {
    const gate = root.querySelector("#letterGate");
    const btn = root.querySelector("#letterBtn");

    if (!unlockPlayed) {
      unlockPlayed = true;

      // block click during animation
      btn.style.pointerEvents = "none";

      setTimeout(() => {
        gate.classList.remove("unlocking");
        gate.classList.add("unlocked");

        btn.setAttribute("aria-disabled", "false");
        btn.tabIndex = 0;
        btn.style.pointerEvents = "auto";

        confettiBoom(130);
      }, 1200);
    } else {
      gate.classList.remove("unlocking");
      gate.classList.add("unlocked");
      btn.setAttribute("aria-disabled", "false");
      btn.tabIndex = 0;
      btn.style.pointerEvents = "auto";
    }
  }

  burst(12);
}

/* ---------- Game loaders ---------- */
const loaders = {
  memory: () => import("./games/memory.js"),
  hearts: () => import("./games/hearts.js"),
  quiz: () => import("./games/quiz.js"),
};

async function loadGame(key) {
  root.innerHTML = `<p class="muted">Loading…</p>`;
  burst(10);

  const mod = await loaders[key]();
  mod.render(root, {
    nickname: NICKNAME,
    progress,
    setDone,
    doneCount,
    allDone,
    burst,
    goHome: renderHome,
  });
}

// init
renderHome();
burst(18);

