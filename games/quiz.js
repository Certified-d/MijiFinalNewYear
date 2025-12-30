export function render(root, ctx) {
  const quiz = {
    title: "3) Quiz (5 Questions) 🎯",
    desc: "Answer these correctly… or you owe Me snacks 😌",
    questions: [
      {
        q: "What is Amir's Birthday?",
        correctText: "May 25, 2007",
        options: ["May 25, 2007", "May 25, 2006", "June 25, 2007", "April 25, 2007"]
      },
      {
        q: "What is Amir's Zodiac Sign?",
        correctText: "Gemini",
        options: ["Gemini", "Taurus", "Cancer", "Leo"]
      },
      {
        q: "What is Amir's favorite Anime?",
        correctText: "One Piece",
        options: ["One Piece", "Naruto", "Attack on Titan", "Demon Slayer"]
      },
      {
        q: "Where was our First Kiss?",
        correctText: "Friend's Place",
        options: ["Friend's Place", "Mall", "Park", "School"]
      },
      {
        q: "Does Amir love you?",
        correctText: "Yes",
        options: ["Yes", "Maybe", "Not sure", "He’s thinking about it 😭"]
      }
    ]
  };

  let idx = 0;
  let score = 0;

  root.innerHTML = `
    <div class="row" style="justify-content:space-between;">
      <div>
        <h2 style="margin:0;">${quiz.title}</h2>
        <div class="muted" style="margin-top:6px;">${quiz.desc}</div>
      </div>
      <div class="card">
        <div><strong>Score:</strong> <span id="score">${score}</span></div>
        <div class="muted" style="font-size:13px;">5 questions total</div>
      </div>
    </div>

    <div id="box" class="card" style="margin-top:12px;"></div>

    <div class="card" style="margin-top:12px;">
      <button id="home">Back Home</button>
      <span class="muted">Tip: The correct answers are basically love facts.</span>
    </div>
  `;

  const box = root.querySelector("#box");
  const scoreEl = root.querySelector("#score");
  root.querySelector("#home").addEventListener("click", ctx.goHome);

  function draw() {
    const item = quiz.questions[idx];
    const opts = shuffle(item.options);

    box.innerHTML = `
      <div class="muted">Question ${idx + 1} / ${quiz.questions.length}</div>
      <div class="big" style="margin:10px 0 12px;"><strong>${escapeHtml(item.q)}</strong></div>
      <div class="grid" style="grid-template-columns: 1fr;">
        ${opts.map(opt => `<button class="opt">${escapeHtml(opt)}</button>`).join("")}
      </div>
    `;

    box.querySelectorAll("button.opt").forEach(btn => {
      btn.addEventListener("click", () => answer(btn.textContent));
    });
  }

  function answer(choiceText) {
    const item = quiz.questions[idx];
    if (choiceText === item.correctText) {
      score++;
      scoreEl.textContent = String(score);
      ctx.burst(10);
    }
    idx++;
    if (idx >= quiz.questions.length) return finish();
    draw();
  }

  function finish() {
    ctx.setDone("quiz");
    ctx.burst(18);

    const pct = Math.round((score / quiz.questions.length) * 100);
    const line =
      pct === 100 ? "Perfect. Just like you, Bae. 💗" :
      pct >= 80 ? "Ngek, may nakalimutan? 😌" :
      pct >= 60 ? "3/5? Damnnn, I'm sad." :
      "k. You owe me snacks and an apology or we could fuck or something.";

    root.innerHTML = `
      <div class="card">
        <div class="big"><strong>Quiz Complete 💖</strong></div>
        <p><strong>${pct}%</strong> (${score}/5)</p>
        <p class="muted">${line}</p>
        <p class="muted">Reward popped. Tap “Back to Home” on the reward popup.</p>
        <div class="row">
          <button id="again">Play again</button>
          <button id="homeNow">Home</button>
        </div>
      </div>
    `;

    root.querySelector("#again").addEventListener("click", () => render(root, ctx));
    root.querySelector("#homeNow").addEventListener("click", ctx.goHome);
  }

  draw();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
