const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const gameShell = document.querySelector(".game-shell");

const startOverlay = document.getElementById("startOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");

const startTitle = document.getElementById("startTitle");
const startSubtitle = document.getElementById("startSubtitle");
const pauseSubtitle = document.getElementById("pauseSubtitle");
const hintText = document.getElementById("hintText");

const restartBtn = document.getElementById("restartBtn");
const soundToggle = document.getElementById("soundToggle");
const motionToggle = document.getElementById("motionToggle");

const mobileQuery = window.matchMedia(
  "(max-width: 640px), (pointer: coarse)"
);


/* =========================================================
   GAME STATE
========================================================= */

const state = {
  started: false,
  running: false,
  paused: false,
  gameOver: false,

  score: 0,
  highScore: 0,

  speed: 420,
  baseSpeed: 420,

  spawnTimer: 0,
  nextSpawn: 1.1,

  obstacles: [],

  day: true,
  dayTimer: 0,
  dayBlend: 1,

  groundOffset: 0,

  reducedMotion: false,
  soundEnabled: true,

  allowPause: true
};


/* =========================================================
   CONFIG
========================================================= */

const config = {
  gravity: 2000,

  jumpVelocity: -700,

  minJumpVelocity: -280,

  maxJumpHold: 0.18,

  jumpHoldGravity: 0.45,

  groundPadding: 26,

  minSpawn: 0.85,

  maxSpawn: 1.6,

  birdHeight: 54
};


/* =========================================================
   PLAYER
========================================================= */

const player = {
  x: 80,

  y: 0,

  w: 50,

  h: 50,

  vy: 0,

  ducking: false,

  onGround: true,

  jumpHeld: false,

  jumpHoldTime: 0,

  animationFrame: 0,

  animationTimer: 0
};


/* =========================================================
   VIEW
========================================================= */

let view = {
  width: 0,

  height: 0,

  groundY: 0,

  dpr: 1
};


/* =========================================================
   AUDIO
========================================================= */

let audioCtx = null;


/* =========================================================
   TIME / INPUT
========================================================= */

let lastTime = 0;

let pointerStart = null;

let touchStart = null;


/* =========================================================
   GOOGLE CHROME STYLE DINO SPRITES
   RIGHT-FACING DINO
=========================================================

   run1 = LEFT LEG FORWARD
   run2 = RIGHT LEG FORWARD

   1 = pixel
   0 = transparent

========================================================= */

const DINO_SPRITES = {

  /* =======================================================
     RUN 1
     LEFT LEG FORWARD
  ======================================================= */

  run1: [
    "000000000000000000111110000",
    "000000000000000000111111000",
    "000000000000000000111111100",
    "000000000000000000101111110",
    "000000000000000000111111111",
    "000000000000000000111111110",
    "000000000000000000111111100",
    "000000000000000000111111000",
    "000000000000000000111110000",
    "000000000000000001111100000",
    "000000000000000011111100000",
    "000000000000001111111111110",
    "000000000000111111111100000",
    "000000000001111111111111100",
    "000110000011111111111100000",
    "001100000111111111111100000",
    "001111001111111111111100000",
    "001111111111111111111000000",
    "000111111111111111111000000",
    "000001111111111111111100000",
    "000000011111111111111110000",
    "000000000111111001111110000",
    "000000000011111000111100000",
    "000000000011000000110000000",
    "000000000011100000000000000"
  ],


  /* =======================================================
     RUN 2
     RIGHT LEG FORWARD
  ======================================================= */

  run2: [
    "000000000000000000111110000",
    "000000000000000000111111000",
    "000000000000000000111111100",
    "000000000000000000111111110",
    "000000000000000000111111111",
    "000000000000000000111111110",
    "000000000000000000111111100",
    "000000000000000000111111000",
    "000000000000000000111110000",
    "000000000000000001111100000",
    "000000000000000011111100000",
    "000000000000001111111111100",
    "000000000000111111111100000",
    "000000000001111111111111110",
    "000000000011111111111100000",
    "000000000111111111111100000",
    "000000001111111111111100000",
    "000000011111111111111000000",
    "000000111111111111111000000",
    "000001111111111111111100000",
    "000011111111111111111110000",
    "000111100111111001111110000",
    "001110000011111000111100000",
    "011000000001100000110000000",
    "000000000000000000111000000"
  ],


  /* =======================================================
     JUMP
  ======================================================= */

  jump: [
    "000000000000000000111110000",
    "000000000000000000111111000",
    "000000000000000000111111100",
    "000000000000000000101111110",
    "000000000000000000111111111",
    "000000000000000000111111110",
    "000000000000000000111111100",
    "000000000000000000111111000",
    "000000000000000000111110000",
    "000000000000000001111100000",
    "000000000000000011111100000",
    "000000000000001111111111110",
    "000000000000111111111100000",
    "000000000001111111111111100",
    "000110000011111111111100000",
    "001100000111111111111100000",
    "001111001111111111111100000",
    "001111111111111111111000000",
    "000111111111111111110000000",
    "000001111111111111111000000",
    "000000011111111111111100000",
    "000000000111111001111100000",
    "000000000011111000111100000",
    "000000000011000000110000000",
    "000000000011110000000000000"
  ]

};


