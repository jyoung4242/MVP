import {
  Actor,
  Color,
  Rectangle,
  Vector,
  Shape,
  CompositeCollider,
  CollisionType,
  vec,
  Collider,
  CollisionContact,
  Side,
  ActorArgs,
  EasingFunctions,
  Engine,
} from "excalibur";
import { Room, RoomType } from "../Lib/levelBuilder";
import { doorZoneColliderGroup, wallColliderGroup } from "../Lib/colliderGroups";
import { Player } from "./player";
import { HallwayActor } from "./hallway";
import { GameScene } from "../Scenes/Game";
import { RoomManager } from "../Lib/RoomManager";
import { ActorSignals } from "../Lib/CustomEmitterManager";
import { getNextEnemy } from "../Lib/ObjectPools";

class DoorZone extends Actor {
  private _isColliding: boolean = false;
  actorsOnTrigger: (Player | HallwayActor)[] = [];
  room: RoomActor;
  constructor(room: RoomActor, config: ActorArgs) {
    super(config);
    this.room = room;
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof Player || other.owner instanceof HallwayActor) this.actorsOnTrigger.push(other.owner);
    if (other.owner instanceof Player) ActorSignals.emit("doorTrigger", { doorSystem: this.parent, player: other.owner });
  }

  onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    this.actorsOnTrigger = this.actorsOnTrigger.filter(actor => actor != other.owner);
  }

  get blockedPassage(): boolean {
    return this.actorsOnTrigger.length > 0;
  }

  get hasHallway(): boolean {
    return this.actorsOnTrigger.some(actor => actor instanceof HallwayActor);
  }
}

export class Door extends Actor {
  _doorState: "Open" | "Closed" | "Moving" = "Closed";
  _lockState: "Locked" | "Unlocked" = "Unlocked";
  _side: "left" | "right" | "top" | "bottom";
  _shape: Shape;

  constructor(side: "left" | "right" | "top" | "bottom") {
    let doorShape;
    let doorDims;

    if (side == "left" || side == "right") {
      doorShape = new Rectangle({ width: 25, height: 200, color: Color.fromHex("#000080"), strokeColor: Color.White });
      doorDims = { width: 25, height: 200 };
    } else {
      doorDims = { width: 200, height: 25 };
      doorShape = new Rectangle({ width: 200, height: 25, color: Color.fromHex("#000080"), strokeColor: Color.White });
    }

    super({
      width: doorDims.width,
      height: doorDims.height,
      collisionType: CollisionType.Passive,
      collisionGroup: wallColliderGroup,
    });
    this._shape = doorShape;
    this._side = side;
    this.graphics.use(doorShape);
  }

  // TODO refactor to add moving state

  open() {
    if (this._doorState == "Open") return;
    if (this._side == "left" || this._side == "right") {
      this.actions.easeBy(0, -this.height, 500, EasingFunctions.EaseInOutCubic);
    } else {
      this.actions.easeBy(-this.width, 0, 500, EasingFunctions.EaseInOutCubic);
    }
  }

  close() {
    if (this._doorState == "Closed") return;
    if (this._side == "left" || this._side == "right") {
      this.actions.easeBy(0, this.height, 500, EasingFunctions.EaseInOutCubic);
    } else {
      this.actions.easeBy(this.width, 0, 500, EasingFunctions.EaseInOutCubic);
    }
  }

  get doorState(): "Open" | "Closed" | "Moving" {
    return this._doorState;
  }

  set doorState(state: "Open" | "Closed" | "Moving") {
    this._doorState = state;
  }

  get lockState(): "Locked" | "Unlocked" {
    return this._lockState;
  }

  set lockState(state: "Locked" | "Unlocked") {
    this._lockState = state;
    let doorShape;
    if (state == "Locked") {
      if (this._side == "left" || this._side == "right") {
        doorShape = new Rectangle({ width: 25, height: 200, color: Color.fromHex("#800000"), strokeColor: Color.White });
      } else {
        doorShape = new Rectangle({ width: 200, height: 25, color: Color.fromHex("#800000"), strokeColor: Color.White });
      }
      this.graphics.use(doorShape);
    } else {
      if (this._side == "left" || this._side == "right") {
        doorShape = new Rectangle({ width: 25, height: 200, color: Color.fromHex("#000080"), strokeColor: Color.White });
      } else {
        doorShape = new Rectangle({ width: 200, height: 25, color: Color.fromHex("#000080"), strokeColor: Color.White });
      }
      this.graphics.use(doorShape);
    }
  }
}

export class DoorSystem extends Actor {
  door: Door;
  zone: DoorZone;
  isLocked: boolean = false;
  side: "left" | "right" | "top" | "bottom";
  doorcheckHandler: number;
  room: RoomActor;
  roomManager: RoomManager;

