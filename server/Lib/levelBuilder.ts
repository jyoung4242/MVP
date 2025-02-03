import { Vector, Random } from "../HeadlessEx";

//#region declarations
export enum RoomType {
  Key = "key",
  Treasure = "treasure",
  Boss = "boss",
  Exit = "exit",
  Start = "start",
  General = "general",
}

interface Rulesset {
  neighbors: GridUnit[];
  currentRoom: Room;
  rng: Random;
  rooms: Room[];
  edges: Edge[];
  targetKeys: number;
  targetTreasures: number;
  targetRooms: number;
  currentKeys: number;
  currentTreasures: number;
  currentRooms: number;
  grid: GridUnit[];
}

export type GridUnit = {
  x: number;
  y: number;
  roomID: string | null;
};

export type Edge = {
  id: string;
  from: Room;
  to: Room;
};

export type Room = {
  index: number;
  roomID: string;
  roomType: RoomType;
  roomPos: Vector;
  locked?: boolean;
};

//#endregion

//#region ruleset

const GrammerRuleset: Record<number, (config: Rulesset) => void> = {
  0: (config: Rulesset) => {
    // dead end room
    //if treasures remain, roll dice on converting to treasure room
    /* if (config.currentTreasures < config.targetTreasures) {
      if (config.rng.integer(1, 5) < 4) {
        // 60% chance to convert to treasure
        //convert room to treasure
        config.currentRoom.roomType = RoomType.Treasure;
        config.currentTreasures++;

        //does room get locked?
        const numLockedRooms = config.rooms.filter(r => r.roomType === RoomType.Treasure && r.locked).length;
        if (config.targetKeys - numLockedRooms > 1) config.currentRoom.locked = true;
      } else {
        // roll dice to see if room becomes key room
        if (config.rng.integer(1, 5) < 3) {
          // 40% chance to convert to key
          config.currentRoom.roomType = RoomType.Key;
          config.currentKeys++;
        }
      }
    } */
    return config;
  },
  1: (config: Rulesset) => {
    // room has 1 exit

    // decide if room changes
    /*    if (config.currentTreasures < config.targetTreasures) {
      if (config.rng.integer(1, 10) < 2) {
        // 10% chance to convert to treasure
        //convert room to treasure
        config.currentRoom.roomType = RoomType.Treasure;
        config.currentTreasures++;

        //does room get locked?
        const numLockedRooms = config.rooms.filter(r => r.roomType === RoomType.Treasure && r.locked).length;
        if (config.targetKeys - numLockedRooms > 1) config.currentRoom.locked = true;
      } else {
        // roll dice to see if room becomes key room
        if (config.rng.integer(1, 10) < 3) {
          // 20% chance to convert to key
          config.currentRoom.roomType = RoomType.Key;
          config.currentKeys++;
        }
      }
    }
 */
    // roll dice to see if you add rooms
    if (config.rng.d20() < 10 && config.currentRooms < config.targetRooms - 2) {
      config.currentRooms += 1;
      let nextRoomCoords = config.rng.pickOne(config.neighbors);

      let nextRoom: Room = {
        index: config.rooms.length,
        roomID: UUID.generateUUID(),
        roomType: RoomType.General,
        roomPos: new Vector(nextRoomCoords.x, nextRoomCoords.y),
      };
      config.rooms.push(nextRoom);
      //create edge
      config.edges.push({
        from: config.currentRoom,
        to: nextRoom,
        id: UUID.generateUUID(),
      });
      assignRoomID(nextRoom, config.grid);
    }
    return config;
  },
  2: (config: Rulesset) => {
    // room has 2 exits

    // decide if room changes
    /*   if (config.currentTreasures < config.targetTreasures) {
      if (config.rng.integer(1, 10) < 2) {
        // 10% chance to convert to treasure
        //convert room to treasure
        config.currentRoom.roomType = RoomType.Treasure;
        config.currentTreasures++;

        //does room get locked?
        const numLockedRooms = config.rooms.filter(r => r.roomType === RoomType.Treasure && r.locked).length;
        if (config.targetKeys - numLockedRooms > 1) config.currentRoom.locked = true;
      } else {
        // roll dice to see if room becomes key room
        if (config.rng.integer(1, 10) < 3) {
          // 20% chance to convert to key
          config.currentRoom.roomType = RoomType.Key;
          config.currentKeys++;
        }
      }
    } */

    // roll dice to see if you add rooms
    config.neighbors.forEach(n => {
      if (config.currentRooms >= config.targetRooms - 2) return;
      if (config.rng.d20() < 10) {
        config.currentRooms++;
        let nextRoomCoords = n;
        let nextRoom: Room = {
          index: config.rooms.length,
          roomID: UUID.generateUUID(),
          roomType: RoomType.General,
          roomPos: new Vector(nextRoomCoords.x, nextRoomCoords.y),
        };
        config.rooms.push(nextRoom);
        config.edges.push({
          from: config.currentRoom,
          to: nextRoom,
          id: UUID.generateUUID(),
        });
        assignRoomID(nextRoom, config.grid);
      }
    });
    return config;
  },
  3: (config: Rulesset) => {
    // room has 3 exits

    // decide if room changes
    if (config.currentTreasures < config.targetTreasures) {
      if (config.rng.integer(1, 10) < 2) {
        // 20% chance to convert to treasure
        //convert room to treasure
        config.currentRoom.roomType = RoomType.Treasure;
        config.currentTreasures++;

        //does room get locked?
        const numLockedRooms = config.rooms.filter(r => r.roomType === RoomType.Treasure && r.locked).length;
        if (config.targetKeys - numLockedRooms > 1) config.currentRoom.locked = true;
      } else {
        // roll dice to see if room becomes key room
        if (config.rng.integer(1, 10) < 3) {
          // 20% chance to convert to key
          config.currentRoom.roomType = RoomType.Key;
          config.currentKeys++;
        }
      }
    }

    // roll dice to see if you add rooms
    config.neighbors.forEach(n => {
      if (config.currentRooms >= config.targetRooms - 2) return;
      if (config.rng.d20() < 10) {
        config.currentRooms++;
        let nextRoomCoords = n;
        let nextRoom: Room = {
          index: config.rooms.length,
          roomID: UUID.generateUUID(),
          roomType: RoomType.General,
          roomPos: new Vector(nextRoomCoords.x, nextRoomCoords.y),
        };
        config.rooms.push(nextRoom);
        config.edges.push({
          from: config.currentRoom,
          to: nextRoom,
          id: UUID.generateUUID(),
        });
        assignRoomID(nextRoom, config.grid);
      }
    });
    return config;
  },
};