/* =========================================================
   INITIALIZATION
========================================================= */

function init() {

  state.highScore = Number(
    localStorage.getItem("runnerHighScore") || 0
  );

  highscoreEl.textContent =
    `HI ${state.highScore}`;


  state.reducedMotion =
    localStorage.getItem("runnerReducedMotion") === "1" ||
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  motionToggle.checked =
    state.reducedMotion;


  const soundPref =
    localStorage.getItem(
      "runnerSoundEnabled"
    );


  state.soundEnabled =
    soundPref === null
      ? true
      : soundPref === "1";


  soundToggle.checked =
    state.soundEnabled;


  resizeCanvas();

  applyLayoutMode();

  resetGame();

  requestAnimationFrame(loop);
}


/* =========================================================
   RESIZE CANVAS
========================================================= */

function resizeCanvas() {

  const rect =
    canvas.getBoundingClientRect();

  const dpr =
    window.devicePixelRatio || 1;


  canvas.width =
    Math.floor(rect.width * dpr);

  canvas.height =
    Math.floor(rect.height * dpr);


  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );


  ctx.imageSmoothingEnabled = false;


  view = {

    width: rect.width,

    height: rect.height,

    groundY:
      rect.height -
      config.groundPadding,

    dpr
  };


  player.y =
    view.groundY -
    player.h;
}


/* =========================================================
   RESET GAME
========================================================= */

function resetGame() {

  state.started = false;

  state.running = false;

  state.gameOver = false;

  state.paused = false;

  state.score = 0;

  state.speed =
    state.baseSpeed;

  state.spawnTimer = 0;

  state.nextSpawn = 1.1;

  state.obstacles = [];

  state.day = true;

  state.dayTimer = 0;

  state.dayBlend = 1;

  state.groundOffset = 0;


  player.vy = 0;

  player.ducking = false;

  player.onGround = true;

  player.jumpHeld = false;

  player.jumpHoldTime = 0;

  player.animationFrame = 0;

  player.animationTimer = 0;

  player.w = 50;

  player.h = 50;

  player.y =
    view.groundY -
    player.h;


  updateHud();

  updateOverlays();
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

  if (state.gameOver) {
    resetGame();
  }

  state.started = true;

  state.running = true;

  state.paused = false;

  updateOverlays();
}


/* =========================================================
   PAUSE
========================================================= */

function pauseGame() {

  if (
    !state.allowPause ||
    !state.started ||
    state.gameOver
  ) {
    return;
  }

  state.paused =
    !state.paused;

  updateOverlays();
}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

  state.running = false;

  state.gameOver = true;

  state.paused = false;


  if (
    state.score >
    state.highScore
  ) {

    state.highScore =
      Math.floor(state.score);

    localStorage.setItem(
      "runnerHighScore",
      state.highScore
    );
  }


  updateHud();

  updateOverlays();

  playSound("hit");
}


/* =========================================================
   HUD
========================================================= */

function updateHud() {

  scoreEl.textContent =
    Math.floor(state.score);

  highscoreEl.textContent =
    `HI ${state.highScore}`;
}


/* =========================================================
   OVERLAYS
========================================================= */

