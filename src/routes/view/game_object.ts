import type { vec2, AABB } from '$lib/types'

export class GameObject {
    position: vec2;
    scale: vec2;
    vel: vec2;
    color: string;

    collider: AABB;

    constructor(position: vec2, scale: vec2={ x: 1, y: 1 }, color="#4400ffff") {
        this.position = position;
        this.scale = scale;
        this.vel = { x: 0, y: 0 };
        this.color = color;

        this.collider = { topRight: this.position, bottomLeft: this.position };
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        const unit = 100;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x * unit, this.position.y * unit, unit, unit);
    }

    calcCollider() {
        this.collider.topRight.x = this.position.x * this.scale.x;
        this.collider.topRight.y = this.position.y * this.scale.y;
        this.collider.bottomLeft.x = -this.position.x * this.scale.x;
        this.collider.bottomLeft.y = -this.position.y * this.scale.y;
    }

    update(time: number) {
        this.position.x += this.vel.x * time;
        this.position.y += this.vel.y * time;
    }
}