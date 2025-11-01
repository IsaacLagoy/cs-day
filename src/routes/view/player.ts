import type { vec2, AABB } from '$lib/types'
import { GameObject } from './game_object'

const JUMP_HEIGHT = 15;
const GRAVITY = 32;

export class Player extends GameObject {
    clientId: string;
    role: string;
    speed: number;
    inputs: Record<string, boolean>;

    canJump: boolean = false;

    constructor(clientId: string, role: string, position: vec2 = {x: 0, y: 0}, color='#fc4444ff', speed = 5) {
        super(position, {x: 1, y: 1}, color);

        this.clientId = clientId;
        this.role = role;
        this.speed = speed;
        this.inputs = {};
    }

    update(deltaTime: number) {
        this.vel.x = this.speed * (Number(Boolean(this.inputs["right"])) - Number(Boolean(this.inputs["left"])));

        this.vel.y -= deltaTime * GRAVITY;

        if (this.inputs['jump'] && this.canJump) {
            this.vel.y += JUMP_HEIGHT;
            this.canJump = false;
        }

        // death planes
        if (this.position.y < -10 || this.position.y > 20) {
            this.respawn();
        }

        // bounding wall
        if (this.position.x < -10) {
            this.position.x = -10;
        }

        if (this.position.x > 10) {
            this.position.x = 10;
        }

        super.update(deltaTime);
    }

    respawn() {
        this.position = { x: -7.5, y: 7.5 };
        this.vel = { x: 0, y: 0};
    }
}