function updateOverlays() {

  startOverlay.classList.toggle(
    "hidden",
    state.started
  );

  pauseOverlay.classList.toggle(
    "hidden",
    !state.paused ||
    !state.allowPause
  );

  gameOverOverlay.classList.toggle(
    "hidden",
    !state.gameOver
  );
}


/* =========================================================
   MAIN LOOP
========================================================= */

function loop(timestamp) {

  if (!lastTime) {
    lastTime = timestamp;
  }


  const dt =
    Math.min(
      0.033,
      (timestamp - lastTime) / 1000
    );


  lastTime = timestamp;


  if (
    state.running &&
    !state.paused
  ) {

    update(dt);
  }


  render();

  requestAnimationFrame(loop);
}


/* =========================================================
   UPDATE
========================================================= */

function update(dt) {

  state.score +=
    dt * 10;


  /* -------------------------------------------------------
     Increase speed
  ------------------------------------------------------- */

  state.speed =
    state.baseSpeed +
    state.score * 2.2;


  /* -------------------------------------------------------
     Redirect at score 400
  ------------------------------------------------------- */

  if (state.score >= 400) {

    state.score = 400;

    state.running = false;

    updateHud();


    setTimeout(() => {

      window.location.href =
        "portfolio.html";

    }, 500);

    return;
  }


  /* -------------------------------------------------------
     Spawn obstacles
  ------------------------------------------------------- */

  state.spawnTimer += dt;


  const spawnWindow =
    Math.max(
      0.55,
      1 - state.score / 1200
    );


  if (
    state.spawnTimer >=
    state.nextSpawn * spawnWindow
  ) {

    spawnObstacle();

    state.spawnTimer = 0;

    state.nextSpawn =
      randRange(
        config.minSpawn,
        config.maxSpawn
      );
  }


  updatePlayer(dt);

  updateObstacles(dt);

  updateDayNight(dt);


  if (checkCollision()) {
    endGame();
  }


  updateHud();
}


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer(dt) {

  let gravityScale = 1;


  /* -------------------------------------------------------
     Hold jump
  ------------------------------------------------------- */

  if (
    player.jumpHeld &&
    player.vy < 0 &&
    player.jumpHoldTime <
    config.maxJumpHold
  ) {

    gravityScale =
      config.jumpHoldGravity;

    player.jumpHoldTime += dt;
  }


  /* -------------------------------------------------------
     Gravity
  ------------------------------------------------------- */

  player.vy +=
    config.gravity *
    gravityScale *
    dt;

  player.y +=
    player.vy * dt;


  /* -------------------------------------------------------
     Ground collision
  ------------------------------------------------------- */

  if (
    player.y >=
    view.groundY -
    player.h
  ) {

    player.y =
      view.groundY -
      player.h;

    player.vy = 0;

    player.onGround = true;

    player.jumpHeld = false;

    player.jumpHoldTime = 0;

  } else {

    player.onGround = false;
  }


  /* -------------------------------------------------------
     Duck
  ------------------------------------------------------- */

  if (
    player.ducking &&
    player.onGround
  ) {

    player.h = 36;

    player.w = 52;

    player.y =
      view.groundY -
      player.h;
  }


  /* -------------------------------------------------------
     Normal
  ------------------------------------------------------- */

  else {

    player.h = 50;

    player.w = 50;

    if (player.onGround) {

      player.y =
        view.groundY -
        player.h;
    }
  }


  /* -------------------------------------------------------
     RUNNING ANIMATION
     
     0.08 seconds:
     
     LEFT LEG
        ↓
     RIGHT LEG
        ↓
     LEFT LEG
        ↓
     RIGHT LEG
  ------------------------------------------------------- */

  if (
    player.onGround &&
    state.running &&
    !state.reducedMotion
  ) {

    player.animationTimer += dt;


    if (
      player.animationTimer >=
      0.08
    ) {

      player.animationTimer = 0;

      player.animationFrame =
        player.animationFrame === 0
          ? 1
          : 0;
    }
  }
}


/* =========================================================
   OBSTACLE UPDATE
========================================================= */