//#endregion

export class LevelBuilder {
  private RNG = new Random();
  private _level = 1;

  private _gridFlatArray: GridUnit[] = [];
  private _rooms: Room[] = [];
  private _edges: Edge[] = [];

  private _currentNumTreasures = 0;
  private _targetNumTreasures = 0;
  private _currentNumKeys = 0;
  private _targetNumKeys = 0;
  private _currentNumRoom = 0;
  private _targetNumRooms = 1;

  constructor() {}

  setLevel(level: number) {
    this._level = level;
  }

  getLevel() {
    return this._level;
  }

  calculateTargetRooms() {
    this._targetNumRooms = this._level + 5 + this.RNG.d4();
    return this._targetNumRooms;
  }

  reset() {
    this._currentNumRoom = 0;
    this._currentNumKeys = 0;
    this._currentNumTreasures = 0;
    this._targetNumKeys = 0;
    this._targetNumTreasures = 0;
    this._targetNumRooms = 0;
    this._gridFlatArray = [];
    this._rooms = [];
    this._edges = [];
  }

  generateGrid() {
    this._gridFlatArray = new Array(100);

    for (let i = 0; i < this._gridFlatArray.length; i++) {
      this._gridFlatArray[i] = {
        x: i % 10,
        y: Math.floor(i / 10),
        roomID: null,
      };
    }

    return this._gridFlatArray;
  }

