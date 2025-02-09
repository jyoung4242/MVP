import { Actor, CollisionType, Color, Polygon, Shape, vec, Vector } from "excalibur";
import { enemyColliders } from "../Lib/colliderGroups";

export class Enemy extends Actor {
  constructor() {
    const collide = Shape.Polygon(
      [vec(8, 0), vec(15.61, 5.88), vec(12.94, 15.27), vec(3.06, 15.27), vec(0.39, 5.88)],
      vec(-8, -8),
      true
    );

    const myRaster = new Polygon({
      points: [vec(8, 0), vec(15.61, 5.88), vec(12.94, 15.27), vec(3.06, 15.27), vec(0.39, 5.88)],
      color: Color.Red,
    });

    super({
      pos: vec(0, 0),
      collider: collide,
      collisionType: CollisionType.Passive,
      collisionGroup: enemyColliders,
      z: 1,
      scale: vec(1.5, 1.5),
    });
    this.graphics.use(myRaster);
  }
  initEnemy(pos: Vector) {
    this.pos = pos;
  }

  resetEnemy() {
    this.pos = vec(0, 0);
  }
}