function updateObstacles(dt) {

  const speed =
    state.speed;


  for (
    const obstacle of state.obstacles
  ) {

    obstacle.x -=
      speed * dt;


    /* -----------------------------------------------------
       Bird animation
    ----------------------------------------------------- */

    if (
      obstacle.type === "bird" &&
      !state.reducedMotion
    ) {

      obstacle.wingTimer += dt;


      if (
        obstacle.wingTimer >
        0.15
      ) {

        obstacle.wingTimer = 0;

        obstacle.wingUp =
          !obstacle.wingUp;
      }
    }
  }


  state.obstacles =
    state.obstacles.filter(
      (obs) =>
        obs.x + obs.w > -20
    );


  /* -------------------------------------------------------
     Ground animation
  ------------------------------------------------------- */

  if (!state.reducedMotion) {

    state.groundOffset +=
      speed * dt * 0.6;
  }
}


/* =========================================================
   DAY / NIGHT
========================================================= */

function updateDayNight(dt) {

  state.dayTimer += dt;


  if (state.dayTimer > 18) {

    state.dayTimer = 0;

    state.day =
      !state.day;
  }


  if (state.reducedMotion) {

    state.dayBlend =
      state.day ? 1 : 0;

    return;
  }


  const target =
    state.day ? 1 : 0;

  const rate = 0.25;


  state.dayBlend +=
    (target -
      state.dayBlend) *
    rate *
    dt *
    10;
}


/* =========================================================
   SPAWN OBSTACLE
========================================================= */

function spawnObstacle() {

  const allowBirds =
    state.score > 120;


  const spawnBird =
    allowBirds &&
    Math.random() > 0.6;


  let obstacle;


  /* -------------------------------------------------------
     BIRD
  ------------------------------------------------------- */

  if (spawnBird) {

    obstacle = {

      type: "bird",

      x:
        view.width + 40,

      y:
        view.groundY -
        config.birdHeight,

      w: 38,

      h: 24,

      wingUp: true,

      wingTimer: 0
    };
  }


  /* -------------------------------------------------------
     CACTUS
  ------------------------------------------------------- */

  else {

    const tall =
      Math.random() > 0.55;


    obstacle = {

      type: "cactus",

      x:
        view.width + 40,

      y:
        view.groundY -
        (tall ? 52 : 36),

      w:
        tall ? 30 : 22,

      h:
        tall ? 52 : 36
    };
  }


  /* -------------------------------------------------------
     Keep distance
  ------------------------------------------------------- */

  const last =
    state.obstacles[
    state.obstacles.length - 1
    ];


  if (last) {

    const minGap =
      140 +
      state.speed * 0.18;


    obstacle.x =
      Math.max(
        obstacle.x,

        last.x +
        last.w +
        minGap
      );
  }


  state.obstacles.push(
    obstacle
  );
}


/* =========================================================
   COLLISION
========================================================= */

function checkCollision() {

  const playerBox =
    getHitbox({

      x: player.x,

      y: player.y,

      w: player.w,

      h: player.h
    });


  return state.obstacles.some(
    (obs) => {

      const obsBox =
        getHitbox({

          x: obs.x,

          y: obs.y,

          w: obs.w,

          h: obs.h
        });


      return (

        playerBox.x <
        obsBox.x +
        obsBox.w &&

        playerBox.x +
        playerBox.w >
        obsBox.x &&

        playerBox.y <
        obsBox.y +
        obsBox.h &&

        playerBox.y +
        playerBox.h >
        obsBox.y
      );
    }
  );
}


/* =========================================================
   RENDER
========================================================= */

function render() {

  ctx.clearRect(
    0,
    0,
    view.width,
    view.height
  );


  /* -------------------------------------------------------
     Background
  ------------------------------------------------------- */

  const sky =
    lerpColor(
      "#f7f7f7",
      "#101012",
      1 - state.dayBlend
    );


  ctx.fillStyle = sky;


  ctx.fillRect(
    0,
    0,
    view.width,
    view.height
  );


  drawSunMoon();

  drawClouds();

  drawGround();

  drawPlayer();

  drawObstacles();
}


/* =========================================================
   SUN / MOON
========================================================= */