  generateRooms(level?: number): { rooms: Room[]; edges: Edge[]; grid: GridUnit[] } {
    if (level) this._level = level;

    // generate number of keys and treasures
    this.reset();
    this.generateGrid();
    this._targetNumRooms = this.calculateTargetRooms();
    console.log("Target number of rooms: " + this._targetNumRooms);
    this._targetNumTreasures = Math.ceil(this._targetNumRooms / 10);
    this._targetNumKeys = this.RNG.integer(1, this._targetNumTreasures + 1);
    console.log("Number of Keys: " + this._targetNumKeys);
    console.log("Number of Treasures: " + this._targetNumTreasures);

    // setup initial rooms for grammers
    const roomRslt = setupSeedRooms(this.RNG, this._gridFlatArray);
    this._rooms = [...roomRslt.rooms];
    this._edges = [...roomRslt.edges];

    // recursively generate rooms using rules

    this._currentNumRoom = 2;

    while (this._currentNumRoom < this._targetNumRooms - 2) {
      // loop through rooms, and find all general purpose rooms
      let gpRooms = this._rooms.filter(r => r.roomType === RoomType.General);

      if (gpRooms.length === 0) {
        console.log("No more general purpose rooms, breaking");
        break;
      }

      gpRooms.forEach(r => {
        const availableNeighbors = getAvailableNeighbors(r.roomPos, this._gridFlatArray);
        const numAvailableNeighbors = availableNeighbors.length;

        const GrammarResult: any = GrammerRuleset[numAvailableNeighbors]({
          neighbors: availableNeighbors,
          currentRoom: r,
          rng: this.RNG,
          rooms: this._rooms,
          edges: this._edges,
          targetKeys: this._targetNumKeys,
          targetTreasures: this._targetNumTreasures,
          targetRooms: this._targetNumRooms,
          currentKeys: this._currentNumKeys,
          currentTreasures: this._currentNumTreasures,
          currentRooms: this._currentNumRoom,
          grid: this._gridFlatArray,
        });

        this._rooms = [...GrammarResult.rooms];
        this._edges = [...GrammarResult.edges];
        this._currentNumRoom = GrammarResult.currentRooms;
        this._currentNumKeys = GrammarResult.currentKeys;
        this._currentNumTreasures = GrammarResult.currentTreasures;
      });
    }

    let longestPath = findLongestPath(this._rooms[0], this._edges);
    //debugger;
    // get last element of longestPath
    let lastRoom = longestPath[longestPath.length - 1];
    let lastAvailableNeighbors = getAvailableNeighbors(lastRoom.roomPos, this._gridFlatArray);
    if (lastAvailableNeighbors.length > 0) {
      // add boss room
      let bossRoomCoords = this.RNG.pickOne(lastAvailableNeighbors);
      let bossRoom: Room = {
        index: this._rooms.length,
        roomID: UUID.generateUUID(),
        roomType: RoomType.Boss,
        roomPos: new Vector(bossRoomCoords.x, bossRoomCoords.y),
        locked: true,
      };
      this._rooms.push(bossRoom);
      this._edges.push({
        from: lastRoom,
        to: bossRoom,
        id: UUID.generateUUID(),
      });
      this._currentNumRoom++;
      assignRoomID(bossRoom, this._gridFlatArray);

      // add exit room
      lastAvailableNeighbors = getAvailableNeighbors(bossRoom.roomPos, this._gridFlatArray);
      if (lastAvailableNeighbors.length > 0) {
        let exitRoomCoords = this.RNG.pickOne(lastAvailableNeighbors);
        let exitRoom: Room = {
          index: this._rooms.length,
          roomID: UUID.generateUUID(),
          roomType: RoomType.Exit,
          roomPos: new Vector(exitRoomCoords.x, exitRoomCoords.y),
        };
        this._rooms.push(exitRoom);
        this._edges.push({
          from: bossRoom,
          to: exitRoom,
          id: UUID.generateUUID(),
        });
        this._currentNumRoom++;
        assignRoomID(exitRoom, this._gridFlatArray);

        // find endnodes
        let endNodes = getEndNodes(this._rooms[0], this._rooms, this._edges);
        //debugger;
        this._rooms = assignRemainingKeysAndTreasures(
          endNodes,
          this._rooms,
          this._currentNumKeys,
          this._targetNumKeys,
          this._currentNumTreasures,
          this._targetNumTreasures,
          this.RNG
        );
        return { rooms: this._rooms, edges: this._edges, grid: this._gridFlatArray };
      } else {
        this.reset();
        return this.generateRooms(this._level);
      }
    } else {
      this.reset();
      return this.generateRooms(this._level);
    }
  }
}

