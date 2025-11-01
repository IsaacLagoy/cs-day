import type { vec2, AABB } from '$lib/types'
import { GameObject } from './game_object'

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
        this.vel.x = this.speed * (Number(Boolean(this.inputs["right"])) - Number(Boolean(this.inputs["left"])));
        this.vel.y = this.speed * (Number(Boolean(this.inputs["up"])) - Number(Boolean(this.inputs["down"])));

        super.update(deltaTime);
    }
}