// Tetris Minimal — game + score only (no hold/next)
(() => {
  const COLS=10, ROWS=20, BASE_DROP_MS=850, LEVEL_SPEEDUP=0.85, CELL_PAD=1;
  const COLORS={I:"#29b6f6",J:"#5c6bc0",L:"#ffa726",O:"#ffee58",S:"#66bb6a",T:"#ab47bc",Z:"#ef5350",GHOST:"rgba(255,255,255,.18)"};
  const SHAPES={
    I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    J:[[1,0,0],[1,1,1],[0,0,0]],
    L:[[0,0,1],[1,1,1],[0,0,0]],
    O:[[1,1],[1,1]],
    S:[[0,1,1],[1,1,0],[0,0,0]],
    T:[[0,1,0],[1,1,1],[0,0,0]],
    Z:[[1,1,0],[0,1,1],[0,0,0]]
  };

  const canvas=document.getElementById("game");
  const ctx=canvas.getContext("2d");
  const $score=document.getElementById("score");

  let cell, last=0, acc=0, dropMs=BASE_DROP_MS, state="play";
  const SCORES={1:100,2:300,3:500,4:800};
  const softDropScore=1, hardDropScore=2;

  const board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  let bag=[], queue=[], current=null;
  let score=0, lines=0, level=1;

  const rotateMatrix=(m)=>{const N=m.length,res=Array.from({length:N},()=>Array(N).fill(0));
    for(let y=0;y<N;y++)for(let x=0;x<N;x++) res[x][N-1-y]=m[y][x]; return res;};
  const collides=(p)=>{const m=p.matrix;
    for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++){
      if(!m[y][x])continue;
      const bx=p.x+x,by=p.y+y;
      if(bx<0||bx>=COLS||by>=ROWS) return true;
      if(by>=0&&board[by][bx]) return true;
    } return false;};
  const merge=(p)=>{for(let y=0;y<p.matrix.length;y++)for(let x=0;x<p.matrix[y].length;x++){
    if(!p.matrix[y][x])continue; const bx=p.x+x,by=p.y+y; if(by>=0) board[by][bx]=p.type;}};

  function clearLines(){
    let cleared=0;
    outer: for(let y=ROWS-1;y>=0;y--){
      for(let x=0;x<COLS;x++){ if(!board[y][x]) continue outer; }
      board.splice(y,1); board.unshift(Array(COLS).fill(0)); cleared++; y++;
    }
    if(cleared){
      score+=(SCORES[cleared]||0)*level;
      lines+=cleared;
      if(lines>=level*10){ level++; dropMs=Math.max(80, BASE_DROP_MS*Math.pow(LEVEL_SPEEDUP,level-1)); }
      updateHUD();
    }
  }

  function newBag(){
    const p=["I","J","L","O","S","T","Z"];
    for(let i=p.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
    bag=p;
  }
  function refillQueue(){ while(queue.length<1){ if(!bag.length) newBag(); queue.push(bag.pop()); } }
  const getTopPadding=(m)=>{let pad=0; for(let y=0;y<m.length;y++){ if(m[y].some(v=>v)) break; pad++; } return pad; };
  function spawn(){
    refillQueue();
    const type=queue.shift(), shape=SHAPES[type].map(r=>r.slice()), size=shape.length;
    const piece={type, matrix:shape, x:Math.floor(COLS/2)-Math.ceil(size/2), y:-getTopPadding(shape)};
    if(collides(piece)) state="over";
    return piece;
  }

  function softDrop(){
    current.y++;
    if(collides(current)){ current.y--; lock(); return false; }
    else { score+=softDropScore; updateHUD(); }
    return true;
  }
  function hardDrop(){
    let d=0; while(!collides(current)){ current.y++; d++; }
    current.y--; d--;
    score+=Math.max(0,d)*hardDropScore; lock(); updateHUD();
  }
  function lock(){ merge(current); clearLines(); current=spawn(); }
  function move(dx){ current.x+=dx; if(collides(current)) current.x-=dx; }
  function rotate(){
    const rot=rotateMatrix(current.matrix);
    const tests=[{x:0,y:0},{x:1,y:0},{x:-1,y:0},{x:0,y:-1},{x:2,y:0},{x:-2,y:0}];
    for(const off of tests){
      const t={...current,matrix:rot,x:current.x+off.x,y:current.y+off.y};
      if(!collides(t)){ current.matrix=rot; current.x=t.x; current.y=t.y; return; }
    }
  }

  function drawCell(x,y,color){
    const px=x*cell, py=y*cell;
    ctx.fillStyle=color;
    ctx.fillRect(px+CELL_PAD, py+CELL_PAD, cell-CELL_PAD*2, cell-CELL_PAD*2);
  }
  function getGhost(){
    const g={type:current.type,matrix:current.matrix.map(r=>r.slice()),x:current.x,y:current.y};
    while(!collides(g)) g.y++; g.y--; return g;
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle="#17202b"; ctx.lineWidth=1;
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++) ctx.strokeRect(x*cell,y*cell,cell,cell);
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){ const t=board[y][x]; if(t) drawCell(x,y,COLORS[t]); }
    const ghost=getGhost();
    for(let y=0;y<ghost.matrix.length;y++)for(let x=0;x<ghost.matrix[y].length;x++){
      if(!ghost.matrix[y][x]) continue; const gx=ghost.x+x, gy=ghost.y+y; if(gy>=0) drawCell(gx,gy,COLORS.GHOST);
    }
    for(let y=0;y<current.matrix.length;y++)for(let x=0;x<current.matrix[y].length;x++){
      if(!current.matrix[y][x]) continue; const px=current.x+x, py=current.y+y; if(py>=0) drawCell(px,py,COLORS[current.type]);
    }
  }

  function updateHUD(){ $score.textContent=score; }

  function loop(t){
    if(state!=="play") return;
    const dt=(t||0)-last; last=t||0; acc+=dt;
    if(acc>=dropMs){ acc-=dropMs; softDrop(); }
    draw(); requestAnimationFrame(loop);
  }

  function resize(){
    const r=canvas.getBoundingClientRect();
    canvas.width=Math.floor(r.width);
    canvas.height=Math.floor(r.height);
    cell=Math.floor(canvas.width/COLS);
  }

  // Touch + keyboard
  const btns=[...document.querySelectorAll(".controls .btn")];
  const intervals=new Map();
  function perform(a){
    if(state!=="play")return;
    if(a==="left") move(-1);
    else if(a==="right") move(1);
    else if(a==="down") softDrop();
    else if(a==="rotate") rotate();
    else if(a==="hard") hardDrop();
    draw();
  }
  btns.forEach(btn=>{
    const a=btn.dataset.action;
    const start=(e)=>{e.preventDefault(); perform(a);
      if(a==="left"||a==="right"||a==="down"){
        const id=setInterval(()=>perform(a), a==="down"?60:90);
        intervals.set(btn,id);
      }
    };
    const end=()=>{const id=intervals.get(btn); if(id) clearInterval(id); intervals.delete(btn);};
    btn.addEventListener("pointerdown",start,{passive:false});
    btn.addEventListener("pointerup",end);
    btn.addEventListener("pointerleave",end);
    btn.addEventListener("pointercancel",end);
  });
  document.addEventListener("keydown",(e)=>{
    const map={
      ArrowLeft:()=>perform("left"),
      ArrowRight:()=>perform("right"),
      ArrowDown:()=>perform("down"),
      KeyZ:()=>perform("rotate"),
      KeyX:()=>perform("rotate"),
      Space:()=>perform("hard")
    };
    const f=map[e.code]; if(f){e.preventDefault(); f();}
  },{passive:false});

  function reset(){
    for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) board[y][x]=0;
    score=0; lines=0; level=1; dropMs=BASE_DROP_MS; updateHUD();
    bag=[]; queue=[]; current=spawn(); last=performance.now(); acc=0;
    draw(); requestAnimationFrame(loop);
  }

  // init
  window.addEventListener("resize",()=>{resize(); draw();});
  resize(); newBag(); current=spawn(); updateHUD(); requestAnimationFrame(loop);
})();
