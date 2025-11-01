import type { vec2, AABB } from '$lib/types';

export function collide(a: AABB, b: AABB): boolean {
    if (a.topRight.x < b.bottomLeft.x || a.bottomLeft.x > b.topRight.x) {
        return false;
    }

    if (a.bottomLeft.y < b.topRight.y || a.topRight.y > b.bottomLeft.y) {
        return false;
    }
    
    return true;
}