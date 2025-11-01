import type { vec2, AABB } from '$lib/types'
import { GameObject } from './game_object'

let unit = 100;

export class Player extends GameObject {
    clientId: string;
    role: string;
    position: vec2;
    color: string;
    speed: number;
    vel: vec2;
    scale: vec2;
    inputs: Record<string, boolean>;

    // physics
    collider: AABB;

    constructor(clientId: string, role: string, position: vec2 = {x: 0, y: 0}, color='#fc4444ff', speed = 5) {
        super(position, {x: 1, y: 1}, color);
        this.clientId = clientId;
        this.role = role;
        this.position = position;
        this.color = color;
        this.speed = speed;
        this.vel = { x: 0, y: 0 };
        this.scale = { x: 1, y: 1 };
        this.collider = { topRight: this.position, bottomLeft: this.position }; // temporary value
        this.inputs = {};
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x * unit, this.position.y * unit, unit, unit);
    }

    update(deltaTime: number) {
        if (this.inputs["right"]) this.position.x += this.speed * deltaTime;
        if (this.inputs["left"]) this.position.x -= this.speed * deltaTime;
        if (this.inputs["up"]) this.position.y += this.speed * deltaTime;
        if (this.inputs["down"]) this.position.y -= this.speed * deltaTime;
    }

    calcCollider() {
        this.collider.topRight.x = this.position.x * this.scale.x;
        this.collider.topRight.y = this.position.y * this.scale.y;
        this.collider.bottomLeft.x = -this.position.x * this.scale.x;
        this.collider.bottomLeft.y = -this.position.y * this.scale.y;
    }
}