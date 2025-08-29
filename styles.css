/* Minimal mobile Tetris: only game + score */
:root{
  --bg:#0b0d12; --panel:#11151c; --text:#dbe4ff;
  --btn:#1a2330; --btnActive:#243144; --shadow:0 10px 30px rgba(0,0,0,.35);
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%}
body{
  margin:0;
  font-family:'Plus Jakarta Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  background: radial-gradient(1200px 600px at 70% -50%, rgba(108,99,255,.12), transparent),
             radial-gradient(800px 400px at -10% 120%, rgba(0,180,216,.10), transparent),
             var(--bg);
  color:var(--text);
}
.wrap{min-height:100%;display:grid;grid-template-rows:auto 1fr auto}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px}
.brand{font-weight:800;letter-spacing:.5px}
.brand span{color:#85f4ff;margin-left:4px}
.score{font-weight:800}

.stage{display:grid;place-items:center;padding:8px 12px}
#game{
  width:min(92vw,420px);
  height:calc(min(92vw,420px)*2);
  background:var(--panel);
  border:1px solid #213044;
  border-radius:14px;
  box-shadow:var(--shadow);
  image-rendering:pixelated;
}

.controls{
  position:sticky;bottom:0;padding:8px 12px 14px;
  background:linear-gradient(0deg, rgba(11,13,18,.8), rgba(11,13,18,.3));
  backdrop-filter:blur(6px);border-top:1px solid #1a2330
}
.controls .row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:8px}
.controls .row:last-child{grid-template-columns:repeat(2,1fr);margin-bottom:0}
.btn{padding:14px 0;background:var(--btn);color:var(--text);font-weight:800;border:1px solid #233249;border-radius:12px;box-shadow:var(--shadow)}
.btn:active{background:var(--btnActive)}
