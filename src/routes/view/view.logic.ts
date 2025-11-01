// src/routes/view/view.logic.ts
import { get } from 'svelte/store';
import { GameViewController } from './controller';

// Game Rendering
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let controllerInstance: GameViewController;
let lastTime = 0;
let slide_1: HTMLImageElement;
let slide_2: HTMLImageElement;
let slide_list: Array<HTMLImageElement>;

// Load assets
if (typeof window !== 'undefined') {
  slide_1 = new Image();
  slide_1.src = '/src/lib/assets/slide-1.png'; 
  slide_2 = new Image();
  slide_2.src = '/src/lib/assets/slide-2.png'; 

  slide_list = [slide_1, slide_2];
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

  Object.values(currentPlayers).forEach(player => {
    player.update(deltaTime)
  });
}

// Draw all players
function draw() {
  const currentPlayers = get(controllerInstance.players);

  Object.values(currentPlayers).forEach(player => {
    player.draw(ctx);
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


// Main loop
function loop(time: number) {
  const deltaTime = (time - lastTime) * 0.001;
  lastTime = time;

  update(deltaTime);

  // Clear the screen
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  drawBackground(slide_list[0]);

  draw();


  requestAnimationFrame(loop);
}
