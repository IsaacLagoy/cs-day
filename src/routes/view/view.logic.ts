// src/routes/view/view.logic.ts
import { get } from 'svelte/store';
import { GameViewController } from './controller';
import { Level } from './level';
import { GameObject } from './game_object';
import { collide, getMTV } from './physics';
import { MovingPlatform } from './moving_platform';
import { Coin } from './coin';
import { NUM_SCENES } from '$lib/scenes';
import { drawChicken, drawCloudPlatform, drawCoin, drawFlag, isGoal } from './sprites';

type SceneStyle = 'default' | 'chicken';

interface Scene {
    level: Level | null;
    slide: HTMLImageElement | null;
    mode: String;
    showQr?: boolean;
    style?: SceneStyle;
}

// Game Rendering
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let controllerInstance: GameViewController;
let lastTime = 0;

let joinQrImage: HTMLImageElement | null = null;
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
let slide_12: HTMLImageElement;
let slide_13: HTMLImageElement;
let slide_14: HTMLImageElement;
let bg_1: HTMLImageElement;
let bg_2: HTMLImageElement;
let bg_3: HTMLImageElement;
let princess_1: HTMLImageElement;
let princess_2: HTMLImageElement;
let princess_3: HTMLImageElement;
let princess_4: HTMLImageElement;

let prev_level: Level | null;

