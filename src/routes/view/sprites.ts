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
// Feather colors in chicken.png that get swapped for the player's color
const CHICKEN_BODY = 255;   // pure white
const CHICKEN_SHADOW = 230; // light grey shading
const SHADOW_DARKEN = 0.8;  // shadow = player color * this

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

// Turn any CSS color string into [r, g, b] by letting the canvas parse it
function cssToRgb(color: string): [number, number, number] {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const x = c.getContext('2d')!;
    x.fillStyle = color;
    x.fillRect(0, 0, 1, 1);
    const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
}

// Chicken sheet with its white feathers recolored to the player's color (cached per color)
function tintedChicken(color: string): HTMLCanvasElement | null {
    if (!ready(chickenSheet)) return null;

    const cached = tintCache.get(color);
    if (cached) return cached;

    const w = chickenSheet.naturalWidth;
    const h = chickenSheet.naturalHeight;

    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const o = out.getContext('2d', { willReadFrequently: true })!;
    o.drawImage(chickenSheet, 0, 0);

    const [r, g, b] = cssToRgb(color);
    const shadow = [r, g, b].map(v => Math.round(v * SHADOW_DARKEN));

    const img = o.getImageData(0, 0, w, h);
    const px = img.data;
    for (let i = 0; i < px.length; i += 4) {
        if (px[i + 3] === 0) continue;
        const gray = px[i];
        if (px[i + 1] !== gray || px[i + 2] !== gray) continue;

        if (gray === CHICKEN_BODY) {
            px[i] = r; px[i + 1] = g; px[i + 2] = b;
        } else if (gray === CHICKEN_SHADOW) {
            px[i] = shadow[0]; px[i + 1] = shadow[1]; px[i + 2] = shadow[2];
        }
    }
    o.putImageData(img, 0, 0);

    tintCache.set(color, out);
    return out;
}

// Image URL of a single recolored chicken (first idle frame, trimmed to the bird).
// Used by the phone controller to show "Your Chicken".
export async function chickenPortrait(color: string): Promise<string | null> {
    const img = chickenSheet;
    if (!img) return null;
    if (!(img.complete && img.naturalWidth > 0)) {
        try {
            await img.decode();
        } catch {
            return null;
        }
    }
    const sheet = tintedChicken(color);
    if (!sheet) return null;

    const frame = sheet.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, FRAME, FRAME);

    // Find the bounding box of the visible pixels
    let minX = FRAME, minY = FRAME, maxX = -1, maxY = -1;
    for (let y = 0; y < FRAME; y++) {
        for (let x = 0; x < FRAME; x++) {
            if (frame.data[(y * FRAME + x) * 4 + 3] === 0) continue;
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
    }
    if (maxX < 0) return null;

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    out.getContext('2d')!.drawImage(sheet, minX, minY, w, h, 0, 0, w, h);
    return out.toDataURL();
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
