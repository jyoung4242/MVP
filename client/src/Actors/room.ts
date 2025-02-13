import {
  Actor,
  Color,
  Rectangle,
  Vector,
  Label,
  Font,
  Shape,
  CompositeCollider,
  CollisionType,
  vec,
  Collider,
  CollisionContact,
  Side,
  Trigger,
  TriggerEvents,
  TriggerOptions,
  ActorArgs,
  Ray,
  EasingFunctions,
} from "excalibur";
import { Room, RoomType } from "../Lib/levelBuilder";
import { doorZoneColliderGroup, wallColliderGroup } from "../Lib/colliderGroups";
import { Player } from "./player";
import { HallwayActor } from "./hallway";
import { Key } from "./Key";
import { Exit } from "./Exit";
import { GameScene } from "../Scenes/Game";
import { Treasure } from "./treasure";
import { getNextTreasure } from "../Lib/ObjectPools";

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
    if (other.owner instanceof Player) (this.parent as DoorSystem).openDoor(other.owner);
    //console.log("door zone collision", this.actorsOnTrigger);
  }

  onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    this.actorsOnTrigger = this.actorsOnTrigger.filter(actor => actor != other.owner);
    //console.log("door zone leaving ", this.actorsOnTrigger);
  }

  get blockedPassage(): boolean {
    //console.log("actors on trigger: ", this.actorsOnTrigger);

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

class DoorSystem extends Actor {
  door: Door;
  zone: DoorZone;
  isLocked: boolean = false;
  side: "left" | "right" | "top" | "bottom";
  doorcheckHandler: number;
  room: RoomActor;

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

    this.on("enter", data => {
      console.log("door entered", data);
    });

    this.doorcheckHandler = setInterval(() => this.checkDoor(), 1000);
  }

  openDoor(player: Player) {
    if (!this.hasHallway) return;
    if (this.door.lockState == "Locked" && player.keysInInventory > 0) {
      this.room.unlockDoors();
      player.keysInInventory--;
      (this.scene as GameScene).removeKey();
    } else if (this.door.lockState == "Locked" && player.keysInInventory == 0) return;
    this.door.open();
    this.door.doorState = "Open";
  }

  checkDoor() {
    if (this.door.doorState == "Closed") return;
    if (!this.zone.blockedPassage) {
      //console.log(this.zone.blockedPassage);

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
  roomType: RoomType;
  isLocked: boolean = false;

  constructor(room: Room) {
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
    this.isLocked = room.locked ? true : false;
    this.roomType = room.roomType;
    this.graphics.use(roomShape);
    this.roomId = room.roomID;

    let player = this.scene?.entities.find(e => e instanceof Player);

    let topDoor = new DoorSystem(this, "top");
    let bottomDoor = new DoorSystem(this, "bottom");
    let leftDoor = new DoorSystem(this, "left");
    let rightDoor = new DoorSystem(this, "right");

    this.addChild(topDoor);
    this.addChild(bottomDoor);
    this.addChild(leftDoor);
    this.addChild(rightDoor);

    //Lock doors if Boss or Treasure
    if (this.isLocked) {
      topDoor.lockDoor();
      bottomDoor.lockDoor();
      leftDoor.lockDoor();
      rightDoor.lockDoor();
    }

    if (room.roomType == RoomType.Treasure) {
      console.log("adding treasures");

      let numTreasures = Math.floor(Math.random() * 30) + 10;
      for (let i = 0; i < numTreasures; i++) {
        //find random spot in room
        let x = Math.floor(Math.random() * 575) + 75 - 350;
        let y = Math.floor(Math.random() * 400) + 75 - 250;
        let treasure = getNextTreasure();
        treasure.initTreasure(x, y);
        this.addChild(treasure);
      }
    }

    if (room.roomType == RoomType.Key) {
      let key = new Key();
      this.addChild(key);
    }

    if (room.roomType == RoomType.Exit) {
      let exit = new Exit();
      this.addChild(exit);
      console.log("adding exit");
    }
  }

  unlockDoors() {
    this.scene?.entities.forEach(actor => {
      if (actor instanceof DoorSystem) {
        (actor as DoorSystem).unlockDoor();
      }
    });
  }
}