function drawSunMoon() {

  const x =
    view.width - 80;

  const y = 60;


  ctx.save();


  ctx.globalAlpha =
    0.4 +
    0.3 *
    state.dayBlend;


  ctx.fillStyle =
    state.day
      ? "#f3e8b8"
      : "#b0b5c4";


  ctx.beginPath();


  ctx.arc(
    x,
    y,
    18,
    0,
    Math.PI * 2
  );


  ctx.fill();

  ctx.restore();
}


/* =========================================================
   CLOUDS
========================================================= */

function drawClouds() {

  if (state.reducedMotion) {
    return;
  }


  ctx.save();


  ctx.fillStyle =
    state.day
      ? "rgba(83,83,83,0.12)"
      : "rgba(230,230,230,0.08)";


  const positions = [

    {
      x:
        view.width * 0.18 -
        state.groundOffset * 0.05,

      y: 50
    },

    {
      x:
        view.width * 0.58 -
        state.groundOffset * 0.035,

      y: 95
    }
  ];


  positions.forEach(
    (cloud) => {

      let x =
        cloud.x %
        (view.width + 140);


      if (x < -100) {

        x +=
          view.width + 140;
      }


      drawCloud(
        x,
        cloud.y
      );
    }
  );


  ctx.restore();
}


/* =========================================================
   CLOUD
========================================================= */

function drawCloud(x, y) {

  ctx.fillRect(
    x,
    y + 8,
    45,
    5
  );


  ctx.fillRect(
    x + 9,
    y + 4,
    18,
    9
  );


  ctx.fillRect(
    x + 21,
    y,
    20,
    13
  );
}


/* =========================================================
   GROUND
========================================================= */

function drawGround() {

  ctx.strokeStyle =
    state.day
      ? "#535353"
      : "#e6e6e6";


  ctx.lineWidth = 2;


  ctx.beginPath();


  ctx.moveTo(
    0,
    view.groundY + 1
  );


  ctx.lineTo(
    view.width,
    view.groundY + 1
  );


  ctx.stroke();


  const tickSpacing = 26;


  const offset =
    state.reducedMotion
      ? 0
      : state.groundOffset %
      tickSpacing;


  for (
    let x = -offset;
    x < view.width;
    x += tickSpacing
  ) {

    ctx.beginPath();


    ctx.moveTo(
      x,
      view.groundY + 1
    );


    ctx.lineTo(
      x + 10,
      view.groundY + 1
    );


    ctx.stroke();
  }
}


/* =========================================================
   PIXEL SPRITE DRAWER
========================================================= */

function drawPixelSprite(
  sprite,
  x,
  y,
  pixelSize
) {

  sprite.forEach(
    (row, rowIndex) => {

      for (
        let columnIndex = 0;
        columnIndex < row.length;
        columnIndex++
      ) {

        if (
          row[columnIndex] !== "1"
        ) {
          continue;
        }


        ctx.fillRect(

          Math.floor(
            x +
            columnIndex *
            pixelSize
          ),

          Math.floor(
            y +
            rowIndex *
            pixelSize
          ),

          pixelSize,

          pixelSize
        );
      }
    }
  );
}


/* =========================================================
   PLAYER / DINO
========================================================= */

function drawPlayer() {

  ctx.save();


  const dinoColor =
    state.day
      ? "#535353"
      : "#e6e6e6";


  ctx.fillStyle =
    dinoColor;


  const x =
    Math.floor(player.x);

  const y =
    Math.floor(player.y);


  const pixelSize = 2;


  let sprite;


  /* -------------------------------------------------------
     DUCK
  ------------------------------------------------------- */

  if (player.ducking) {

    sprite =
      DINO_SPRITES.duck;
  }


  /* -------------------------------------------------------
     JUMP
  ------------------------------------------------------- */

  else if (!player.onGround) {

    sprite =
      DINO_SPRITES.jump;
  }


  /* -------------------------------------------------------
     RUNNING
  ------------------------------------------------------- */

  else if (
    state.running &&
    !state.reducedMotion
  ) {

    sprite =
      player.animationFrame === 0
        ? DINO_SPRITES.run1
        : DINO_SPRITES.run2;
  }


  /* -------------------------------------------------------
     STANDING
  ------------------------------------------------------- */

  else {

    sprite =
      DINO_SPRITES.run1;
  }


  /* -------------------------------------------------------
     Draw dinosaur
  ------------------------------------------------------- */

  drawPixelSprite(
    sprite,
    x,
    y,
    pixelSize
  );


  ctx.restore();
}


