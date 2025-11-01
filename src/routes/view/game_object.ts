import type { vec2, AABB } from '$lib/types'

export class GameObject {
    position: vec2;
    scale: vec2;
    vel: vec2;
    color: string;

    collider: AABB;

    constructor(position: vec2, scale: vec2={x: 1, y: 1}, color="#4400ffff") {
        this.position = position;
        this.scale = scale;
        this.vel = { x: 0, y: 0 };
        this.color = color;

        this.collider = { topRight: this.position, bottomLeft: this.position };
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const tiles = 20;
        const unit = width / tiles;
        const center = {x: width / 2, y: height / 2};
        const offset = {x: center.x - this.scale.x / 2 - unit / 2, y: center.y - this.scale.y / 2 - unit / 2}
        
        ctx.fillStyle = this.color;
        ctx.fillRect(offset.x + this.position.x * unit, offset.y - this.position.y * unit, unit, unit);
    }

    calcCollider() {
        this.collider.topRight.x = this.position.x * this.scale.x;
        this.collider.topRight.y = this.position.y * this.scale.y;
        this.collider.bottomLeft.x = -this.position.x * this.scale.x;
        this.collider.bottomLeft.y = -this.position.y * this.scale.y;
    }
}