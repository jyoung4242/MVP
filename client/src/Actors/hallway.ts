import { Actor, CollisionType, Color, Font, Label, Rectangle, toRadians, Vector } from "excalibur";
import { Edge, Room } from "../Lib/levelBuilder";
import { wallColliderGroup } from "../Lib/colliderGroups";

let hallwayShape = new Rectangle({ width: 200, height: 500, color: Color.Gray, strokeColor: Color.White });

export class HallwayActor extends Actor {
  constructor(edge: Edge, rooms: Room[]) {
    const { pos, rotation } = findHallwayPosition(edge, rooms);
    super({
      width: 200,
      height: 500,
      pos,
      rotation,
      opacity: 0.5,
      collisionType: CollisionType.Passive,
      collisionGroup: wallColliderGroup,
    });
    this.graphics.use(hallwayShape);

    let roomtext = `from: ${edge.from.index}, to: ${edge.to.index}`;

    let text = new Label({
      text: roomtext,
      font: new Font({
        family: "Arial",
        size: 20,
        color: Color.White,
      }),
    });

    this.addChild(text);
  }
}

function findHallwayPosition(edge: Edge, rooms: Room[]): { pos: Vector; rotation: number } {
  // find the 2 rooms that are connected by this edge
  const room1 = rooms.find(room => room.roomID === edge.from.roomID)!;
  const room2 = rooms.find(room => room.roomID === edge.to.roomID)!;

  let roomDirection = directionOfRoom(room1, room2);

  let pos: Vector = new Vector(0, 0);
  let angle: number = 0;

  //room width = 700, height = 500
  let roomX = room1.roomPos.x * 700 + room1.roomPos.x * 500 + 350;
  let roomY = room1.roomPos.y * 500 + room1.roomPos.y * 500 + 250;

  switch (roomDirection) {
    case "up":
      pos = new Vector(roomX, roomY - 500);
      angle = toRadians(90);
      break;
    case "down":
      pos = new Vector(roomX, roomY + 500);
      angle = toRadians(90);
      break;
    case "left":
      pos = new Vector(roomX - (350 + 250), roomY);
      break;
    case "right":
      pos = new Vector(roomX + (350 + 250), roomY);
      break;
  }

  // find the rotation of the hallway
  const rotation = angle + Math.PI / 2;

  return {
    pos,
    rotation,
  };
}

function directionOfRoom(room1: Room, room2: Room): "up" | "down" | "left" | "right" {
  if (room1.roomPos.y < room2.roomPos.y) return "down";
  if (room1.roomPos.y > room2.roomPos.y) return "up";
  if (room1.roomPos.x < room2.roomPos.x) return "right";
  return "left";
}
