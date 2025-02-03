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
  ColliderComponent,
} from "excalibur";
import { Room } from "../Lib/levelBuilder";
import { wallColliderGroup } from "../Lib/colliderGroups";
import { ColliderChild } from "../Lib/colliderChild";

let roomShape = new Rectangle({ width: 700, height: 500, color: Color.DarkGray, strokeColor: Color.White });

const topEdgeCollider = Shape.Box(700, 10, Vector.Half, Vector.Zero);
const leftEdgeCollider = Shape.Box(10, 500, Vector.Half, Vector.Zero);
const rightEdgeCollider = Shape.Box(10, 500, Vector.Half, Vector.Zero);
const bottomEdgeCollider = Shape.Box(700, 10, Vector.Half, Vector.Zero);
const compCollider = new CompositeCollider([topEdgeCollider, leftEdgeCollider, rightEdgeCollider, bottomEdgeCollider]);

export class RoomActor extends Actor {
  roomId: string;

  constructor(room: Room) {
    let roomX = room.roomPos.x * 700 + room.roomPos.x * 500 + 350;
    let roomY = room.roomPos.y * 500 + room.roomPos.y * 500 + 250;
    console.log(roomX, roomY);

    super({
      pos: new Vector(roomX, roomY),
      collider: compCollider,
      collisionType: CollisionType.Passive,
    });
    this.graphics.use(roomShape);

    //#region Room Text
    //*************************
    // Room Text for Debug
    //**************************/
    this.roomId = room.roomID;
    /* let roomtext = `index: ${room.index}, type: ${room.roomType}`;

    let text = new Label({
      text: roomtext,
      font: new Font({
        family: "Arial",
        size: 20,
        color: Color.White,
      }),
    });
    this.addChild(text); */
    //#endregion
  }
}
