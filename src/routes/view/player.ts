import type { vec2, AABB } from '$lib/types'
import { GameObject } from './game_object'

let unit = 100;

export class Player extends GameObject {
    clientId: string;
    role: string;
    speed: number;
    inputs: Record<string, boolean>;

    constructor(clientId: string, role: string, position: vec2 = {x: 0, y: 0}, color='#fc4444ff', speed = 5) {
        super(position, {x: 1, y: 1}, color);

        this.clientId = clientId;
        this.role = role;
        this.speed = speed;
        this.inputs = {};
    }

    update(deltaTime: number) {
        if (this.inputs["right"]) this.position.x += this.speed * deltaTime;
        if (this.inputs["left"]) this.position.x -= this.speed * deltaTime;
        if (this.inputs["up"]) this.position.y += this.speed * deltaTime;
        if (this.inputs["down"]) this.position.y -= this.speed * deltaTime;
    }
}