let level_1: Level;
let level_2: Level;
let level_3: Level;
let level_4: Level;
let level_5: Level;
let level_6: Level;
let level_7: Level;
let level_8: Level;
let level_9: Level;
let level_12: Level;
let level_chicken: Level;
let level_13: Level;
let level_princess_start: Level;
let level_princess_end: Level;
let level_14: Level;
let level_15: Level;
let level_hole: Level;
let level_16: Level;

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
  slide_12 = new Image();
  slide_12.src = '/slide-12.png'; 
  slide_13 = new Image();
  slide_13.src = '/slide-13.png'; 
  slide_14 = new Image();
  slide_14.src = '/slide-14.png'; 

  bg_1 = new Image();
  bg_1.src = '/bg-1.png'; 
  bg_2 = new Image();
  bg_2.src = '/bg-2.png'; 
  bg_3 = new Image();
  bg_3.src = '/bg-3.png'; 

  princess_1 = new Image();
  princess_1.src = '/forest_2.png'; 
  princess_2 = new Image();
  princess_2.src = '/princess-end.png'; 
  princess_3 = new Image();
  princess_3.src = '/forest_3.png'; 
  princess_4 = new Image();
  princess_4.src = '/forest_4.png'; 

  
  level_1 = new Level();
  let level_1_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#dfdfdfff");
  level_1.add(level_1_floor);
  
  level_2 = new Level();
  let level_2_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#dfdfdfff");
  let level_2_goal = new GameObject({x: 7, y: -4.5}, {x: 4, y: 1}, "#72e56cff");
  level_2.add(level_2_floor);
  level_2.add(level_2_goal);

  level_hole = new Level();
  let level_hole_floor_left = new GameObject({x: -6, y: -5}, {x: 8, y: 2}, "#dfdfdfff");
  let level_hole_floor_right = new GameObject({x: 6, y: -5}, {x: 8, y: 2}, "#dfdfdfff");
  let level_hole_goal = new GameObject({x: 7, y: -4.5}, {x: 4, y: 1}, "#72e56cff");
  level_hole.add(level_hole_floor_left);
  level_hole.add(level_hole_floor_right);
  level_hole.add(level_hole_goal);
  
  
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
  let level_4_coin_1 = new Coin({x: -2.5, y: 0});
  let level_4_coin_2 = new Coin({x: 2.5, y: 2});
  let level_4_coin_3 = new Coin({x: -4, y: 2});
  level_4.add(level_4_floor_left);
  level_4.add(level_4_floor_mid);
  level_4.add(level_4_floor_right);
  level_4.add(level_4_goal);
  level_4.add(level_4_coin_1);
  level_4.add(level_4_coin_2);
  level_4.add(level_4_coin_3);
  
  level_5 = new Level();
  let level_5_floor_left = new GameObject({x: -7, y: -5}, {x: 6, y: 2}, "#dfdfdfff");
  let level_5_platform = new MovingPlatform({x: 0, y: -4.25}, {x: 0, y: -.25}, 5, {x: 2, y: 0.5}, "#dfdfdfff");
  let level_5_floor_right = new GameObject({x: 7, y: -3}, {x: 6, y: 6}, "#dfdfdfff");
  let level_5_goal = new GameObject({x: 7, y: -0.5}, {x: 4, y: 1}, "#72e56cff");
  let level_5_coin = new Coin({x: 0, y: 4});
  level_5.add(level_5_floor_left);
  level_5.add(level_5_floor_right);
  level_5.add(level_5_platform);
  level_5.add(level_5_goal);
  level_5.add(level_5_coin);

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
  let level_9_floor = new GameObject({x: 0, y: -4.75}, {x: 20, y: 2}, "#6c9aff00");
  let level_9_mid = new GameObject({x: 0, y: 0.45}, {x: 4, y: 0.9}, "#e4b74600");
  let level_9_left = new GameObject({x: -6.5, y: -1.4}, {x: 3, y: 0.9}, "#e4b74600");
  let level_9_right = new GameObject({x: 6.5, y: -1.4}, {x: 3, y: 0.9}, "#e4b74600");
  level_9.add(level_9_floor);
  level_9.add(level_9_mid);
  level_9.add(level_9_left);
  level_9.add(level_9_right);

  // Final vibe switch, this is when we change the style of everything
  level_12 = new Level();
  let level_12_floor = new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#dfdfdfff");
  let level_12_mid = new GameObject({x: 0, y: 1}, {x: 3, y: 0.5}, "#dfdfdfff");
  let level_12_left = new GameObject({x: -6, y: -2}, {x: 3, y: 0.5}, "#dfdfdfff");
  let level_12_right = new GameObject({x: 6, y: -2}, {x: 3, y: 0.5}, "#dfdfdfff");
  level_12.add(level_12_floor);
  level_12.add(level_12_mid);
  level_12.add(level_12_left);
  level_12.add(level_12_right);

  // Style switch: same layout as level 2, but from here on players are chickens and goals get flags
  level_chicken = new Level();
  level_chicken.add(new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#dfdfdfff"));
  level_chicken.add(new GameObject({x: 7, y: -4.5}, {x: 4, y: 1}, "#72e56cff"));

  level_13 = new Level();
  let level_13_floor_left = new GameObject({x: -6, y: -5}, {x: 8, y: 2}, "#dfdfdfff");
  let level_13_floor_right = new GameObject({x: 6, y: -5}, {x: 8, y: 2}, "#dfdfdfff");
  let level_13_coin = new Coin({x: 0, y: 0});
  let level_13_coin_2 = new Coin({x: 9, y: 1});
  level_13.add(level_13_floor_left);
  level_13.add(level_13_floor_right);
  level_13.add(level_13_coin);
  level_13.add(level_13_coin_2);

  level_princess_start = new Level();
  level_princess_start.add(new GameObject({x: 0, y: -4.75}, {x: 20, y: 2}, "#926b4500"));
  level_princess_start.add(new GameObject({x: 7, y: -4.25}, {x: 4, y: 1}, "#72e56c00"));
  level_princess_start.add(new Coin({x: 5, y: -2}));
  level_princess_start.add(new Coin({x: 0, y: -2}));

  level_princess_end = new Level();
  level_princess_end.add(new GameObject({x: 0, y: -5}, {x: 20, y: 2}, "#926b45ff"));
  level_princess_end.add(new GameObject({x: 7, y: -4.5}, {x: 4, y: 1}, "#72e56cff"));
  let min_x = -5;
  let max_x = 5;
  let min_y = -3.5;
  let max_y = 0;
  let spacing = 1.0;
  for (let x = min_x; x <= max_x; x += spacing) {
    for (let y = min_y; y <= max_y; y += spacing) {
      level_princess_end.add(new Coin({x: x, y: y}));
    }
  }

  // engine slide
  level_15 = new Level();
  level_15.add(new GameObject({x: -8.5, y: -6}, {x: 4, y: 2}, "#dfdfdfff"));
  level_15.add(new GameObject({x: -2, y: -6}, {x: 2, y: 4}, "#dfdfdfff"));
  level_15.add(new GameObject({x: 3, y: -7}, {x: 2, y: 4}, "#dfdfdfff"));  
  level_15.add(new GameObject({x: 8.5, y: -5}, {x: 4, y: 6}, "#dfdfdfff"));
  level_15.add(new GameObject({x: 1.5, y: 0.5}, {x: 4, y: 0.5}, "#dfdfdfff"));
  level_15.add(new GameObject({x: 8.5, y: 3}, {x: 4, y: 1}, "#72e56cff"));
  level_15.add(new Coin({x: 5, y: 4}));
  level_15.add(new Coin({x: 5, y: 2}));
  level_15.add(new Coin({x: -2, y: 2}));
  level_15.add(new Coin({x: -4.5, y: -2}));
  level_15.add(new Coin({x: 0.5, y: -2}));

  level_14 = new Level();
  let level_14_start = new GameObject({x: -8.5, y: -3.1}, {x: 3, y: 10}, "#3eac3e00");
  let level_14_platform_1 = new MovingPlatform({x: -6, y: -4.0}, {x: -6, y: 1.75}, 5, {x: 2, y: 0.5}, "#926b45ff");
  let level_14_floor = new GameObject({x: -4.1, y: -4.75}, {x: 6, y: 2}, "#3eac3e00");
  let level_14_wall = new GameObject({x: -3.5, y: 5.1}, {x: 2.8, y: 10}, "#3eac3e00");
  let level_14_platform_2 = new MovingPlatform({x: 1, y: -3.5}, {x: 1, y: -0.5}, 4, {x: 2, y: 0.5}, "#926b45ff");
  let level_14_platform_3 = new MovingPlatform({x: 4, y: -1}, {x: 4, y: 1.75}, 2, {x: 2, y: 0.5}, "#926b45ff");
  let level_14_end = new GameObject({x: 8.5, y: -2.2}, {x: 3, y: 10}, "#72e56c00");
  level_14.add(level_14_start);
  level_14.add(level_14_platform_1);
  level_14.add(level_14_platform_2);
  level_14.add(level_14_platform_3);
  level_14.add(level_14_floor);
  level_14.add(level_14_wall);
  level_14.add(level_14_end);
  level_14.add(new Coin({x: -3.5, y: -1}));
  level_14.add(new Coin({x: 4, y: -3}));

  level_16 = new Level();
  let level_16_cliff = new GameObject({x: -3.0, y: 0.95}, {x: 14, y: 1.7}, "#3eac3e00");
  let level_16_hover = new GameObject({x: 7.5, y: -1.25}, {x: 3, y: 1}, "#3eac3e00");
  let level_16_left = new GameObject({x: -7.0, y: -4.65}, {x: 6, y: 1.7}, "#3eac3e00");
  let level_16_right = new GameObject({x: 7.0, y: -4.65}, {x: 6, y: 1.7}, "#3eac3e00");
  let level_16_mid = new GameObject({x: 0.0, y: -4.65}, {x: 2, y: 1.7}, "#3eac3e00");
  let level_16_goal = new GameObject({x: -8.0, y: -4.25}, {x: 3, y: 1}, "#72e56c00");
  let level_16_coin_1 = new Coin({x: 5.5, y: 4});
  let level_16_coin_2 = new Coin({x: 9, y: -3});
  let level_16_coin_3 = new Coin({x: 2.5, y: -1.5});
  let level_16_coin_4 = new Coin({x: -2.5, y: -1.5});
  level_16.add(level_16_cliff);
  level_16.add(level_16_hover);
  level_16.add(level_16_left);
  level_16.add(level_16_right);
  level_16.add(level_16_mid);
  level_16.add(level_16_goal);
  level_16.add(level_16_coin_1);
  level_16.add(level_16_coin_2);
  level_16.add(level_16_coin_3);
  level_16.add(level_16_coin_4);

  // define scenes
  scene_list = [
      {level: null, slide: slide_1, mode: 'none'},
      {level: null, slide: slide_2, mode: 'none'},
      {level: null, slide: slide_3, mode: 'none'},
      {level: null, slide: slide_4, mode: 'none'},
      {level: null, slide: slide_5, mode: 'none'},
      {level: null, slide: slide_6, mode: 'none'},
      {level: null, slide: slide_7, mode: 'none'},
      {level: null, slide: slide_8, mode: 'fly', showQr: true},
      {level: level_1, slide: slide_8, mode: 'platformer', showQr: true},
      {level: level_2, slide: null, mode: 'platformer'},
      {level: level_2, slide: slide_9, mode: 'platformer'},
      {level: level_hole, slide: null, mode: 'platformer'},
      {level: level_6, slide: slide_10, mode: 'platformer'},
      {level: level_3, slide: null, mode: 'platformer'},
      {level: level_7, slide: slide_11, mode: 'platformer'},
      {level: level_4, slide: null, mode: 'platformer'},
      {level: level_5, slide: null, mode: 'platformer'},
      {level: level_12, slide: null, mode: 'platformer'},
      {level: level_9, slide: bg_1, mode: 'platformer'},
      {level: level_9, slide: bg_2, mode: 'platformer'},
      {level: level_9, slide: bg_3, mode: 'platformer'},
      {level: level_9, slide: bg_3, mode: 'platformer', style: 'chicken'},
      {level: level_princess_start, slide: princess_1, mode: 'platformer', style: 'chicken'},
      {level: level_16, slide: princess_4, mode: 'platformer', style: 'chicken'},
      {level: level_15, slide: slide_14, mode: 'platformer', style: 'chicken'},
      {level: level_14, slide: princess_3, mode: 'platformer', style: 'chicken'},
      {level: level_princess_end, slide: princess_2, mode: 'platformer', style: 'chicken'},
      {level: level_13, slide: slide_13, mode: 'platformer', style: 'chicken'},
    ]

  if (scene_list.length !== NUM_SCENES) {
    console.warn(`[view] scene_list has ${scene_list.length} scenes but NUM_SCENES is ${NUM_SCENES}. Update src/lib/scenes.ts.`);
  }
}


