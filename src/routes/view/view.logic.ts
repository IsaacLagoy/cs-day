// src/routes/view/view.logic.ts
import { get } from 'svelte/store';
import { GameViewController } from './controller';
import { Level } from './level';
import { GameObject } from './game_object';
import { collide, getMTV } from './physics';


// Game Rendering
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let controllerInstance: GameViewController;
let lastTime = 0;

let slide_list: Array<HTMLImageElement | null>;
let slide_1: HTMLImageElement;
let slide_2: HTMLImageElement;
let slide_3: HTMLImageElement;
let slide_4: HTMLImageElement;
let slide_5: HTMLImageElement;
let slide_6: HTMLImageElement;
let slide_7: HTMLImageElement;

let prev_level: number = -1;

let level_list: Array<Level | null>;
let level_1: Level;
let level_2: Level;
let level_3: Level;
let level_4: Level;

// Load assets
if (typeof window !== 'undefined') {
  slide_1 = new Image();
  slide_1.src = '/slide-1.png'; 
  slide_2 = new Image();
  slide_2.src = '/slide-2.png'; 
  slide_3 = new Image();
  slide_3.src = '/slide-3.png'; 
  slide_4 = new Image();
  slide_4.src = '/slide-4.png'; 
  slide_5 = new Image();
  slide_5.src = '/slide-5.png'; 
  slide_6 = new Image();
  slide_6.src = '/slide-6.png'; 
  slide_7 = new Image();
  slide_7.src = '/slide-7.png'; 

  slide_list = [slide_1, slide_2, slide_3, slide_4, slide_5, slide_6, slide_7, null];


  level_1 = new Level();
  let level_1_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#dfdfdfff");
  level_1.add(level_1_floor);

  level_2 = new Level();
  let level_2_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#dfdfdfff");
  let level_2_goal = new GameObject({x: 7, y: -4.5}, {x: 4, y: 1}, "#72e56cff");
  level_2.add(level_2_floor);
  level_2.add(level_2_goal);

  level_3 = new Level();
  let level_3_floor_left = new GameObject({x: -6, y: -5}, {x: 8, y: 2}, "#dfdfdfff");
  let level_3_floor_right = new GameObject({x: 6, y: -5}, {x: 8, y: 2}, "#dfdfdfff");
  let level_3_goal = new GameObject({x: 7, y: -4.5}, {x: 4, y: 1}, "#72e56cff");
  level_3.add(level_3_floor_left);
  level_3.add(level_3_floor_right);
  level_3.add(level_3_goal);

  level_list = [level_1, level_2, level_3, null];
}


// Initialize the canvas and start the game loop
export function init(c: HTMLCanvasElement, controller: GameViewController) {
  if (typeof window === 'undefined') return;

  canvas = c;
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  controllerInstance = controller;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function resizeCanvas() {
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);

  requestAnimationFrame(loop);
}

// Update player positions based on inputs
function update(deltaTime: number) {
  const currentPlayers = get(controllerInstance.players);

  const gameState = get(controllerInstance.gameState);
  let level = gameState.level;
  console.log(`${prev_level}, ${level}`);
  const levelChange = prev_level != level;
  prev_level = level;

  Object.values(currentPlayers).forEach(player => {
    player.update(deltaTime)

    const gameState = get(controllerInstance.gameState);
    let level = gameState.level;

    if (level_list[level] == null) {
        return;
    }

    if (levelChange) {
        player.respawn();
    }

    level_list[level].update();

    // collision
    player.canJump = false;
    Object.values(level_list[level]?.objects).forEach(obj => {
        if (collide(player.collider, obj.collider)) {
            const mtv = getMTV(player.collider, obj.collider, player.vel);
            player.position.x += mtv.x;
            player.position.y += mtv.y;

            if (mtv.x === 0) {
                player.canJump = true;
            }
        }
    });
  });
}

// Draw all players
function draw() {
  // Clear the screen
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gameState = get(controllerInstance.gameState);
  let slide = gameState.slide;
  let level = gameState.level;

  if (slide_list[slide]) drawBackground(slide_list[slide]);
  if (level_list[level]) level_list[level].draw(ctx, canvas.width, canvas.height);

  const currentPlayers = get(controllerInstance.players);

  Object.values(currentPlayers).forEach(player => {
    player.draw(ctx, canvas.width, canvas.height);
  });
}

function drawBackground(image: HTMLImageElement) {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const imageAspect = 2560 / 1440;
  const canvasAspect = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (canvasAspect > imageAspect) {
    // Canvas is wider than image → height matches, width scaled
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imageAspect;
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Canvas is taller → width matches, height scaled
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imageAspect;
    offsetX = 0;
    offsetY = (canvasHeight - drawHeight) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

const level = new Level();
const object = new GameObject({x: 0, y: 2});
level.add(object);

// Main loop
function loop(time: number) {
  const deltaTime = (time - lastTime) * 0.001;
  lastTime = time;

  update(deltaTime);
  draw();

  requestAnimationFrame(loop);
}