/* =========================================================
   OBSTACLES
========================================================= */

function drawObstacles() {

  for (
    const obs of state.obstacles
  ) {

    if (
      obs.type === "cactus"
    ) {

      drawCactus(obs);

    } else {

      drawBird(obs);
    }
  }
}


/* =========================================================
   PIXEL CACTUS
========================================================= */

function drawCactus(obs) {

  const x =
    Math.floor(obs.x);


  const y =
    Math.floor(obs.y);


  ctx.fillStyle =
    state.day
      ? "#535353"
      : "#e6e6e6";


  const pixel = 4;


  /* Main trunk */

  ctx.fillRect(
    x +
    Math.floor(
      obs.w * 0.3
    ),

    y,

    Math.floor(
      obs.w * 0.4
    ),

    obs.h
  );


  /* Left arm */

  if (obs.h > 40) {

    ctx.fillRect(

      x,

      y +
      Math.floor(
        obs.h * 0.38
      ),

      Math.floor(
        obs.w * 0.35
      ),

      pixel
    );


    ctx.fillRect(

      x,

      y +
      Math.floor(
        obs.h * 0.38
      ) -
      16,

      pixel,

      20
    );
  }


  /* Right arm */

  ctx.fillRect(

    x +
    Math.floor(
      obs.w * 0.65
    ),

    y +
    Math.floor(
      obs.h * 0.52
    ),

    Math.floor(
      obs.w * 0.35
    ),

    pixel
  );


  ctx.fillRect(

    x +
    obs.w -
    pixel,

    y +
    Math.floor(
      obs.h * 0.35
    ),

    pixel,

    22
  );


  /* Top pixel */

  ctx.fillRect(

    x +
    Math.floor(
      obs.w * 0.3
    ),

    y - 4,

    pixel,

    6
  );
}


/* =========================================================
   PIXEL BIRD
========================================================= */

function drawBird(obs) {

  const x =
    Math.floor(obs.x);


  const y =
    Math.floor(obs.y);


  ctx.fillStyle =
    state.day
      ? "#535353"
      : "#e6e6e6";


  /* Body */

  ctx.fillRect(
    x + 7,
    y + 7,
    22,
    10
  );


  /* Head */

  ctx.fillRect(
    x + 23,
    y + 3,
    9,
    11
  );


  /* Beak */

  ctx.fillRect(
    x + 31,
    y + 8,
    7,
    4
  );


  /* Tail */

  ctx.fillRect(
    x,
    y + 5,
    9,
    5
  );


  /* Wing */

  if (obs.wingUp) {

    ctx.fillRect(
      x + 8,
      y - 4,
      15,
      6
    );

  } else {

    ctx.fillRect(
      x + 8,
      y + 16,
      15,
      6
    );
  }


  /* Eye */

  ctx.fillStyle =
    state.day
      ? "#f7f7f7"
      : "#111";


  ctx.fillRect(
    x + 27,
    y + 5,
    2,
    2
  );
}


/* =========================================================
   JUMP
========================================================= */

function jump() {

  if (!state.running) {
    startGame();
  }


  if (player.onGround) {

    player.vy =
      config.jumpVelocity;

    player.jumpHeld = true;

    player.jumpHoldTime = 0;

    playSound("jump");
  }
}


/* =========================================================
   RELEASE JUMP
========================================================= */

function releaseJump() {

  player.jumpHeld = false;


  if (player.vy < 0) {

    player.vy =
      Math.max(
        player.vy,
        config.minJumpVelocity
      );
  }
}


/* =========================================================
   DUCK
========================================================= */

function duck(isDown) {

  if (!state.running) {
    return;
  }


  player.ducking =
    isDown;
}


/* =========================================================
   KEY DOWN
========================================================= */