class UUID {
  static generateUUID(): string {
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return uuid.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

function getAvailableNeighbors(coord: Vector, grid: GridUnit[]): GridUnit[] {
  // take in grid and coord, return array of available neighbors
  let neighbors: GridUnit[] = [];

  let x = coord.x;
  let y = coord.y;

  // get neighbors then check if valid
  let up = grid.find(n => n.x === x && n.y === y - 1);
  let down = grid.find(n => n.x === x && n.y === y + 1);
  let left = grid.find(n => n.x === x - 1 && n.y === y);
  let right = grid.find(n => n.x === x + 1 && n.y === y);

  if (up && up.roomID === null) neighbors.push(up);
  if (down && down.roomID === null) neighbors.push(down);
  if (left && left.roomID === null) neighbors.push(left);
  if (right && right.roomID === null) neighbors.push(right);

  return neighbors;
}

function assignRoomID(groom: Room, grid: GridUnit[]): void {
  const currentGrid = grid.find(g => g.x === groom.roomPos.x && g.y === groom.roomPos.y);
  if (currentGrid) currentGrid.roomID = groom.roomID;
}

function setupSeedRooms(rng: Random, grid: GridUnit[]): { rooms: Room[]; edges: Edge[] } {
  //pick random starting coords for start room
  let startX = rng.integer(0, 9);
  let startY = rng.integer(0, 9);
  const rooms: Room[] = [];
  const edges: Edge[] = [];

  rooms.push({
    index: 0,
    roomID: UUID.generateUUID(),
    roomType: RoomType.Start,
    roomPos: new Vector(startX, startY),
  });
  assignRoomID(rooms[0], grid);

  let availableNeighbors = getAvailableNeighbors(new Vector(startX, startY), grid);
  let nextRoomCoords = rng.pickOne(availableNeighbors);
  let nextRoom: Room = {
    index: 1,
    roomID: UUID.generateUUID(),
    roomType: RoomType.General,
    roomPos: new Vector(nextRoomCoords.x, nextRoomCoords.y),
  };

  rooms.push(nextRoom);
  assignRoomID(nextRoom, grid);

  edges.push({
    from: rooms[0],
    to: rooms[1],
    id: UUID.generateUUID(),
  });

  return { rooms, edges };
}

function dfs(node: Room, edges: Edge[], visited: Set<Room>, longestPath: Room[]): Room[] {
  visited.add(node);
  const currentPath: Room[] = [node];
  const currentEdges: Edge[] = edges.filter(e => e.from === node);

  for (const edge of currentEdges) {
    if (!visited.has(edge.to)) {
      const newPath = dfs(edge.to, edges, visited, longestPath);
      if (newPath.length > longestPath.length) {
        longestPath = [...newPath];
        currentPath.push(...newPath);
      }
    }
  }

  return currentPath;
}

function findLongestPath(startNode: Room, edges: Edge[]): Room[] {
  const visited: Set<Room> = new Set();
  const longestPath: Room[] = [];
  //debugger;
  return dfs(startNode, edges, visited, longestPath);
}

function assignRemainingKeysAndTreasures(
  endnodes: Room[],
  rooms: Room[],
  currentKeys: number,
  targetKeys: number,
  currentTreasures: number,
  targetTreasures: number,
  rng: Random
): Room[] {
  const filteredEndNodes = endnodes.filter(r => r.roomType != RoomType.Exit);

  for (let i = currentTreasures; i < targetTreasures; i++) {
    let currentEndNode = rng.pickOne(filteredEndNodes);
    currentEndNode.roomType = RoomType.Treasure;
    currentTreasures++;
    const numLockedRooms = rooms.filter(r => r.roomType === RoomType.Treasure && r.locked).length;
    if (targetKeys - numLockedRooms > 1) currentEndNode.locked = true;
  }

  for (let i = currentKeys; i < targetKeys; i++) {
    const gpRooms = rooms.filter(r => r.roomType === RoomType.General);
    if (gpRooms.length > 0) {
      //pick random room
      const gpRoom = rng.pickOne(gpRooms);
      gpRoom.roomType = RoomType.Key;
    }
  }

  return rooms;
}

function getEndNodes(startingRoom: Room, rooms: Room[], edges: Edge[]): Room[] {
  const endRooms: Room[] = [];

  const visitRoom = (node: Room): void => {
    let roomEdges = edges.filter(e => e.from === node);
    if (roomEdges.length === 0) {
      endRooms.push(node);
      return;
    }
    let neighbors = roomEdges.map(e => e.to);
    for (const room of neighbors) {
      visitRoom(room);
    }
  };

  // Assuming you want to start from a specific root node.
  visitRoom(startingRoom);

  return endRooms;
}
