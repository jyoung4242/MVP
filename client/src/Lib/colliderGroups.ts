import { CollisionGroup } from "excalibur";

export const playerColliderGroup = new CollisionGroup("player", 0b001, 0b110);
export const wallColliderGroup = new CollisionGroup("walls", 0b010, 0b001);
export const doorZoneColliderGroup = new CollisionGroup("doors", 0b100, 0b011);
export const playerBulletColliderGroup = new CollisionGroup("playerBullet", 0b1000, 0b10110);
export const enemyColliderGroup = new CollisionGroup("enemyBullet", 0b10000, 0b00111);
