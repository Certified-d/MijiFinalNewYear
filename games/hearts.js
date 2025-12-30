export function render(root, ctx) {
  let score = 0;
  let time = 18;
  let running = false;
  let spawnTimer = null;
  let countdownTimer = null;

  const TARGET = 5;

  root.innerHTML = `
    <div class="row" style="justify-content:space-between;">
      <div>
        <h2 style="margin:0;">2) Catch the Hearts 💞</h2>
        <div class="muted" style="margin-top:6px;">Catch ${TARGET} hearts to win, ${ctx.nickname}.</div>
      </div>
      <div class="card">
        <div><strong>Hearts:</strong> <span id="score">0</span> / ${TARGET}</div>
        <div><strong>Time:</strong> <span id="time">${time}</span>s</div>
      </div>
    </div>

    <div id="arena" class="card" style="position:relative; height: 360px; overflow:hidden; margin-top:12px;"></div>

    <div class="row" style="margin-top:12px;">
      <button id="start">Start</button>
      <button id="restart">Restart</button>
      <button id="home">Back Home</button>
      <span class="muted">Tip: Click hearts. Win love. Simple economics.</span>
    </div>
  `;

  const arena = root.querySelector("#arena");
  const scoreEl = root.querySelector("#score");
  const timeEl = root.querySelector("#time");

  root.querySelector("#start").addEventListener("click", start);
  root.querySelector("#restart").addEventListener("click", () => render(root, ctx));
  root.querySelector("#home").addEventListener("click", ctx.goHome);

  function start() {
    if (running) return;
    running = true;

    spawnTimer = setInterval(spawn, 520);
    countdownTimer = setInterval(() => {
      time--;
      timeEl.textContent = String(time);
      if (time <= 0) end(false);
    }, 1000);
  }

  function spawn() {
    const el = document.createElement("button");
    el.textContent = "💖";
    el.style.position = "absolute";
    el.style.borderRadius = "999px";
    el.style.width = "58px";
    el.style.height = "58px";
    el.style.fontSize = "24px";

    const maxX = arena.clientWidth - 58;
    const maxY = arena.clientHeight - 58;

    el.style.left = Math.floor(Math.random() * Math.max(1, maxX)) + "px";
    el.style.top = Math.floor(Math.random() * Math.max(1, maxY)) + "px";

    el.addEventListener("click", () => {
      score += 1;
      scoreEl.textContent = String(score);
      el.remove();
      ctx.burst(6);

      if (score >= TARGET) end(true);
    });

    arena.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  function end(win) {
    running = false;
    clearInterval(spawnTimer);
    clearInterval(countdownTimer);

    if (win) {
      ctx.setDone("hearts");
      ctx.burst(18);
    }

    root.innerHTML = `
      <div class="card">
        <div class="big"><strong>${win ? "You caught enough hearts! 💗" : "Time’s up! ⏳"}</strong></div>
        <p class="muted">${win ? "Reward popped. Tap “Back to Home” on the reward popup." : "Bano ng tutok mo man, pati ba naman dito? 😌"}</p>
        <div class="row">
          <button id="again">${win ? "Play again" : "Retry"}</button>
          <button id="homeNow">Home</button>
        </div>
      </div>
    `;
    root.querySelector("#again").addEventListener("click", () => render(root, ctx));
    root.querySelector("#homeNow").addEventListener("click", ctx.goHome);
  }
}
