import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Side, Vector } from "excalibur";
import { ActorSignals } from "../Lib/CustomEmitterManager";
import { RoomActor } from "./room";
import { HallwayActor } from "./hallway";
import { playerColliderGroup } from "../Lib/colliderGroups";

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

export class Player extends Actor {
  lStick: StickPosition = StickPosition.Idle;
  rStick: StickPosition = StickPosition.Idle;
  speed: number = 200;

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

    ActorSignals.on("walkDown", data => (this.vel = new Vector(0, this.speed)));
    ActorSignals.on("walkUp", data => (this.vel = new Vector(0, -this.speed)));
    ActorSignals.on("walkLeft", data => (this.vel = new Vector(-this.speed, 0)));
    ActorSignals.on("walkRight", data => (this.vel = new Vector(this.speed, 0)));

    ActorSignals.on("walkDownLeft", data => (this.vel = new Vector(-this.speed, this.speed)));
    ActorSignals.on("walkDownRight", data => (this.vel = new Vector(this.speed, this.speed)));
    ActorSignals.on("walkUpLeft", data => (this.vel = new Vector(-this.speed, -this.speed)));
    ActorSignals.on("walkUpRight", data => (this.vel = new Vector(this.speed, -this.speed)));
    ActorSignals.on("idle", data => (this.vel = new Vector(0, 0)));
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    console.log("collision", other);
  }

  onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {}
}
