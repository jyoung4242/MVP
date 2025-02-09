import { Canvas, Color, Engine, GraphicsGroup, Rectangle, ScreenElement, toRadians, vec, Vector } from "excalibur";
import { Edge, Room } from "../Lib/levelBuilder";

const mmBorder = new Rectangle({ width: 300, height: 300, color: Color.fromHex("#F5F5DC"), strokeColor: Color.White });

type MinimapRoom = {
  color: Color;
  type: "key" | "exit" | "boss" | "treasure" | "general" | "start";
  x: number;
  y: number;
  locked: boolean;
};

type MinimapHallway = {
  from: Room;
  direction: "left" | "right" | "top" | "bottom";
};

export class MiniMap extends ScreenElement {
  rooms: MinimapRoom[] = [];
  hallways: MinimapHallway[] = [];
  cnv: Canvas;
  firstime: boolean = true;
  mapsize: { width: number; height: number } = { width: 0, height: 0 };
  constructor() {
    super({
      width: 250,
      height: 250,
    });

    let SRoffset = new Vector(0, 0);

    this.cnv = new Canvas({
      scale: this.scale,
      width: 250,
      height: 250,
      cache: false,
      draw: ctx => {
        let numRooms = this.rooms.length;
        let ROOM_SIZE = 25; // Room size in pixels
        let HALLWAY_WIDTH = 5; // Hallway width
        let HALLWAY_LENGTH = 10; // Hallway length in pixels
        if (numRooms == 0) return;

        if (this.mapsize.width >= 6 || this.mapsize.height >= 6) {
          ROOM_SIZE = 12;
          HALLWAY_WIDTH = 3;
          HALLWAY_LENGTH = 5;
        } else if (this.mapsize.width >= 4 || this.mapsize.height >= 4) {
          ROOM_SIZE = 15;
          HALLWAY_WIDTH = 4;
          HALLWAY_LENGTH = 7.5;
        }

        ctx.clearRect(0, 0, 250, 250);
        let startingRoomPos = new Vector(this.rooms[0].x, this.rooms[0].y);

        //draw hallways
        this.hallways.forEach(hallway => {
          let x, y, width, height;

          ctx.strokeStyle = Color.White.toString();
          ctx.lineWidth = 5;
          ctx.beginPath();

          let fromRoom = hallway.from;

          let roomPos = new Vector(fromRoom.roomPos.x, fromRoom.roomPos.y);

          let roomXoffset = roomPos.x - startingRoomPos.x;
          let roomYoffset = roomPos.y - startingRoomPos.y;

          switch (hallway.direction) {
            case "left":
              x = 125 - ROOM_SIZE / 2 + roomXoffset * (ROOM_SIZE + 5) - HALLWAY_LENGTH;
              y = 125 - ROOM_SIZE / 2 + roomYoffset * (ROOM_SIZE + 5) + ROOM_SIZE / 2 - HALLWAY_WIDTH / 2;

              width = HALLWAY_LENGTH;
              height = HALLWAY_WIDTH;

              break;
            case "right":
              x = 125 - ROOM_SIZE / 2 + roomXoffset * (ROOM_SIZE + 5) + ROOM_SIZE;
              y = 125 - ROOM_SIZE / 2 + roomYoffset * (ROOM_SIZE + 5) + (ROOM_SIZE / 2 - HALLWAY_WIDTH / 2);
              width = HALLWAY_LENGTH;
              height = HALLWAY_WIDTH;

              break;
            case "top":
              x = 125 - ROOM_SIZE / 2 + roomXoffset * (ROOM_SIZE + 5) + ROOM_SIZE / 2 - HALLWAY_WIDTH / 2;
              y = 125 - ROOM_SIZE / 2 + roomYoffset * (ROOM_SIZE + 5) - HALLWAY_LENGTH;

              width = HALLWAY_WIDTH;
              height = HALLWAY_LENGTH;

              break;
            case "bottom":
              x = 125 - ROOM_SIZE / 2 + roomXoffset * (ROOM_SIZE + 5) + ROOM_SIZE / 2 - HALLWAY_WIDTH / 2;
              y = 125 - ROOM_SIZE / 2 + roomYoffset * (ROOM_SIZE + 5) + ROOM_SIZE;
              width = HALLWAY_WIDTH;
              height = HALLWAY_LENGTH;

              break;
          }

          ctx.moveTo(x, y);
          ctx.rect(x, y, width, height);
          ctx.stroke();

          //Draw rooms first, with first room being the start room and in the middle o fthe canvas
          this.rooms.forEach((room, index) => {
            ctx.fillStyle = room.color.toString();
            ctx.lineWidth = 2;
            room.locked ? (ctx.strokeStyle = Color.Red.toString()) : (ctx.strokeStyle = room.color.toString());

            let x, y;
            if (index == 0) {
              x = 125 - ROOM_SIZE / 2;
              y = 125 - ROOM_SIZE / 2;
            } else {
              let roomXoffset = room.x - startingRoomPos.x;
              let roomYoffset = room.y - startingRoomPos.y;
              x = 125 - ROOM_SIZE / 2 + roomXoffset * (ROOM_SIZE + 5);
              y = 125 - ROOM_SIZE / 2 + roomYoffset * (ROOM_SIZE + 5);
            }

            ctx.fillRect(x, y, ROOM_SIZE, ROOM_SIZE);
            ctx.strokeRect(x, y, ROOM_SIZE, ROOM_SIZE);
          });
        });

        return;
      },
    });

    let ggroup = new GraphicsGroup({
      useAnchor: true,
      members: [
        { graphic: mmBorder, offset: new Vector(0, 0) },
        { graphic: this.cnv, offset: vec(25, 25) },
      ],
    });
    ggroup.opacity = 0.5;
    this.graphics.use(ggroup);
  }

