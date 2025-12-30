export function render(root, ctx) {
  const symbols = ["💖","💗","💘","😍","✨","🎀","🌸","🥰"];
  const deck = shuffle([...symbols, ...symbols]).map((s, i) => ({
    id: i, s, flipped: false, matched: false
  }));

  let first = null;
  let lock = false;
  let moves = 0;
  let matches = 0;

  root.innerHTML = `
    <div class="row" style="justify-content:space-between;">
      <div>
        <h2 style="margin:0;">1) Memory Icons 🧠💘</h2>
        <div class="muted" style="margin-top:6px;">Match all pairs to win, ${ctx.nickname}.</div>
      </div>
      <div class="card">
        <div><strong>Moves:</strong> <span id="moves">0</span></div>
        <div><strong>Matched:</strong> <span id="matched">0</span> / ${symbols.length}</div>
      </div>
    </div>

    <div id="grid" class="grid" style="grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top:12px;"></div>

    <div class="card" style="margin-top:12px;">
      <button id="home">Back Home</button>
      <span class="muted">Hope you're not drunk! You usually forget things when you're drunk. 😉</span>
    </div>
  `;

  const grid = root.querySelector("#grid");
  const movesEl = root.querySelector("#moves");
  const matchedEl = root.querySelector("#matched");
  root.querySelector("#home").addEventListener("click", ctx.goHome);

  function draw() {
    grid.innerHTML = "";
    deck.forEach(card => {
      const btn = document.createElement("button");
      btn.style.padding = "16px";
      btn.style.borderRadius = "18px";
      btn.style.minHeight = "74px";
      btn.style.fontSize = "26px";
      btn.textContent = (card.flipped || card.matched) ? card.s : "❓";
      btn.disabled = lock || card.matched || card.flipped;
      btn.addEventListener("click", () => flip(card));
      grid.appendChild(btn);
    });

    movesEl.textContent = String(moves);
    matchedEl.textContent = String(matches);
  }

  function flip(card) {
    if (lock || card.flipped || card.matched) return;
    card.flipped = true;

    if (!first) {
      first = card;
      draw();
      return;
    }

    moves++;
    lock = true;
    draw();

    if (first.s === card.s) {
      setTimeout(() => {
        first.matched = true;
        card.matched = true;
        first = null;
        lock = false;
        matches++;
        ctx.burst(8);

        if (matches === symbols.length) win();
        draw();
      }, 320);
    } else {
      setTimeout(() => {
        first.flipped = false;
        card.flipped = false;
        first = null;
        lock = false;
        draw();
      }, 620);
    }
  }

  function win() {
    ctx.setDone("memory"); // shows reward + returns home after popup closes
    ctx.burst(18);

    root.innerHTML = `
      <div class="card">
        <div class="big"><strong>Memory cleared! 💖</strong></div>
        <p class="muted">Reward popped. Tap “Back to Home” on the reward popup.</p>
        <button id="homeNow">Go Home</button>
      </div>
    `;
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
