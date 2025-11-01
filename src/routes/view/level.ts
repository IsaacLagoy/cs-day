import type { GameUpdateMessage, PlayerInputMessage, ConnectedClient, vec2, AABB } from '$lib/types'
import type { GameObject } from './game_object'


export class Level {
    objects: Array<GameObject>;

    constructor() {
        this.objects = [];
    }

    add (object: GameObject) {
        this.objects.push(object);
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        for (let index = 0; index < this.objects.length; index++) {
            this.objects[index].draw(ctx, width, height);
        }
    }
}