  onInitialize(engine: Engine): void {
    let vp = this.scene?.engine.screen.viewport;
    this.pos = vec(vp?.width! - 325, vp?.height! - 325);
  }

  makeMap(leveldata: any) {
    //console.log("leveldata: ", leveldata);
    this.rooms = [];
    this.hallways = [];
    this.mapsize = getSizeOfMap(leveldata);
    debugger;
    leveldata.rooms.forEach((room: any) => {
      let roomColor: Color;
      if (room.roomType === "exit") roomColor = Color.Black;
      else if (room.roomType === "key") roomColor = Color.Yellow;
      else if (room.roomType === "boss") roomColor = Color.fromHex("#8b0000");
      else if (room.roomType === "general") roomColor = Color.Blue;
      else if (room.roomType === "treasure") roomColor = Color.fromHex("#800080");
      else roomColor = Color.Orange;
      this.rooms.push({
        color: roomColor,
        type: room.roomType,
        x: room.roomPos.x,
        y: room.roomPos.y,
        locked: room.locked ? true : false,
      });
    });
    leveldata.edges.forEach((edge: any) => {
      let hallway = findHallwayPosition(edge, leveldata.rooms);
      this.hallways.push({ from: edge.from, direction: hallway.direction });
    });
    let startingRoom = this.rooms.find(room => room.type === "start");
    console.log(startingRoom);
    let SRoffset = startingRoom ? new Vector(startingRoom.x, startingRoom.y) : new Vector(0, 0);

    console.log(SRoffset);
    console.log(this.rooms);
    console.log(this.hallways);
  }

  resize(scale: number): void {
    let vp = this.scene?.engine.screen.viewport;
    if (scale > 1) scale = 1;
    this.pos = vec(vp?.width! - 325 * scale, vp?.height! - 325 * scale);
    this.scale = vec(scale, scale);
  }
}

function findHallwayPosition(edge: Edge, rooms: Room[]): { room: Room; direction: "top" | "bottom" | "left" | "right" } {
  // find the 2 rooms that are connected by this edge
  const room1 = rooms.find(room => room.roomID === edge.from.roomID)!;
  const room2 = rooms.find(room => room.roomID === edge.to.roomID)!;
  let roomDirection = directionOfRoom(room1, room2);
  return {
    room: room1,
    direction: roomDirection,
  };
}

function directionOfRoom(room1: Room, room2: Room): "top" | "bottom" | "left" | "right" {
  if (room1.roomPos.y < room2.roomPos.y) return "bottom";
  if (room1.roomPos.y > room2.roomPos.y) return "top";
  if (room1.roomPos.x < room2.roomPos.x) return "right";
  return "left";
}

function getSizeOfMap(leveldata: any): { width: number; height: number } {
  let width = 0;
  let height = 0;
  let startingRoom = leveldata.rooms[0];

  for (let i = 0; i < leveldata.rooms.length; i++) {
    let currentRoom = leveldata.rooms[i];
    let xDistance = currentRoom.roomPos.x - startingRoom.roomPos.x;
    let yDistance = currentRoom.roomPos.y - startingRoom.roomPos.y;
    if (xDistance > width) width = xDistance;
    if (yDistance > height) height = yDistance;
  }

  return {
    width,
    height,
  };
}
