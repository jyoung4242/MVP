import {
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Color,
  Engine,
  EventEmitter,
  Side,
  Trigger,
  TriggerEvents,
  Vector,
} from "excalibur";
import { ActorSignals } from "../Lib/CustomEmitterManager";
import { playerColliderGroup } from "../Lib/colliderGroups";
import { Door, RoomActor } from "./room";
import { HallwayActor } from "./hallway";
import { getNextBullet } from "../Lib/ObjectPools";
import { Key } from "./Key";
import { GameScene } from "../Scenes/Game";
import { Treasure, TreasureDetectionRing } from "./treasure";
import { PlayerUI } from "../UI/PlayerUI";

enum StickPosition {
  "Left" = "Left",
  "Right" = "Right",
  "Idle" = "Idle",
  "Up" = "Up",
  "Down" = "Down",
  "UpLeft" = "upLeft",
  "UpRight" = "upRight",
  "DownLeft" = "downLeft",
  "DownRight" = "downRight",
}

type Direction = "Left" | "Right" | "Up" | "Down" | "upLeft" | "upRight" | "downLeft" | "downRight";
type direction = "Left" | "Right" | "Up" | "Down";

export class Player extends Actor {
  lStick: StickPosition = StickPosition.Idle;
  rStick: StickPosition = StickPosition.Idle;
  speed: number = 200;
  firingRate: number = 5;
  keypressDirections: direction[] = [];
  wallCollisionDirection: direction[] = [];
  isCollidingUp: boolean = false;
  isCollidingDown: boolean = false;
  isCollidingLeft: boolean = false;
  isCollidingRight: boolean = false;
  keysInInventory: number = 0;
  canOpenDoors: boolean = true;
  score: number = 0;

  constructor(pos: Vector) {
    super({
      radius: 16,
      pos: pos,
      color: Color.White,
      collisionType: CollisionType.Passive,
      collisionGroup: playerColliderGroup,
    });
  }

  onInitialize(engine: Engine): void {
    ActorSignals.on("leftStickDown", data => (this.lStick = StickPosition.Down));
    ActorSignals.on("leftStickUp", data => (this.lStick = StickPosition.Up));
    ActorSignals.on("leftStickLeft", data => (this.lStick = StickPosition.Left));
    ActorSignals.on("leftStickRight", data => (this.lStick = StickPosition.Right));
    ActorSignals.on("leftStickDownLeft", data => (this.lStick = StickPosition.DownLeft));
    ActorSignals.on("leftStickDownRight", data => (this.lStick = StickPosition.DownRight));
    ActorSignals.on("leftStickUpLeft", data => (this.lStick = StickPosition.UpLeft));
    ActorSignals.on("leftStickUpRight", data => (this.lStick = StickPosition.UpRight));
    ActorSignals.on("leftStickIdle", data => (this.lStick = StickPosition.Idle));

    ActorSignals.on("rightStickDown", data => (this.rStick = StickPosition.Down));
    ActorSignals.on("rightStickUp", data => (this.rStick = StickPosition.Up));
    ActorSignals.on("rightStickLeft", data => (this.rStick = StickPosition.Left));
    ActorSignals.on("rightStickRight", data => (this.rStick = StickPosition.Right));
    ActorSignals.on("rightStickDownLeft", data => (this.rStick = StickPosition.DownLeft));
    ActorSignals.on("rightStickDownRight", data => (this.rStick = StickPosition.DownRight));
    ActorSignals.on("rightStickUpLeft", data => (this.rStick = StickPosition.UpLeft));
    ActorSignals.on("rightStickUpRight", data => (this.rStick = StickPosition.UpRight));
    ActorSignals.on("rightStickIdle", data => (this.rStick = StickPosition.Idle));
    ActorSignals.on("keypressChanged", data => {
      this.keypressDirections = [];
      this.keypressDirections = [...(data.keypress as direction[])];
    });
    ActorSignals.on("idle", data => {
      this.keypressDirections = [];
      this.lStick = StickPosition.Idle;
    });
  }

  addCollisionToArray(side: direction) {
    //check for collision not existing in array
    if (!this.wallCollisionDirection.includes(side)) {
      this.wallCollisionDirection.push(side);
    }
  }

  removeCollisionFromArray(side: direction) {
    if (this.wallCollisionDirection.includes(side)) {
      this.wallCollisionDirection.splice(this.wallCollisionDirection.indexOf(side), 1);
    }
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof RoomActor || other.owner instanceof Door || other.owner instanceof HallwayActor) {
      switch (side) {
        case Side.Top:
          this.addCollisionToArray("Down");
          break;
        case Side.Bottom:
          this.addCollisionToArray("Up");
          break;
        case Side.Left:
          this.addCollisionToArray("Right");
          break;
        case Side.Right:
          this.addCollisionToArray("Left");
          break;
      }
    }