function handleKeyDown(event) {

  const {
    code,
    key
  } = event;


  if (
    [
      "Space",
      "ArrowUp",
      "ArrowDown"
    ].includes(code)
  ) {

    event.preventDefault();
  }


  /* Jump */

  if (
    code === "Space" ||
    code === "ArrowUp"
  ) {

    if (state.gameOver) {

      resetGame();

      startGame();

      return;
    }


    jump();
  }


  /* Duck */

  else if (
    code === "ArrowDown"
  ) {

    duck(true);
  }


  /* Pause */

  else if (
    key.toLowerCase() === "p" &&
    state.allowPause
  ) {

    pauseGame();
  }


  /* Restart */

  else if (
    key.toLowerCase() === "r" &&
    state.gameOver
  ) {

    resetGame();

    startGame();
  }
}


/* =========================================================
   KEY UP
========================================================= */

function handleKeyUp(event) {

  if (
    event.code === "ArrowDown"
  ) {

    duck(false);
  }


  if (
    event.code === "Space" ||
    event.code === "ArrowUp"
  ) {

    releaseJump();
  }
}


/* =========================================================
   POINTER DOWN
========================================================= */

function handlePointerDown(event) {

  pointerStart = {

    y: event.clientY,

    time: performance.now()
  };


  if (
    !state.started ||
    state.running
  ) {

    jump();
  }
}


/* =========================================================
   POINTER MOVE
========================================================= */

function handlePointerMove(event) {

  if (
    !pointerStart ||
    !state.running
  ) {

    return;
  }


  const deltaY =
    event.clientY -
    pointerStart.y;


  if (deltaY > 40) {

    duck(true);
  }
}


/* =========================================================
   POINTER UP
========================================================= */

function handlePointerUp(event) {

  if (!pointerStart) {
    return;
  }


  const deltaY =
    event.clientY -
    pointerStart.y;


  if (
    state.gameOver &&
    deltaY <= 40
  ) {

    resetGame();

    startGame();
  }


  releaseJump();

  duck(false);

  pointerStart = null;
}


/* =========================================================
   TOUCH START
========================================================= */

function handleTouchStart(event) {

  if (
    event.touches.length > 1
  ) {

    return;
  }


  const touch =
    event.touches[0];


  touchStart = {

    y: touch.clientY,

    time: performance.now()
  };


  if (
    !state.started ||
    state.running
  ) {

    jump();
  }


  event.preventDefault();
}


/* =========================================================
   TOUCH MOVE
========================================================= */

function handleTouchMove(event) {

  if (
    !touchStart ||
    event.touches.length > 1 ||
    !state.running
  ) {

    return;
  }


  const touch =
    event.touches[0];


  const deltaY =
    touch.clientY -
    touchStart.y;


  if (deltaY > 40) {

    duck(true);
  }


  event.preventDefault();
}


/* =========================================================
   TOUCH END
========================================================= */

function handleTouchEnd(event) {

  if (!touchStart) {
    return;
  }


  const touch =
    event.changedTouches[0];


  const deltaY =
    touch
      ? touch.clientY -
      touchStart.y
      : 0;


  if (
    state.gameOver &&
    deltaY <= 40
  ) {

    resetGame();

    startGame();
  }


  releaseJump();

  duck(false);

  touchStart = null;

  event.preventDefault();
}


/* =========================================================
   RESPONSIVE LAYOUT
========================================================= */

function applyLayoutMode() {

  const isMobile =
    mobileQuery.matches;


  state.allowPause =
    !isMobile;


  if (isMobile) {

    startTitle.textContent =
      "Tap to start";

    startSubtitle.textContent =
      "Tap to jump, swipe down to duck";

    hintText.textContent =
      "Tap to jump. Swipe down to duck.";

  } else {

    startTitle.textContent =
      "Press Space or Tap to start";

    startSubtitle.textContent =
      "ArrowUp/Space = jump, ArrowDown = duck, P = pause";

    hintText.textContent =
      "Space/Up = jump. Down = duck. P = pause.";
  }


  if (
    !state.allowPause &&
    state.paused
  ) {

    state.paused = false;
  }


  pauseSubtitle.textContent =
    "Press P to resume";


  updateOverlays();
}


/* =========================================================
   SOUND
========================================================= */

