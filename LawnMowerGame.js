// why is brodie in my code
// game by minidoom1
function LawnMowerGameInit() {
  document.body.style.margin='0';
  document.body.style.overflow='hidden';

  const canvas = document.createElement('canvas');
  canvas.style.position='fixed';
  canvas.style.top='0';
  canvas.style.left='0';
  canvas.style.width='100%';
  canvas.style.height='100%';
  canvas.style.display='block';
  canvas.style.zIndex='0';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const hud = document.createElement('div');
  hud.style.position = 'fixed';
  hud.style.top = '10px';
  hud.style.left = '50%';
  hud.style.transform = 'translateX(-50%)';
  hud.style.display = 'flex';
  hud.style.gap = '20px';
  hud.style.background = 'rgba(255,255,255,0.7)';
  hud.style.padding = '8px 16px';
  hud.style.borderRadius = '12px';
  hud.style.fontWeight = 'bold';
  hud.style.color = '#023047';
  hud.style.zIndex = '10';
  document.body.appendChild(hud);

  const scoreDiv = document.createElement('div');
  scoreDiv.innerHTML = 'Score: <span id="score">0</span>';
  const leftDiv = document.createElement('div');
  leftDiv.innerHTML = 'Grass left: <span id="left">0</span>';
  const fuelDiv = document.createElement('div');
  fuelDiv.innerHTML = 'Fuel: <span id="fuel">100</span>%';
  hud.appendChild(scoreDiv);
  hud.appendChild(leftDiv);
  hud.appendChild(fuelDiv);

  const scoreEl = document.getElementById('score');
  const leftEl = document.getElementById('left');
  const fuelEl = document.getElementById('fuel');

  let CELL, offsetX=0, offsetY=0;
  let ROWS, COLS, grid = [], fuelCells = [], totalGrass = 0;

  const player = {x:0, y:0, speed:0.2, fuel:100, score:0};
  const keys = {};
  let paused=false, won=false, last=0;
  let levelNum = 1;

  window.addEventListener('keydown', e=>keys[e.key.toLowerCase()]=true);
  window.addEventListener('keyup', e=>keys[e.key.toLowerCase()]=false);

  const mowerImg = new Image();
  mowerImg.src = 'lm.png';

  const gasImg = new Image();
  gasImg.src = 'gas.png';

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if(COLS && ROWS) {
      CELL = Math.min(canvas.width / COLS, canvas.height / ROWS);
      offsetX = (canvas.width - CELL * COLS)/2;
      offsetY = (canvas.height - CELL * ROWS)/2;
    }
    if(levelNum>=1) loadLevel(levelNum);
  }
  window.addEventListener('resize', resize);

  function showStartScreen(mp3Src, imgSrc, callback) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = '#231F20';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '1000';
    document.body.appendChild(overlay);

    const buttonImg = document.createElement('img');
    buttonImg.src = imgSrc;
    buttonImg.style.width = '300px';
    buttonImg.style.cursor = 'pointer';
    buttonImg.style.transition = 'transform 0.2s ease';
    buttonImg.onmouseover = () => { buttonImg.style.transform = 'scale(1.05)'; };
    buttonImg.onmouseout = () => { buttonImg.style.transform = 'scale(1)'; };
    overlay.appendChild(buttonImg);

    const audio = new Audio(mp3Src);
    audio.loop = true;
    audio.volume = 0.1;

    buttonImg.addEventListener('click', () => {
      audio.play();
      overlay.style.transition = 'opacity 2s ease';
      overlay.style.opacity = 0;
      setTimeout(() => { document.body.removeChild(overlay); callback(); }, 2000);
    });
  }

  function loadLevel(num){
    ROWS = Math.min(10+num*2, 30);
    COLS = Math.min(15+num*2, 40);
    const grassDensity = Math.max(0.5, 0.8 - num*0.02);
    const fuelCount = Math.min(3 + num, 10);
    player.speed = 0.2 + num*0.01;
    player.x = COLS/2;
    player.y = ROWS/2;
    player.fuel = 100;
    grid = [];
    fuelCells = [];
    totalGrass = 0;

    CELL = Math.min(canvas.width/COLS, canvas.height/ROWS);
    offsetX = (canvas.width - CELL * COLS)/2;
    offsetY = (canvas.height - CELL * ROWS)/2;

    for(let r=0;r<ROWS;r++){
      let row=[];
      for(let c=0;c<COLS;c++){
        if(Math.random()<grassDensity){row.push(1); totalGrass++;} else row.push(0);
      }
      grid.push(row);
    }

    for(let i=0;i<fuelCount;i++){
      let r=Math.floor(Math.random()*ROWS);
      let c=Math.floor(Math.random()*COLS);
      if(grid[r][c]===1) totalGrass--;
      grid[r][c]=3;
      fuelCells.push([r,c]);
    }

    leftEl.textContent = totalGrass;
    scoreEl.textContent = player.score;
    fuelEl.textContent = Math.floor(player.fuel);
  }

  function update(dt){
    if(paused||won) return;

    let ax=0, ay=0;
    if(keys['arrowup']||keys['w']) ay=-1;
    if(keys['arrowdown']||keys['s']) ay=1;
    if(keys['arrowleft']||keys['a']) ax=-1;
    if(keys['arrowright']||keys['d']) ax=1;
    if(ax!==0&&ay!==0){ax*=0.7071; ay*=0.7071;}

    player.x+=ax*player.speed*dt;
    player.y+=ay*player.speed*dt;
    player.x=Math.max(0.5, Math.min(COLS-0.5, player.x));
    player.y=Math.max(0.5, Math.min(ROWS-0.5, player.y));
    if(ax!==0||ay!==0) player.fuel=Math.max(0, player.fuel-0.05*dt);

    const cx=Math.floor(player.x), cy=Math.floor(player.y);
    for(let r=cy-1;r<=cy+1;r++)
      for(let c=cx-1;c<=cx+1;c++)
        if(r>=0&&r<ROWS&&c>=0&&c<COLS){
          if(grid[r][c]===1){grid[r][c]=0; player.score+=10; totalGrass--;}
          if(grid[r][c]===3){grid[r][c]=0; player.fuel=Math.min(100, player.fuel+30);}
        }

    scoreEl.textContent = player.score;
    leftEl.textContent = totalGrass;
    fuelEl.textContent = Math.floor(player.fuel);

    if(player.fuel<=0) paused=true;
    if(totalGrass<=0){
      levelNum++;
      loadLevel(levelNum);
    }
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let r=0;r<ROWS;r++)
      for(let c=0;c<COLS;c++){
        const x = offsetX + c*CELL;
        const y = offsetY + r*CELL;
        if(grid[r][c]===1){ctx.fillStyle='#3aa035'; ctx.fillRect(x,y,CELL,CELL);}
        else if(grid[r][c]===0){ctx.fillStyle='#d4a373'; ctx.fillRect(x,y,CELL,CELL);}
        else if(grid[r][c]===3){ctx.drawImage(gasImg, x, y, CELL, CELL);}
      }

    const x = offsetX + player.x*CELL - CELL/2;
    const y = offsetY + player.y*CELL - CELL/2;
    ctx.drawImage(mowerImg, x, y, CELL, CELL);

    if(paused){
      ctx.fillStyle='rgba(0,0,0,0.4)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='white';
      ctx.font='36px sans-serif';
      ctx.textAlign='center';
      ctx.fillText('Out of fuel — game over',canvas.width/2,canvas.height/2);
    }
  }

  function loop(ts){
    if(!last) last=ts;
    const dt=Math.min(40,ts-last)/16.666;
    update(dt);
    draw();
    last=ts;
    requestAnimationFrame(loop);
  }

  showStartScreen('audio.mp3', 'ctp.png', () => {
    resize();
    requestAnimationFrame(loop);
  });
}
