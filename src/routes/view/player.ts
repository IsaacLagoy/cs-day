import type { GameUpdateMessage, PlayerInputMessage, ConnectedClient, vec2, AABB } from '$lib/types'

let unit = 100;

export class Player {
    clientId: string;
    role: string;
    pos: vec2;
    vel: vec2;
    scale: vec2;
    inputs: Record<string, boolean>;

    // physics
    collider: AABB;

    constructor(clientId: string, role: string, x = 0, y = 0) {
        this.clientId = clientId;
        this.role = role;
        this.pos = { x: x, y: y };
        this.vel = { x: 0, y: 0 };
        this.scale = { x: 1, y: 1 };
        this.collider = { topRight: this.pos, bottomLeft: this.pos }; // temporary value
        this.inputs = {};
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;
        ctx.fillStyle = '#fc4444ff';
        ctx.fillRect(this.pos.x, this.pos.y, unit, unit);
    }

    calcCollider() {
        this.collider.topRight.x = this.pos.x * this.scale.x;
        this.collider.topRight.y = this.pos.y * this.scale.y;
        this.collider.bottomLeft.x = -this.pos.x * this.scale.x;
        this.collider.bottomLeft.y = -this.pos.y * this.scale.y;
    }
}