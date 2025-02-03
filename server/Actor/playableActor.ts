import { Types } from "@geckos.io/snapshot-interpolation";
import { Actor, Collider, CollisionContact, CollisionType, Random, Side, Vector } from "../HeadlessEx";
import { UUID } from "../Lib/UUID";
import { direction } from "../Types/types";
import { playerCollider } from "../Colliders/colliders";

export class PlayableActor extends Actor {
  private _userId: string;
  private _directions: direction[] = [];
  private _position: Types.Quat = { x: 0, y: 0, z: 0, w: 0 };
  public uuid: string = UUID.generateUUID();
  private _isColliding: { status: boolean; other: Collider | null; collisionDirection: Side | null } = {
    status: false,
    other: null,
    collisionDirection: null,
  };

  constructor(userId: string, private rng: Random, pos: Vector) {
    super({
      name: userId,
      pos,
      width: 16,
      height: 16,
      collisionGroup: playerCollider,
      collisionType: CollisionType.Passive,
    });
    this._userId = userId;
  }

  get userId(): string {
    return this._userId;
  }

  // collision code

  public onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {}
  public onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {}
  get isColliding(): { status: boolean; other: Collider | null; collisionDirection: Side | null } {
    return this._isColliding;
  }
  
  // Positions getter/setter

  get position(): Types.Quat {
    return this._position;
  }

  set position(position: Types.Quat) {
    this._position = position;
  }

  // Direction getter/setter
  get directions(): direction[] {
    return this._directions;
  }

  setDirections(direction: direction) {
    if (this._directions.includes(direction)) return;
    this._directions.push(direction);
  }

  clearDirection(direction: direction) {
    if (this._directions.includes(direction)) this._directions.splice(this._directions.indexOf(direction), 1);
  }
}
