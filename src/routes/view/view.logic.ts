// src/routes/view/view.logic.ts
import { get } from 'svelte/store';
import { GameViewController } from './controller';
import { Level } from './level';
import { GameObject } from './game_object';
import { collide, getMTV } from './physics';
import { MovingPlatform } from './moving_platform';
import { Coin } from './coin';

interface Scene {
    level: Level | null;
    slide: HTMLImageElement | null;
    mode: String;
}

// Game Rendering
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let controllerInstance: GameViewController;
let lastTime = 0;

let slide_list: Array<HTMLImageElement | null>;
let QR: HTMLImageElement;
let slide_1: HTMLImageElement;
let slide_2: HTMLImageElement;
let slide_3: HTMLImageElement;
let slide_4: HTMLImageElement;
let slide_5: HTMLImageElement;
let slide_6: HTMLImageElement;
let slide_7: HTMLImageElement;
let slide_8: HTMLImageElement;
let slide_9: HTMLImageElement;
let slide_10: HTMLImageElement;
let slide_11: HTMLImageElement;
let bg_1: HTMLImageElement;
let bg_2: HTMLImageElement;
let bg_3: HTMLImageElement;

let prev_level: Level | null;

let level_list: Array<Level | null>;
let test_level: Level;
let level_1: Level;
let level_2: Level;
let level_3: Level;
let level_4: Level;
let level_5: Level;
let level_6: Level;
let level_7: Level;
let level_8: Level;
let level_9: Level;
let level_10: Level;
let level_11: Level;
let level_12: Level;

