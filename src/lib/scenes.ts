// Shared scene info used by the host, view and controllers.
// Keep this in sync with scene_list in src/routes/view/view.logic.ts
// (the view logs a warning if they drift apart).

export type SceneStyle = 'default' | 'chicken';

// Number of entries in scene_list. Update this when adding or removing scenes
// so the host arrows stop at the right place.
export const NUM_SCENES = 29;

// Scene indexes that use the chicken style
const CHICKEN_SCENES = new Set([21, 22, 23, 24, 25, 26, 27, 28]);

export function sceneStyle(scene: number): SceneStyle {
  return CHICKEN_SCENES.has(scene) ? 'chicken' : 'default';
}