// Keep the scene index inside scene_list so an out-of-range value can't crash the loop
function clampScene(scene: number): number {
  return Math.max(0, Math.min(scene ?? 0, scene_list.length - 1));
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
  let scene = clampScene(gameState.scene);

  const levelChange = prev_level !== scene_list[scene].level && scene_list[scene].level !== level_1;
  prev_level = scene_list[scene].level;

  // reset coins
  if (levelChange && scene_list[scene].level) {
    Object.values(scene_list[scene].level?.objects).forEach(obj => {
      if (obj instanceof Coin) {
        obj.do_draw = true;
      }
    })
  }

  const do_gravity = (scene_list[scene].mode === "platformer");

  if (scene_list[scene].level) scene_list[scene].level.update(deltaTime);

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
              player.calcCollider();

              // Only landing on a surface restores jump, not ceiling or wall hits
              if (mtv.y > 0) {
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
  let scene = clampScene(gameState.scene);

  if (scene_list[scene].slide) drawBackground(scene_list[scene].slide);

  if (scene_list[scene].mode !== 'none') {
    const chickenStyle = scene_list[scene].style === 'chicken';
    const level = scene_list[scene].level;

    if (level) {
      if (chickenStyle) {
        level.objects.forEach(obj => {
          if (obj instanceof MovingPlatform) drawCloudPlatform(ctx, obj, canvas.width, canvas.height);
          else if (obj instanceof Coin) drawCoin(ctx, obj, canvas.width, canvas.height, lastTime * 0.001);
          else obj.draw(ctx, canvas.width, canvas.height);
        });
        level.objects.forEach(obj => {
          if (isGoal(obj)) drawFlag(ctx, obj, canvas.width, canvas.height, lastTime * 0.001);
        });
      } else {
        level.draw(ctx, canvas.width, canvas.height);
      }
    }

    const currentPlayers = get(controllerInstance.players);

    Object.values(currentPlayers).forEach(player => {
      if (chickenStyle) {
        drawChicken(ctx, player, canvas.width, canvas.height);
      } else {
        player.draw(ctx, canvas.width, canvas.height);
      }
    });
  }

  if (scene_list[scene].showQr) drawJoinQr();
}

export function setJoinQr(dataUrl: string): void {
  const img = new Image();
  img.src = dataUrl;
  joinQrImage = img;
}

function slideDrawRect(): { offsetX: number; offsetY: number; drawWidth: number; drawHeight: number } {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imageAspect = 2560 / 1440;
  const canvasAspect = canvasWidth / canvasHeight;

  if (canvasAspect > imageAspect) {
    const drawHeight = canvasHeight;
    const drawWidth = canvasHeight * imageAspect;
    return { offsetX: (canvasWidth - drawWidth) / 2, offsetY: 0, drawWidth, drawHeight };
  }

  const drawWidth = canvasWidth;
  const drawHeight = canvasWidth / imageAspect;
  return { offsetX: 0, offsetY: (canvasHeight - drawHeight) / 2, drawWidth, drawHeight };
}

function drawBackground(image: HTMLImageElement) {
  const { offsetX, offsetY, drawWidth, drawHeight } = slideDrawRect();
  // Nearest-neighbor scaling keeps pixel art crisp
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  ctx.restore();
}

function drawJoinQr(): void {
  if (!joinQrImage || !joinQrImage.complete || joinQrImage.naturalWidth === 0) return;

  const size = canvas.height * 0.5;
  const x = (canvas.width - size) / 2;
  const y = (canvas.height - size) / 2;
  const inset = size * 0.04;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, size, size);
  ctx.drawImage(joinQrImage, x + inset, y + inset, size - inset * 2, size - inset * 2);
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
