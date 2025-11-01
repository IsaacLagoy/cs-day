import type { vec2, AABB } from '$lib/types';

export function collide(a: AABB, b: AABB): boolean {
    if (a.topRight.x < b.bottomLeft.x || a.bottomLeft.x > b.topRight.x) {
        return false;
    }

    if (a.bottomLeft.y > b.topRight.y || a.topRight.y < b.bottomLeft.y) {
        return false;
    }

    return true;
}

export function getMTV(a: AABB, b: AABB, vel: vec2): vec2 {
    const ox1 = a.topRight.x - a.bottomLeft.x;
    const ox2 = b.topRight.x - a.bottomLeft.x;
    const oy1 = a.topRight.y - a.bottomLeft.y;
    const oy2 = b.topRight.y - a.bottomLeft.y;

    const px = Math.abs(ox1) < Math.abs(ox2) ? ox1 : ox2;
    const py = Math.abs(oy1) < Math.abs(oy2) ? oy1 : oy2;

    if (Math.abs(px) < Math.abs(py)) {
        vel.x = 0;
        return {x: px, y: 0};
    } else {
        vel.y = 0;
        return {x: 0, y: py};
    }
}
