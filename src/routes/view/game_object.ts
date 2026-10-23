import type { vec2, AABB } from '$lib/types'

export class GameObject {
    position: vec2;
    scale: vec2;
    vel: vec2;
    color: string;
    do_draw: boolean;

    collider: AABB;

    constructor(position: vec2, scale: vec2={ x: 1, y: 1 }, color="#4400ffff", do_draw=true) {
        this.position = position;
        this.scale = {x: scale.x, y: scale.y};
        this.vel = { x: 0, y: 0 };
        this.color = color;
        this.do_draw = do_draw;

        this.collider = { topRight: {x: 0, y: 0}, bottomLeft: {x: 0, y: 0} };
        this.calcCollider();
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {

        if (!this.do_draw) return;

        const rect = this.screenRect(width, height);
        ctx.fillStyle = this.color;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }

    // On-screen rectangle (top-left corner + size) in canvas pixels
    screenRect(width: number, height: number): { x: number; y: number; w: number; h: number; unit: number } {
        const tiles = 20;
        const imageAspect = 2560 / 1440;

        let unit: number;
        if (width / height > imageAspect) {
            unit = (height * imageAspect) / tiles;
        } else {
            unit = width / tiles;
        }

        const center = {x: width / 2, y: height / 2};
        const offset = {x: center.x - this.scale.x * unit  / 2, y: center.y - this.scale.y * unit / 2}
        
        return {
            x: offset.x + this.position.x * unit,
            y: offset.y - this.position.y * unit,
            w: this.scale.x * unit,
            h: this.scale.y * unit,
            unit,
        };
    }

    calcCollider() {
        this.collider.topRight.x   = this.position.x + this.scale.x / 2;
        this.collider.topRight.y   = this.position.y + this.scale.y / 2;
        this.collider.bottomLeft.x = this.position.x - this.scale.x / 2;
        this.collider.bottomLeft.y = this.position.y - this.scale.y / 2;
    }

    update(time: number) {
        this.position.x += this.vel.x * time;
        this.position.y += this.vel.y * time;
        this.calcCollider();
    }
}
