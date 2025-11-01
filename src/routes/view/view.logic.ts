// src/routes/view/view.logic.ts
import { get } from 'svelte/store';
import { GameViewController } from './controller';

// Game Rendering
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let controllerInstance: GameViewController;
let lastTime = 0;


// Initialize the canvas and start the game loop
export function init(c: HTMLCanvasElement, controller: GameViewController) {
  if (typeof window === 'undefined') return;

  canvas = c;
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  controllerInstance = controller;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  requestAnimationFrame(loop);
}

// Update player positions based on inputs
function update() {
  const currentPlayers = get(controllerInstance.players);

  Object.values(currentPlayers).forEach(player => {
    if (player.inputs["right"]) player.pos.x += 1;
    if (player.inputs["left"]) player.pos.x -= 1;
  });
}

// Draw all players
function draw() {
  const currentPlayers = get(controllerInstance.players);

  Object.values(currentPlayers).forEach(player => {
    player.draw(ctx);
  });
}

// Main loop
function loop(time: number) {
  const delta = time - lastTime;
  lastTime = time;

  update();

  // Clear the screen
  ctx.fillStyle = '#c6c6c6ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  draw();

  requestAnimationFrame(loop);
}
