import { Actor, CollisionType, Color } from "excalibur";

export class Key extends Actor {
  constructor() {
    super({
      x: 0 - 8,
      y: 0 - 8,
      width: 16,
      height: 16,
      collisionType: CollisionType.Passive,
      color: Color.Yellow,
    });
  }
}
