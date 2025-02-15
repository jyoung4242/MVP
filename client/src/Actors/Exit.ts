import { Actor, Collider, CollisionContact, CollisionType, Color, Font, Label, Polygon, Shape, Side, vec, Vector } from "excalibur";
import { itemColliders } from "../Lib/colliderGroups";
import { GameScene } from "../Scenes/Game";
import { Player } from "./player";

export class Exit extends Actor {
  constructor() {
    const collide = Shape.Polygon(
      //[vec(16, 8), vec(12, 14.93), vec(4, 14.93), vec(0, 8), vec(4, 1.07), vec(12, 1.07)],
      [vec(32, 16), vec(24, 29.8), vec(8, 29.8), vec(0, 16), vec(8, 2.14), vec(24, 2.14)],
      vec(-16, -16),
      true
    );

    const myRaster = new Polygon({
      points: [vec(32, 16), vec(24, 29.8), vec(8, 29.8), vec(0, 16), vec(8, 2.14), vec(24, 2.14)],
      color: Color.Orange,
    });

    super({
      pos: Vector.Zero,
      collider: collide,
      collisionType: CollisionType.Passive,
      collisionGroup: itemColliders,
      z: 1,
    });

    this.graphics.use(myRaster);

    const label = new Label({
      text: "Exit",
      font: new Font({
        family: "Arial",
        size: 10,
        color: Color.Black,
      }),
      offset: vec(-10, -6),
      z: 2,
    });

    this.addChild(label);
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof Player) {
      const keyboard = (this.scene as GameScene).kboard;
      const mouse = (this.scene as GameScene).mouse;
      const gamepad = (this.scene as GameScene).gpad;
      const finalTimeOfLevel = (this.scene as GameScene).uiinstance.LevelTimer;
      const finalScore = (this.scene as GameScene).uiinstance.P1Score;
      (this.scene as GameScene).engine.goToScene("final", {
        sceneActivationData: { gamepad, keyboard, mouse, levelTime: finalTimeOfLevel, score: finalScore },
      });
    }
  }
}
