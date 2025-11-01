import type { vec2, AABB } from '$lib/types'
import { GameObject } from './game_object'

export class MovingPlatform extends GameObject {
    start_position: vec2;
    end_position: vec2;
    duration: number;
    time: number;

    constructor(start_position: vec2, end_position: vec2, duration: number=1, scale: vec2 = {x: 1, y: 1}, color: string="#4400ffff") {
        super({x: start_position.x, y: start_position.y}, {x: scale.x, y: scale.y}, color)

        this.start_position = start_position;
        this.end_position = end_position;
        this.duration = duration;
        this.time = 0;
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        
        this.time += deltaTime;

        let t = (Math.cos((this.time / this.duration) * Math.PI * 2) * -0.5) + 0.5;
        
        let interpolated_position = {
            x: this.start_position.x + (this.end_position.x - this.start_position.x) * t,
            y: this.start_position.y + (this.end_position.y - this.start_position.y) * t
        };

        this.position.x = interpolated_position.x;
        this.position.y = interpolated_position.y;
    }
}