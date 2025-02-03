import { CollisionGroup } from "../HeadlessEx";

/*
bitmask notes
first bitmask is identifying bmask (upto 32)
second bitmask is mask where 1 means to collide with group
and 0 means to ignore
*/

export const playerCollider = new CollisionGroup("player", 0b0001, 0b110111);
export const enemyCollider = new CollisionGroup("enemy", 0b0010, 0b01111);
export const wallsCollider = new CollisionGroup("walls", 0b0100, 0b0000);
export const playerBulletCollider = new CollisionGroup("playerBullet", 0b1000, 0b0000);
export const enemyBulletCollider = new CollisionGroup("enemyBullet", 0b10000, 0b0101);
export const interactiveObjectCollider = new CollisionGroup("interactiveObject", 0b100000, 0b001001);
