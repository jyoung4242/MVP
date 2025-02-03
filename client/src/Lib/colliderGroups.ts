import { CollisionGroup } from "excalibur";

export const playerColliderGroup = new CollisionGroup("player", 0b001, 0b110);
export const wallColliderGroup = new CollisionGroup("walls", 0b010, 0b001);