let scene_list: Scene[];

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
  slide_8 = new Image();
  slide_8.src = '/slide-8.png'; 
  slide_9 = new Image();
  slide_9.src = '/slide-9.png'; 
  slide_10 = new Image();
  slide_10.src = '/slide-10.png'; 
  slide_11 = new Image();
  slide_11.src = '/slide-11.png'; 

  bg_1 = new Image();
  bg_1.src = '/bg-1.png'; 
  bg_2 = new Image();
  bg_2.src = '/bg-2.png'; 
  bg_3 = new Image();
  bg_3.src = '/bg-3.png'; 
  QR = new Image();
  QR.src = '/QR.png'; 

  
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
  let level_3_coin = new Coin({x: 0, y: 0});
  level_3.add(level_3_floor_left);
  level_3.add(level_3_floor_right);
  level_3.add(level_3_goal);
  level_3.add(level_3_coin);
  
  level_4 = new Level();
  let level_4_floor_left = new GameObject({x: -7, y: -5}, {x: 6, y: 2}, "#dfdfdfff");
  let level_4_floor_mid = new GameObject({x: 0, y: -4}, {x: 2, y: 4}, "#dfdfdfff");
  let level_4_floor_right = new GameObject({x: 7, y: -3}, {x: 6, y: 6}, "#dfdfdfff");
  let level_4_goal = new GameObject({x: 7, y: -0.5}, {x: 4, y: 1}, "#72e56cff");
  level_4.add(level_4_floor_left);
  level_4.add(level_4_floor_mid);
  level_4.add(level_4_floor_right);
  level_4.add(level_4_goal);
  
  level_5 = new Level();
  let level_5_floor_left = new GameObject({x: -7, y: -5}, {x: 6, y: 2}, "#dfdfdfff");
  let level_5_platform = new MovingPlatform({x: 0, y: -4.25}, {x: 0, y: -.25}, 5, {x: 2, y: 0.5}, "#dfdfdfff");
  let level_5_floor_right = new GameObject({x: 7, y: -3}, {x: 6, y: 6}, "#dfdfdfff");
  let level_5_goal = new GameObject({x: 7, y: -0.5}, {x: 4, y: 1}, "#72e56cff");
  level_5.add(level_5_floor_left);
  level_5.add(level_5_floor_right);
  level_5.add(level_5_platform);
  level_5.add(level_5_goal);
  
  // SLIDE 9
  level_8 = new Level();
  let level_8_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#dfdfdfff");
  level_8.add(level_8_floor);

  // SLIDE 10
  level_6 = new Level();
  let level_6_left = new GameObject({x: -5.95, y: -1.45}, {x: 5.35, y: 4.3}, "#941a1a", false);
  let level_6_right = new GameObject({x: 4.35, y: -1.1}, {x: 10.9, y: 8.65}, "#941a1a", false);
  level_6.add(level_6_left);
  level_6.add(level_6_right);

  // SLIDE 11
  level_7 = new Level();
  let level_7_floor = new GameObject({x: 0, y: 0.25}, {x: 17, y: 0.5}, "#c8c8c8ff");
  level_7.add(level_7_floor);

  // VIBE SWITCH
  level_9 = new Level();
  let level_9_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#6c9affff");
  let level_9_mid = new GameObject({x: 0, y: 1}, {x: 3, y: 0.5}, "#e4b746ff");
  let level_9_left = new GameObject({x: -6, y: -2}, {x: 3, y: 0.5}, "#e4b746ff");
  let level_9_right = new GameObject({x: 6, y: -2}, {x: 3, y: 0.5}, "#e4b746ff");
  level_9.add(level_9_floor);
  level_9.add(level_9_mid);
  level_9.add(level_9_left);
  level_9.add(level_9_right);

  level_10 = new Level();
  let level_10_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#9a5a19ff");
  let level_10_mid = new GameObject({x: 0, y: 1}, {x: 3, y: 0.5}, "#f8912aff");
  let level_10_left = new GameObject({x: -6, y: -2}, {x: 3, y: 0.5}, "#f8912aff");
  let level_10_right = new GameObject({x: 6, y: -2}, {x: 3, y: 0.5}, "#f8912aff");
  level_10.add(level_10_floor);
  level_10.add(level_10_mid);
  level_10.add(level_10_left);
  level_10.add(level_10_right);

  level_11 = new Level();
  let level_11_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#3eac3eff");
  let level_11_mid = new GameObject({x: 0, y: 1}, {x: 3, y: 0.5}, "#926b45ff");
  let level_11_left = new GameObject({x: -6, y: -2}, {x: 3, y: 0.5}, "#926b45ff");
  let level_11_right = new GameObject({x: 6, y: -2}, {x: 3, y: 0.5}, "#926b45ff");
  level_11.add(level_11_floor);
  level_11.add(level_11_mid);
  level_11.add(level_11_left);
  level_11.add(level_11_right);

  level_12 = new Level();
  let level_12_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#dfdfdfff");
  let level_12_mid = new GameObject({x: 0, y: 1}, {x: 3, y: 0.5}, "#dfdfdfff");
  let level_12_left = new GameObject({x: -6, y: -2}, {x: 3, y: 0.5}, "#dfdfdfff");
  let level_12_right = new GameObject({x: 6, y: -2}, {x: 3, y: 0.5}, "#dfdfdfff");
  level_12.add(level_12_floor);
  level_12.add(level_12_mid);
  level_12.add(level_12_left);
  level_12.add(level_12_right);
  
  // define scenes
  scene_list = [
        {level: null, slide: slide_1, mode: 'none'},
        {level: null, slide: slide_2, mode: 'none'},
        {level: null, slide: slide_3, mode: 'none'},
        {level: null, slide: slide_4, mode: 'none'},
        {level: null, slide: slide_5, mode: 'none'},
        {level: null, slide: slide_6, mode: 'none'},
        {level: null, slide: slide_7, mode: 'none'},
        {level: null, slide: QR, mode: 'fly'},
        {level: level_1, slide: QR, mode: 'platformer'},
        {level: level_2, slide: null, mode: 'platformer'},
        {level: level_3, slide: null, mode: 'platformer'},
        {level: level_4, slide: null, mode: 'platformer'},
        {level: level_5, slide: null, mode: 'platformer'},
        {level: level_8, slide: slide_9, mode: 'platformer'},
        {level: level_6, slide: slide_10, mode: 'platformer'},
        {level: level_7, slide: slide_11, mode: 'platformer'},
        {level: level_12, slide: null, mode: 'platformer'},
        {level: level_9, slide: bg_1, mode: 'platformer'},
        {level: level_10, slide: bg_2, mode: 'platformer'},
        {level: level_11, slide: bg_3, mode: 'platformer'},
    ]
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
  let scene = gameState.scene;
  const levelChange = prev_level !== scene_list[scene].level && scene_list[scene].level !== level_1;
  prev_level = scene_list[scene].level;

  if (scene_list[scene].level === null) return;

  // reset coins
  if (levelChange) {
    Object.values(scene_list[scene].level?.objects).forEach(obj => {
      if (obj instanceof Coin) {
        obj.do_draw = true;
      }
    })
  }

  const do_gravity = (scene_list[scene].mode === "platformer");

  if (scene_list[scene].level === null) return;
  scene_list[scene].level.update(deltaTime);

  Object.values(currentPlayers).forEach(player => {
    player.update(deltaTime, do_gravity);

    if (scene_list[scene].level === null) return;

    if (levelChange) {
        player.respawn();
    }

    // collision
    player.canJump = false;
    Object.values(scene_list[scene].level?.objects).forEach(obj => {
        if (collide(player.collider, obj.collider)) {
            if (obj instanceof Coin) {
              obj.do_draw = false;
              // play sound?
            } else {
              const mtv = getMTV(player.collider, obj.collider, player.vel);
              player.position.x += mtv.x;
              player.position.y += mtv.y;

              if (mtv.x === 0) {
                  player.canJump = true;
              }
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
  let scene = gameState.scene;

  if (scene_list[scene].slide) drawBackground(scene_list[scene].slide);

  if (scene_list[scene].mode === 'none') return;

  if (scene_list[scene].level) scene_list[scene].level.draw(ctx, canvas.width, canvas.height);

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
