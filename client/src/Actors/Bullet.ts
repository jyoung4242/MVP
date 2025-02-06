import { Actor, Collider, CollisionContact, CollisionType, Color, Side, Vector } from "excalibur";
import { returnBullet } from "../Lib/ObjectPools";

export class Bullet extends Actor {
  bulletSpeed: number = 1000;
  constructor() {
    super({
      pos: Vector.Zero,
      radius: 1.5,
      collisionType: CollisionType.Passive,
      color: Color.Red,
    });
  }

  setBulletParams(pos: Vector, direction: Vector) {
    this.pos = pos;
    this.vel = direction.scale(this.bulletSpeed);
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    //remove from the scene
    this.scene?.remove(this);
    returnBullet(this);
  }
}