function playSound(type) {

  if (!state.soundEnabled) {
    return;
  }


  if (!audioCtx) {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;


    if (!AudioContext) {
      return;
    }


    audioCtx =
      new AudioContext();
  }


  const oscillator =
    audioCtx.createOscillator();


  const gain =
    audioCtx.createGain();


  const now =
    audioCtx.currentTime;


  oscillator.type =
    "square";


  if (type === "hit") {

    oscillator.frequency.value =
      160;

  } else {

    oscillator.frequency.value =
      440;
  }


  gain.gain.setValueAtTime(
    0.0001,
    now
  );


  gain.gain.exponentialRampToValueAtTime(
    0.06,
    now + 0.02
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.2
  );


  oscillator.connect(gain);

  gain.connect(
    audioCtx.destination
  );


  oscillator.start(now);


  oscillator.stop(
    now + 0.22
  );
}


/* =========================================================
   HITBOX
========================================================= */

function getHitbox(rect) {

  return {

    x:
      rect.x + 4,

    y:
      rect.y + 4,

    w:
      Math.max(
        1,
        rect.w - 8
      ),

    h:
      Math.max(
        1,
        rect.h - 8
      )
  };
}


/* =========================================================
   COLOR
========================================================= */

function lerpColor(
  a,
  b,
  amount
) {

  const ah =
    Number.parseInt(
      a.replace("#", ""),
      16
    );


  const ar =
    (ah >> 16) & 255;

  const ag =
    (ah >> 8) & 255;

  const ab =
    ah & 255;


  const bh =
    Number.parseInt(
      b.replace("#", ""),
      16
    );


  const br =
    (bh >> 16) & 255;

  const bg =
    (bh >> 8) & 255;

  const bb =
    bh & 255;


  const rr =
    Math.round(
      ar +
      amount *
      (br - ar)
    );


  const rg =
    Math.round(
      ag +
      amount *
      (bg - ag)
    );


  const rb =
    Math.round(
      ab +
      amount *
      (bb - ab)
    );


  return `rgb(${rr}, ${rg}, ${rb})`;
}


/* =========================================================
   RANDOM
========================================================= */

function randRange(
  min,
  max
) {

  return (
    Math.random() *
    (max - min) +
    min
  );
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

restartBtn.addEventListener(
  "click",
  () => {

    resetGame();

    startGame();
  }
);


/* =========================================================
   SOUND TOGGLE
========================================================= */

soundToggle.addEventListener(
  "change",
  (event) => {

    state.soundEnabled =
      event.target.checked;


    localStorage.setItem(
      "runnerSoundEnabled",

      state.soundEnabled
        ? "1"
        : "0"
    );
  }
);


/* =========================================================
   MOTION TOGGLE
========================================================= */

motionToggle.addEventListener(
  "change",
  (event) => {

    state.reducedMotion =
      event.target.checked;


    localStorage.setItem(
      "runnerReducedMotion",

      state.reducedMotion
        ? "1"
        : "0"
    );
  }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  resizeCanvas
);


/* =========================================================
   MOBILE QUERY
========================================================= */

if (
  mobileQuery.addEventListener
) {

  mobileQuery.addEventListener(
    "change",
    applyLayoutMode
  );

} else if (
  mobileQuery.addListener
) {

  mobileQuery.addListener(
    applyLayoutMode
  );
}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
  "keydown",
  handleKeyDown,
  {
    passive: false
  }
);


window.addEventListener(
  "keyup",
  handleKeyUp
);


/* =========================================================
   POINTER + TOUCH
========================================================= */

[
  canvas,
  gameShell,
  startOverlay,
  gameOverOverlay
].forEach((target) => {

  if (!target) {
    return;
  }


  target.addEventListener(
    "pointerdown",
    handlePointerDown
  );


  target.addEventListener(
    "pointermove",
    handlePointerMove
  );


  target.addEventListener(
    "pointerup",
    handlePointerUp
  );


  target.addEventListener(
    "pointercancel",
    handlePointerUp
  );


  target.addEventListener(
    "touchstart",
    handleTouchStart,
    {
      passive: false
    }
  );


  target.addEventListener(
    "touchmove",
    handleTouchMove,
    {
      passive: false
    }
  );


  target.addEventListener(
    "touchend",
    handleTouchEnd,
    {
      passive: false
    }
  );


  target.addEventListener(
    "touchcancel",
    handleTouchEnd,
    {
      passive: false
    }
  );
});


/* =========================================================
   START
========================================================= */

init();