  constructor(room: RoomActor, side: "left" | "right" | "top" | "bottom") {
    let doorPosition;
    if (side == "left" || side == "right") {
      if (side == "left") doorPosition = new Vector(-340, 0);
      else doorPosition = new Vector(340, 0);
    } else {
      if (side == "top") doorPosition = new Vector(0, -240);
      else doorPosition = new Vector(0, 240);
    }
    super({ pos: doorPosition });
    this.roomManager = room.roomManager;
    this.room = room;
    this.side = side;
    this.door = new Door(side);
    this.addChild(this.door);

    if (side == "top" || side == "bottom") {
      let trigOptions: ActorArgs = {
        pos: new Vector(0, 0),
        width: this.door.width - 25,
        height: this.door.height + 65,
        collisionType: CollisionType.Passive,
        collisionGroup: doorZoneColliderGroup,
      };
      this.zone = new DoorZone(room, trigOptions);
    } else {
      let trigOptions: ActorArgs = {
        pos: new Vector(0, 0),
        width: this.door.width + 65,
        height: this.door.height - 25,
        visible: false,
        collisionType: CollisionType.Passive,
        collisionGroup: doorZoneColliderGroup,
      };
      this.zone = new DoorZone(room, trigOptions);
    }

    this.addChild(this.zone);

    //Door closing logic
    this.doorcheckHandler = setInterval(() => this.checkDoor(), 1000);
  }

  checkDoor() {
    if (this.door.doorState == "Closed") return;
    if (!this.zone.blockedPassage) {
      setTimeout(() => {
        this.closeDoor();
        this.door.doorState = "Closed";
      }, 1000);
    }
  }

  closeDoor() {
    this.door.close();
    this.door.doorState = "Closed";
  }

  lockDoor() {
    this.door.lockState = "Locked";
  }

  unlockDoor() {
    this.door.lockState = "Unlocked";
  }

  get hasHallway(): boolean {
    let raySide: Vector = vec(0, 0);
    if (this.side == "left") raySide = Vector.Left;
    else if (this.side == "right") raySide = Vector.Right;
    else if (this.side == "top") raySide = Vector.Up;
    else if (this.side == "bottom") raySide = Vector.Down;

    //get point 50 pixels from door
    let startingpoint = this.getGlobalPos();

    //find position 50 px away in raySide direction
    let rayPoint = startingpoint.add(raySide.scale(50));

    let hasHallway;
    this.scene?.entities.forEach(actor => {
      if (actor instanceof HallwayActor) {
        if ((actor as HallwayActor).isPointInHallway(rayPoint)) {
          hasHallway = true;
        }
      }
    });
    return hasHallway ?? false;
  }
}

export class RoomActor extends Actor {
  roomId: string;
  roomManager: RoomManager;

  constructor(room: Room, level: number) {
    let roomX = room.roomPos.x * 700 + room.roomPos.x * 500 + 350;
    let roomY = room.roomPos.y * 500 + room.roomPos.y * 500 + 250;
    let roomShape = new Rectangle({ width: 700, height: 500, color: Color.DarkGray, strokeColor: Color.White });

    const topEdgeColliderLeft = Shape.Box(250, 15, Vector.Half, vec(-225, -260));
    const topEdgeColliderRight = Shape.Box(250, 15, Vector.Half, vec(225, -260));
    const leftEdgeColliderTop = Shape.Box(15, 165, Vector.Half, vec(-360, -185));
    const leftEdgeColliderBottom = Shape.Box(15, 165, Vector.Half, vec(-360, 185));
    const rightEdgeColliderTop = Shape.Box(15, 165, Vector.Half, vec(360, -185));
    const rightEdgeColliderBottom = Shape.Box(15, 165, Vector.Half, vec(360, 185));
    const bottomEdgeColliderLeft = Shape.Box(250, 15, Vector.Half, vec(-225, 260));
    const bottomEdgeColliderRight = Shape.Box(250, 15, Vector.Half, vec(225, 260));
    const compCollider = new CompositeCollider([
      topEdgeColliderLeft,
      topEdgeColliderRight,
      leftEdgeColliderTop,
      leftEdgeColliderBottom,
      rightEdgeColliderTop,
      rightEdgeColliderBottom,
      bottomEdgeColliderLeft,
      bottomEdgeColliderRight,
    ]);

    compCollider.compositeStrategy = "separate";
    super({
      pos: new Vector(roomX, roomY),
      collider: compCollider,
      collisionType: CollisionType.Passive,
      collisionGroup: wallColliderGroup,
    });

    this.roomManager = new RoomManager(this, room.roomType, level, room.locked ? true : false);
    this.graphics.use(roomShape);
    this.roomId = room.roomID;

    let topDoor = new DoorSystem(this, "top");
    let bottomDoor = new DoorSystem(this, "bottom");
    let leftDoor = new DoorSystem(this, "left");
    let rightDoor = new DoorSystem(this, "right");

    this.addChild(topDoor);
    this.addChild(bottomDoor);
    this.addChild(leftDoor);
    this.addChild(rightDoor);

    this.roomManager.initialize({ leftDoor, rightDoor, topDoor, bottomDoor });
  }

  onInitialize(engine: Engine): void {
    if (this.roomManager.type == RoomType.Start) {
      let enemy = getNextEnemy();
      enemy.initEnemy(vec(250, 200), this);
      this.addActor(enemy);
    }
  }

  addActor(act: Actor) {
    this.addChild(act);
  }

  removeActor(act: Actor) {
    this.removeChild(act);
  }

  containsActor(ent: Actor) {
    let point = ent.pos;
    if (point.x < this.pos.x + 350 && point.x > this.pos.x - 350 && point.y < this.pos.y + 250 && point.y > this.pos.y - 250)
      return true;
    return false;
  }
}
