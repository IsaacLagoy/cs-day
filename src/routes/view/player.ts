import type { GameUpdateMessage, PlayerInputMessage, ConnectedClient, vec2, AABB } from '$lib/types'

let unit = 100;

export class Player {
    clientId: string;
    role: string;
    pos: vec2;
    color: string;
    speed: number;
    vel: vec2;
    scale: vec2;
    inputs: Record<string, boolean>;

    // physics
    collider: AABB;

    constructor(clientId: string, role: string, x = 0, y = 0, color='#fc4444ff', speed = 5) {
        this.clientId = clientId;
        this.role = role;
        this.pos = { x: x, y: y };
        this.color = color;
        this.speed = speed;
        this.vel = { x: 0, y: 0 };
        this.scale = { x: 1, y: 1 };
        this.collider = { topRight: this.pos, bottomLeft: this.pos }; // temporary value
        this.inputs = {};
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, unit, unit);
    }

    update(deltaTime: number) {
        if (this.inputs["right"]) this.pos.x += this.speed * deltaTime * unit;
        if (this.inputs["left"]) this.pos.x -= this.speed * deltaTime * unit;
        if (this.inputs["up"]) this.pos.y += this.speed * deltaTime * unit;
        if (this.inputs["down"]) this.pos.y -= this.speed * deltaTime * unit;
    }

    calcCollider() {
        this.collider.topRight.x = this.pos.x * this.scale.x;
        this.collider.topRight.y = this.pos.y * this.scale.y;
        this.collider.bottomLeft.x = -this.pos.x * this.scale.x;
        this.collider.bottomLeft.y = -this.pos.y * this.scale.y;
    }
}