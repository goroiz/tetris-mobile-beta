// Tetris Mobile by Ganbi — vanilla JS
(() => {
  const COLS = 10;
  const ROWS = 20;
  const BASE_DROP_MS = 850; // level 1
  const LEVEL_SPEEDUP = 0.85; // per level
  const CELL_PAD = 1; // px inner padding between blocks

  const COLORS = {
    I: "#29b6f6",
    J: "#5c6bc0",
    L: "#ffa726",
    O: "#ffee58",
    S: "#66bb6a",
    T: "#ab47bc",
    Z: "#ef5350",
    GHOST: "rgba(255,255,255,.18)"
  };

  // Tetrimino matrices (spawn in top-middle)
  const SHAPES = {
    I: [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0],
    ],
    J: [
      [1,0,0],
      [1,1,1],
      [0,0,0],
    ],
    L: [
      [0,0,1],
      [1,1,1],
      [0,0,0],
    ],
    O: [
      [1,1],
      [1,1],
    ],
    S: [
      [0,1,1],
      [1,1,0],
      [0,0,0],
    ],
    T: [
      [0,1,0],
      [1,1,1],
      [0,0,0],
    ],
    Z: [
      [1,1,0],
      [0,1,1],
      [0,0,0],
    ]
  };

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const holdCanvas = document.getElementById("hold");
  const holdCtx = holdCanvas.getContext("2d");
  const nextCanvas = document.getElementById("next");
  const nextCtx = nextCanvas.getContext("2d");
  const $score = document.getElementById("score");
  const $level = document.getElementById("level");
  const $lines = document.getElementById("lines");
  const $overlay = document.getElementById("overlay");
  const $overlayTitle = document.getElementById("overlayTitle");
  const $overlaySubtitle = document.getElementById("overlaySubtitle");
  const $btnPause = document.getElementById("btnPause");
  const $btnResume = document.getElementById("btnResume");
  const $btnRestart = document.getElementById("btnRestart");

  let cell; // pixel size of a grid cell (computed by resize)
  let now, last = 0, acc = 0;
  let dropMs = BASE_DROP_MS;
  let state = "play"; // play | pause | over

  const SCORES = { 1: 100, 2: 300, 3: 500, 4: 800 };
  const softDropScore = 1;
  const hardDropScore = 2;

  const board = createMatrix(COLS, ROWS, 0);
  let bag = [];
  let nextQueue = [];
  let current = null;
  let hold = null;
  let canHold = true;
  let score = 0, level = 1, lines = 0;

  function createMatrix(w, h, v=0) {
    return Array.from({length: h}, () => Array(w).fill(v));
  }
  function cloneMatrix(m) { return m.map(r => r.slice()); }
  function rotateMatrix(m) {
    const N = m.length;
    const res = Array.from({length:N}, () => Array(N).fill(0));
    for (let y=0;y<N;y++) for (let x=0;x<N;x++) res[x][N-1-y]=m[y][x];
    return res;
  }

  function newBag() {
    const pieces = Object.keys(SHAPES);
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    bag = pieces;
  }

  function refillQueue() {
    while (nextQueue.length < 5) {
      if (bag.length === 0) newBag();
      nextQueue.push(bag.pop());
    }
  }

  function spawn() {
    refillQueue();
    const type = nextQueue.shift();
    const shape = SHAPES[type].map(r => r.slice());
    const size = shape.length;
    const piece = {
      type,
      matrix: shape,
      x: Math.floor(COLS/2) - Math.ceil(size/2),
      y: -getTopPadding(shape), // so it spawns smoothly above board
      locked: false
    };
    if (collides(board, piece)) {
      state = "over";
      showOverlay("Game Over", "Tap Restart to try again.");
    }
    return piece;
  }

  function getTopPadding(m) {
    let pad = 0;
    for (let y=0;y<m.length;y++) {
      if (m[y].some(v => v)) break;
      pad++;
    }
    return pad;
  }

  function collides(b, p) {
    const m = p.matrix;
    for (let y=0;y<m.length;y++) {
      for (let x=0;x<m[y].length;x++) {
        if (!m[y][x]) continue;
        const bx = p.x + x;
        const by = p.y + y;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && b[by][bx]) return true;
      }
    }
    return false;
  }

  function merge(b, p) {
    const m = p.matrix;
    for (let y=0;y<m.length;y++) {
      for (let x=0;x<m[y].length;x++) {
        if (!m[y][x]) continue;
        const bx = p.x + x;
        const by = p.y + y;
        if (by >= 0) b[by][bx] = p.type;
      }
    }
  }

  function clearLines() {
    let cleared = 0;
    outer: for (let y = ROWS - 1; y >= 0; y--) {
      for (let x = 0; x < COLS; x++) {
        if (!board[y][x]) continue outer;
      }
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      y++;
    }
    if (cleared > 0) {
      score += (SCORES[cleared] || 0) * level;
      lines += cleared;
      if (lines >= level * 10) {
        level++;
        dropMs = Math.max(80, BASE_DROP_MS * Math.pow(LEVEL_SPEEDUP, level - 1));
      }
      updateHUD();
    }
  }

  function softDrop() {
    current.y++;
    if (collides(board, current)) {
      current.y--;
      lockPiece();
      return false;
    } else {
      score += softDropScore;
      updateHUD();
    }
    return true;
  }

  function hardDrop() {
    let dist = 0;
    while (!collides(board, current)) {
      current.y++;
      dist++;
    }
    current.y--;
    dist--;
    score += Math.max(0, dist) * hardDropScore;
    lockPiece();
    updateHUD();
  }

  function lockPiece() {
    merge(board, current);
    clearLines();
    current = spawn();
    canHold = true;
  }

  function move(dx) {
    current.x += dx;
    if (collides(board, current)) current.x -= dx;
  }

  // Basic SRS-like wall kicks
  function rotate() {
    const before = current.matrix;
    const rotated = rotateMatrix(before);
    const testOffsets = [
      {x:0, y:0},
      {x:1, y:0},
      {x:-1, y:0},
      {x:0, y:-1},
      {x:2, y:0},
      {x:-2, y:0},
    ];
    for (const off of testOffsets) {
      const trial = { ...current, matrix: rotated, x: current.x + off.x, y: current.y + off.y };
      if (!collides(board, trial)) {
        current.matrix = rotated;
        current.x = trial.x;
        current.y = trial.y;
        return;
      }
    }
  }

  function holdSwap() {
    if (!canHold) return;
    if (!hold) {
      hold = current.type;
      current = spawn();
    } else {
      const tmp = hold;
      hold = current.type;
      const shape = SHAPES[tmp].map(r => r.slice());
      current = {
        type: tmp,
        matrix: shape,
        x: Math.floor(COLS/2) - Math.ceil(shape.length/2),
        y: -getTopPadding(shape),
        locked: false
      };
      if (collides(board, current)) {
        // if collides after swap, revert swap (rare)
        const backup = hold;
        hold = current.type;
        const shape2 = SHAPES[backup].map(r => r.slice());
        current = {
          type: backup,
          matrix: shape2,
          x: Math.floor(COLS/2) - Math.ceil(shape2.length/2),
          y: -getTopPadding(shape2),
          locked: false
        };
      }
    }
    canHold = false;
  }

  function drawCell(x, y, color) {
    const px = x * cell;
    const py = y * cell;
    ctx.fillStyle = color;
    ctx.fillRect(px + CELL_PAD, py + CELL_PAD, cell - CELL_PAD*2, cell - CELL_PAD*2);
  }

  function getGhost() {
    const ghost = {
      type: current.type,
      matrix: cloneMatrix(current.matrix),
      x: current.x,
      y: current.y
    };
    while (!collides(board, ghost)) ghost.y++;
    ghost.y--;
    return ghost;
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    // grid backdrop
    ctx.strokeStyle = "#17202b";
    ctx.lineWidth = 1;
    for (let y=0;y<ROWS;y++) {
      for (let x=0;x<COLS;x++) {
        ctx.strokeRect(x*cell, y*cell, cell, cell);
      }
    }
    // board
    for (let y=0;y<ROWS;y++) {
      for (let x=0;x<COLS;x++) {
        const t = board[y][x];
        if (!t) continue;
        drawCell(x, y, COLORS[t]);
      }
    }
    // ghost
    const ghost = getGhost();
    for (let y=0;y<ghost.matrix.length;y++) {
      for (let x=0;x<ghost.matrix[y].length;x++) {
        if (!ghost.matrix[y][x]) continue;
        const gx = ghost.x + x;
        const gy = ghost.y + y;
        if (gy >= 0) drawCell(gx, gy, COLORS.GHOST);
      }
    }
    // current
    for (let y=0;y<current.matrix.length;y++) {
      for (let x=0;x<current.matrix[y].length;x++) {
        if (!current.matrix[y][x]) continue;
        const px = current.x + x;
        const py = current.y + y;
        if (py >= 0) drawCell(px, py, COLORS[current.type]);
      }
    }

    // hold + next panels
    drawMini(holdCtx, hold, true);
    drawNextList(nextCtx, nextQueue);
  }

  function drawMini(c2d, type, single=false) {
    const w = c2d.canvas.width;
    const h = c2d.canvas.height;
    c2d.clearRect(0,0,w,h);
    if (!type) return;
    const shape = SHAPES[type];
    const size = shape.length;
    const scale = Math.min(
      Math.floor((w - 16) / size),
      Math.floor((h - 16) / size)
    );
    const offsetX = Math.floor((w - size*scale)/2);
    const offsetY = Math.floor((h - size*scale)/2);
    c2d.fillStyle = "#1b2330";
    c2d.fillRect(6,6,w-12,h-12);
    for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
      if (!shape[y][x]) continue;
      c2d.fillStyle = COLORS[type];
      c2d.fillRect(offsetX + x*scale + 2, offsetY + y*scale + 2, scale - 4, scale - 4);
    }
  }

  function drawNextList(c2d, queue) {
    const w = c2d.canvas.width;
    const h = c2d.canvas.height;
    c2d.clearRect(0,0,w,h);
    const itemH = Math.floor(h / 5);
    for (let i=0;i<5;i++) {
      const type = queue[i];
      if (!type) continue;
      const shape = SHAPES[type];
      const size = shape.length;
      const scale = Math.min(Math.floor((w - 18) / size), Math.floor((itemH - 18) / size));
      const ox = Math.floor((w - size*scale)/2);
      const oy = i*itemH + Math.floor((itemH - size*scale)/2);
      c2d.fillStyle = "#1b2330";
      c2d.fillRect(6, i*itemH + 6, w - 12, itemH - 12);
      for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
        if (!shape[y][x]) continue;
        c2d.fillStyle = COLORS[type];
        c2d.fillRect(ox + x*scale + 2, oy + y*scale + 2, scale - 4, scale - 4);
      }
    }
  }

  function updateHUD() {
    $score.textContent = score;
    $level.textContent = level;
    $lines.textContent = lines;
  }

  function loop(t) {
    if (state !== "play") return;
    now = t || 0;
    const dt = now - last;
    last = now;
    acc += dt;

    if (acc >= dropMs) {
      acc -= dropMs;
      softDrop();
    }
    draw();
    requestAnimationFrame(loop);
  }

  function resize() {
    // compute cell size based on canvas css size (10x20 grid)
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
    cell = Math.floor(canvas.width / COLS);
  }

  // Input handling
  const keys = {
    ArrowLeft: () => move(-1),
    ArrowRight: () => move(1),
    ArrowDown: () => softDrop(),
    KeyZ: () => rotate(),
    KeyX: () => rotate(),
    Space: () => hardDrop(),
    KeyC: () => holdSwap(),
    KeyP: () => togglePause(),
    Escape: () => togglePause(),
  };
  document.addEventListener("keydown", (e) => {
    if (state !== "play" && e.code !== "Escape" && e.code !== "KeyP") return;
    const f = keys[e.code];
    if (f) { e.preventDefault(); f(); draw(); }
  }, { passive: false });

  // Touch buttons with press-and-hold
  const btns = Array.from(document.querySelectorAll(".controls .btn"));
  const intervals = new Map();
  btns.forEach(btn => {
    const action = btn.getAttribute("data-action");
    const start = (ev) => {
      ev.preventDefault();
      perform(action);
      if (action === "left" || action === "right" || action === "down") {
        const id = setInterval(() => { perform(action); }, action==="down" ? 60 : 90);
        intervals.set(btn, id);
      }
    };
    const end = () => {
      const id = intervals.get(btn);
      if (id) clearInterval(id);
      intervals.delete(btn);
    };
    btn.addEventListener("pointerdown", start, { passive: false });
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointerleave", end);
    btn.addEventListener("pointercancel", end);
  });

  function perform(action) {
    if (state !== "play") return;
    switch(action) {
      case "left": move(-1); break;
      case "right": move(1); break;
      case "down": softDrop(); break;
      case "rotate": rotate(); break;
      case "hard": hardDrop(); break;
      case "hold": holdSwap(); break;
    }
    draw();
  }

  function showOverlay(title, subtitle) {
    $overlayTitle.textContent = title;
    $overlaySubtitle.textContent = subtitle;
    $overlay.classList.remove("hidden");
  }
  function hideOverlay() {
    $overlay.classList.add("hidden");
  }
  function togglePause() {
    if (state === "play") {
      state = "pause";
      showOverlay("Paused", "Tap resume to continue.");
    } else if (state === "pause") {
      state = "play";
      hideOverlay();
      last = performance.now();
      acc = 0;
      requestAnimationFrame(loop);
    }
  }

  $btnPause.addEventListener("click", togglePause);
  $btnResume.addEventListener("click", togglePause);
  $btnRestart.addEventListener("click", () => {
    reset();
    hideOverlay();
  });

  function reset() {
    for (let y=0;y<ROWS;y++) for (let x=0;x<COLS;x++) board[y][x] = 0;
    score = 0; lines = 0; level = 1; dropMs = BASE_DROP_MS; updateHUD();
    bag = []; nextQueue = []; hold = null; canHold = true;
    current = spawn();
    state = "play";
    last = performance.now();
    acc = 0;
    draw();
    requestAnimationFrame(loop);
  }

  // Init
  window.addEventListener("resize", () => { resize(); draw(); });
  resize();
  newBag(); refillQueue();
  current = spawn();
  updateHUD();
  requestAnimationFrame(loop);
})();
