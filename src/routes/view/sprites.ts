// Sprite drawing for the "chicken" style (chicken players + goal flags)
import type { Player } from './player';
import type { GameObject } from './game_object';

const FRAME = 32; // both sheets use 32x32 frames
const CHICKEN_IDLE_FRAMES = 2; // top row
const CHICKEN_WALK_FRAMES = 7; // bottom row
const CHICKEN_IDLE_FPS = 2;
const CHICKEN_WALK_FPS = 12;
const FLAG_FRAMES = 9;
const FLAG_FPS = 10;
const COIN_FRAME = 16;
const COIN_FRAMES = 6;
const COIN_FPS = 10;
// The coin fills ~10px of its 16px frame, so scale up to roughly match the hitbox
const COIN_DRAW_SCALE = 1.6;

// The chicken only fills the bottom ~half of its frame, so the frame is drawn
// at 2x the player's hitbox to make the chicken roughly match it.
const CHICKEN_DRAW_SCALE = 2;
const FLAG_SIZE_UNITS = 2;
const TINT_STRENGTH = 0.6;

const GOAL_COLOR = '#72e56c';

let chickenSheet: HTMLImageElement | null = null;
let flagSheet: HTMLImageElement | null = null;
let cloudPlatform: HTMLImageElement | null = null;
let coinSheet: HTMLImageElement | null = null;
const tintCache = new Map<string, HTMLCanvasElement>();

if (typeof window !== 'undefined') {
    chickenSheet = new Image();
    chickenSheet.src = '/assets/chicken.png';
    flagSheet = new Image();
    flagSheet.src = '/assets/flag.png';
    cloudPlatform = new Image();
    cloudPlatform.src = '/assets/cloud_platform.png';
    coinSheet = new Image();
    coinSheet.src = '/assets/coin_small_gold.png';
}

function ready(img: HTMLImageElement | null): img is HTMLImageElement {
    return !!img && img.complete && img.naturalWidth > 0;
}

export function isGoal(obj: GameObject): boolean {
    return obj.color.toLowerCase().startsWith(GOAL_COLOR);
}

// Chicken sheet tinted toward a player's color (cached per color)
function tintedChicken(color: string): HTMLCanvasElement | null {
    if (!ready(chickenSheet)) return null;

    const cached = tintCache.get(color);
    if (cached) return cached;

    const w = chickenSheet.naturalWidth;
    const h = chickenSheet.naturalHeight;

    // Multiply the color over the sheet, keeping the sheet's transparency
    const multiplied = document.createElement('canvas');
    multiplied.width = w;
    multiplied.height = h;
    const m = multiplied.getContext('2d')!;
    m.drawImage(chickenSheet, 0, 0);
    m.globalCompositeOperation = 'multiply';
    m.fillStyle = color;
    m.fillRect(0, 0, w, h);
    m.globalCompositeOperation = 'destination-in';
    m.drawImage(chickenSheet, 0, 0);

    // Blend with the original so dark player colors stay readable
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const o = out.getContext('2d')!;
    o.drawImage(chickenSheet, 0, 0);
    o.globalAlpha = TINT_STRENGTH;
    o.drawImage(multiplied, 0, 0);

    tintCache.set(color, out);
    return out;
}

export function drawChicken(ctx: CanvasRenderingContext2D, player: Player, width: number, height: number) {
    const sheet = tintedChicken(player.color);
    if (!sheet) return;

    const rect = player.screenRect(width, height);
    const moving = player.vel.x !== 0;

    const frames = moving ? CHICKEN_WALK_FRAMES : CHICKEN_IDLE_FRAMES;
    const fps = moving ? CHICKEN_WALK_FPS : CHICKEN_IDLE_FPS;
    const row = moving ? 1 : 0;
    const frame = Math.floor(player.animTime * fps) % frames;

    // Centered on the hitbox horizontally, feet on the hitbox bottom
    const size = rect.w * CHICKEN_DRAW_SCALE;
    const cx = rect.x + rect.w / 2;
    const bottom = rect.y + rect.h;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(cx, bottom);
    // Sheet faces left; mirror when walking right
    if (player.facing > 0) ctx.scale(-1, 1);
    ctx.drawImage(sheet, frame * FRAME, row * FRAME, FRAME, FRAME, -size / 2, -size, size, size);
    ctx.restore();
}

export function drawFlag(ctx: CanvasRenderingContext2D, goal: GameObject, width: number, height: number, time: number) {
    if (!ready(flagSheet)) return;

    const rect = goal.screenRect(width, height);
    const size = FLAG_SIZE_UNITS * rect.unit;
    const frame = Math.floor(time * FLAG_FPS) % FLAG_FRAMES;

    // Standing on top of the goal, centered
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        flagSheet,
        frame * FRAME, 0, FRAME, FRAME,
        rect.x + rect.w / 2 - size / 2, rect.y - size, size, size
    );
    ctx.restore();
}


// Cloud sprite stretched over a moving platform's hitbox (falls back to the plain box)
export function drawCloudPlatform(ctx: CanvasRenderingContext2D, platform: GameObject, width: number, height: number) {
    if (!ready(cloudPlatform)) {
        platform.draw(ctx, width, height);
        return;
    }

    const rect = platform.screenRect(width, height);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cloudPlatform, rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
}

// Spinning coin sprite centered on the coin's hitbox (skipped once collected)
export function drawCoin(ctx: CanvasRenderingContext2D, coin: GameObject, width: number, height: number, time: number) {
    if (!coin.do_draw) return;
    if (!ready(coinSheet)) {
        coin.draw(ctx, width, height);
        return;
    }

    const rect = coin.screenRect(width, height);
    const size = rect.w * COIN_DRAW_SCALE;
    const frame = Math.floor(time * COIN_FPS) % COIN_FRAMES;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        coinSheet,
        frame * COIN_FRAME, 0, COIN_FRAME, COIN_FRAME,
        rect.x + rect.w / 2 - size / 2, rect.y + rect.h / 2 - size / 2, size, size
    );
    ctx.restore();
}