    if (other.owner instanceof Key) {
      other.owner.kill();
      this.keysInInventory++;
      (this.scene as GameScene).addKey();
      //((this.scene as GameScene).screenUI as PlayerUI).addKey();
    }

    if (other.owner instanceof TreasureDetectionRing) {
      this.score += other.owner.owner.value;
      console.log("calling collect");
      other.owner.owner.collect(this);
    }
  }

  onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof RoomActor || other.owner instanceof Door || other.owner instanceof HallwayActor) {
      switch (side) {
        case Side.Top:
          this.removeCollisionFromArray("Down");
          break;
        case Side.Bottom:
          this.removeCollisionFromArray("Up");
          break;
        case Side.Left:
          this.removeCollisionFromArray("Right");
          break;
        case Side.Right:
          this.removeCollisionFromArray("Left");
          break;
      }
    }
  }

  onPreUpdate(engine: Engine, delta: number): void {
    if (this.keypressDirections.length > 1) {
      if (this.keypressDirections.includes("Up") && this.keypressDirections.includes("Left")) this.lStick = StickPosition.UpLeft;
      if (this.keypressDirections.includes("Up") && this.keypressDirections.includes("Right")) this.lStick = StickPosition.UpRight;
      if (this.keypressDirections.includes("Down") && this.keypressDirections.includes("Left")) this.lStick = StickPosition.DownLeft;
      if (this.keypressDirections.includes("Down") && this.keypressDirections.includes("Right")) this.lStick = StickPosition.DownRight;
    } else if (this.keypressDirections.length == 1) {
      if (this.keypressDirections.includes("Up")) this.lStick = StickPosition.Up;
      if (this.keypressDirections.includes("Down")) this.lStick = StickPosition.Down;
      if (this.keypressDirections.includes("Left")) this.lStick = StickPosition.Left;
      if (this.keypressDirections.includes("Right")) this.lStick = StickPosition.Right;
    }

    if (this.lStick != "Idle") {
      switch (this.lStick) {
        case "Left":
          if (!this.wallCollisionDirection.includes("Right")) this.vel = new Vector(-this.speed, 0);
          else this.vel = new Vector(0, 0);
          break;
        case "Right":
          if (!this.wallCollisionDirection.includes("Left")) this.vel = new Vector(this.speed, 0);
          else this.vel = new Vector(0, 0);
          break;
        case "Up":
          if (!this.wallCollisionDirection.includes("Down")) this.vel = new Vector(0, -this.speed);
          else this.vel = new Vector(0, 0);
          break;
        case "Down":
          if (!this.wallCollisionDirection.includes("Up")) this.vel = new Vector(0, this.speed);
          else this.vel = new Vector(0, 0);
          break;
        case "upLeft":
          this.vel = new Vector(-this.speed, -this.speed);
          if (this.wallCollisionDirection.includes("Right")) this.vel.x = 0;
          if (this.wallCollisionDirection.includes("Down")) this.vel.y = 0;
          break;
        case "downLeft":
          this.vel = new Vector(-this.speed, this.speed);
          if (this.wallCollisionDirection.includes("Right")) this.vel.x = 0;
          if (this.wallCollisionDirection.includes("Up")) this.vel.y = 0;
          break;
        case "upRight":
          this.vel = new Vector(this.speed, -this.speed);
          if (this.wallCollisionDirection.includes("Left")) this.vel.x = 0;
          if (this.wallCollisionDirection.includes("Down")) this.vel.y = 0;
          break;

        case "downRight":
          this.vel = new Vector(this.speed, this.speed);
          if (this.wallCollisionDirection.includes("Left")) this.vel.x = 0;
          if (this.wallCollisionDirection.includes("Up")) this.vel.y = 0;
          break;

        default:
          break;
      }
    } else {
      this.vel = Vector.Zero;
    }

    if (this.rStick != "Idle") {
      let bullet = getNextBullet();
      bullet.setBulletParams(this.pos, convertStickToVector(this.rStick));
      engine.add(bullet);
    }
  }
}

function convertStickToVector(dir: StickPosition): Vector {
  switch (dir) {
    case StickPosition.Up:
      return new Vector(0, -1);
    case StickPosition.Down:
      return new Vector(0, 1);
    case StickPosition.Left:
      return new Vector(-1, 0);
    case StickPosition.Right:
      return new Vector(1, 0);
    case StickPosition.UpLeft:
      return new Vector(-1, -1);
    case StickPosition.UpRight:
      return new Vector(1, -1);
    case StickPosition.DownLeft:
      return new Vector(-1, 1);
    case StickPosition.DownRight:
      return new Vector(1, 1);
  }
  return Vector.Zero;
}
