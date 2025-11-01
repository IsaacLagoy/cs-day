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


// get a - b
export function getMTV(posA: vec2, posB: vec2, scaleA: vec2, scaleB: vec2): vec2 {
    const dx = posB.x - posA.x;
    const px = (scaleA.x + scaleB.x) - Math.abs(dx);

    if (px <= 0) return { x: 0, y: 0 }; // no overlap

    const dy = posB.y - posA.y;
    const py = (scaleA.y + scaleB.y) - Math.abs(dy);

    if (py <= 0) return { x: 0, y: 0 }; // no overlap

    // MTV is the smallest overlap axis, directed away from penetration
    if (px < py) {
        return { x: dx < 0 ? -px : px, y: 0 };
    } else {
        return { x: 0, y: dy < 0 ? -py : py };
    }
}
