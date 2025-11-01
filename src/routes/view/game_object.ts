import type { vec2, AABB } from '$lib/types'

export class GameObject {
    position: vec2;
    scale: vec2;
    color: string;

    constructor(position: vec2, scale: vec2={x: 1, y: 1}, color="#82c3ffff") {
        this.position = position;
        this.scale = scale;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const unit = 100;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x * unit, this.position.y * unit, unit, unit);
    }
}