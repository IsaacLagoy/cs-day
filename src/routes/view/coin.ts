import type { vec2, AABB } from '$lib/types'
import { GameObject } from './game_object'

export class Coin extends GameObject {
    collected: boolean = false;

    constructor(position: vec2 = {x: 0, y: 0}) {
        super(position, {x: 0.5, y: 0.5}, '#efe828ff');
    }

    update(deltaTime: number, do_gravity: boolean = true) {
        super.update(deltaTime);
    }

    respawn() {
        this.position = { x: -7.5, y: 7.5 };
        this.vel = { x: 0, y: 0};
    }
}