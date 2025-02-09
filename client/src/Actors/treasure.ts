import {
  ActionCompleteEvent,
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Color,
  Die,
  Engine,
  ScaleTo,
  ScreenElement,
  Side,
  vec,
  Vector,
} from "excalibur";
import { itemColliders } from "../Lib/colliderGroups";
import { GameScene } from "../Scenes/Game";
import { Player } from "./player";
import { RoomActor } from "./room";
import { PlayerUI } from "../UI/PlayerUI";
import { returnTreasure } from "../Lib/ObjectPools";

export class TreasureDetectionRing extends Actor {
  constructor(public owner: Treasure) {
    super({
      pos: vec(0, 0),
      radius: 20,
      collisionType: CollisionType.Passive,
      collisionGroup: itemColliders,
    });
  }
}

export class Treasure extends Actor {
  value: number = 0;
  isCollected = false;
  playerReference: Player | null = null;
  UITarget: PlayerUI | null = null;
  constructor() {
    super({
      pos: vec(0, 0),
      width: 12,
      height: 8,
      color: Color.fromHex("#600060"),
    });

    this.value = Math.floor(Math.random() * 100) + 1;
    this.addChild(new TreasureDetectionRing(this));
  }

  initTreasure(x: number, y: number) {
    this.pos = vec(x, y);
    this.isCollected = false;
  }

  resetTreasure() {
    this.value = Math.floor(Math.random() * 100) + 1;
    this.isCollected = false;
  }

  collect(player: Player) {
    this.UITarget = (this.scene as GameScene).screenUI;
    this.playerReference = player;
    this.isCollected = true;
  }

  onPreUpdate(engine: Engine, elapsed: number) {
    if (this.isCollected) {
      //get vector between player and UI
      let moveVector = getMoveVectorOfUI(this.UITarget as PlayerUI, this, this.scene as GameScene);
      if (!moveVector) {
        //update score
        (this.scene as GameScene).updateScore(this.playerReference!.score);
        returnTreasure(this);
        //remove from scene
        this.scene?.remove(this);
        return;
      }
      moveVector = moveVector!.normalize();
      this.pos = this.pos.add(moveVector.scale(20));
    }
  }
}

function getMoveVectorOfUI(uiId: ScreenElement, parentActor: Treasure, scene: GameScene): Vector | null {
  const UIWorldPos = scene.engine.screenToWorldCoordinates(vec(30, 30));
  const relVector = parentActor.getGlobalPos().sub(UIWorldPos).negate();
  if (relVector.x < 10 && relVector.x > -10 && relVector.y < 10 && relVector.y > -10) {
    return null;
  }
  return relVector;
}
