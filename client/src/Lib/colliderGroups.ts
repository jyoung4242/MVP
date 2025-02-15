import { CollisionGroup } from "excalibur";

export const playerColliderGroup = new CollisionGroup("player", 0b001, 0b1110110);
export const wallColliderGroup = new CollisionGroup("walls", 0b010, 0b011);
export const doorZoneColliderGroup = new CollisionGroup("doors", 0b100, 0b011);
export const playerBulletColliderGroup = new CollisionGroup("playerBullet", 0b1000, 0b1010110);
export const enemyBulletColliderGroup = new CollisionGroup("enemyBullet", 0b10000, 0b00111);
export const itemColliders = new CollisionGroup("item", 0b100000, 0b000001);
export const enemyColliders = new CollisionGroup("enemy", 0b1000000, 0b001011);
