import { Actor, CollisionType, Color, CompositeCollider, Font, Label, Rectangle, Shape, toRadians, vec, Vector } from "excalibur";
import { Edge, Room } from "../Lib/levelBuilder";
import { wallColliderGroup } from "../Lib/colliderGroups";

export class HallwayActor extends Actor {
  constructor(edge: Edge, rooms: Room[]) {
    const { pos, rotation } = findHallwayPosition(edge, rooms);
    const topEdgeCollider = Shape.Box(15, 510, Vector.Half, vec(-110, 0));
    const bottomEdgeCollider = Shape.Box(15, 510, Vector.Half, vec(110, 0));
    const compCollider = new CompositeCollider([topEdgeCollider, bottomEdgeCollider]);
    compCollider.compositeStrategy = "separate";

    super({
      pos,
      rotation,
      opacity: 0.5,
      collider: compCollider,
      collisionType: CollisionType.Passive,
      collisionGroup: wallColliderGroup,
    });
    this.name = "hallway #" + this.id;
    let hallwayShape = new Rectangle({ width: 200, height: 500, color: Color.Gray, strokeColor: Color.White });
    this.graphics.use(hallwayShape);
  }

  isPointInHallway(point: Vector): boolean {
    if (this.rotation == toRadians(0) || this.rotation == toRadians(180)) {
      if (point.x < this.pos.x + 100 && point.x > this.pos.x - 100 && point.y < this.pos.y + 250 && point.y > this.pos.y - 250) {
        return true;
      }
    } else if (this.rotation == toRadians(90) || this.rotation == toRadians(270)) {
      if (point.x < this.pos.x + 250 && point.x > this.pos.x - 250 && point.y < this.pos.y + 100 && point.y > this.pos.y - 100) {
        return true;
      }
    }

    return false;
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
