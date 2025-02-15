/**
 * RoomManager
 *
 * Controls Doors, Enemy spawning, player occupancy, and tracks Room state
 * for each room type, setups up each rooms 'needs'... like treasure rooms
 */

import { Exit } from "../Actors/Exit";
import { Key } from "../Actors/Key";
import { Player } from "../Actors/player";
import { DoorSystem, RoomActor } from "../Actors/room";
import { ActorSignals } from "./CustomEmitterManager";
import { RoomType } from "./levelBuilder";
import { getNextTreasure } from "./ObjectPools";

const RoomStates = {
  Inactive: "Inactive",
  Active: "Active",
  Cleared: "Cleared",
} as const;

const WaveStates = {
  Inactive: "Inactive",
  Active: "Active",
  Complete: "Complete",
} as const;

export class RoomManager {
  room: RoomActor;
  type: RoomType;
  level: number;
  locked: boolean;
  roomState: keyof typeof RoomStates;
  leftDoor: DoorSystem | undefined;
  rightDoor: DoorSystem | undefined;
  topDoor: DoorSystem | undefined;
  bottomDoor: DoorSystem | undefined;
  roomEngine: any;
  waveState: keyof typeof WaveStates = WaveStates.Inactive;

  constructor(room: RoomActor, type: RoomType, level: number, locked: boolean) {
    this.type = type;
    this.level = level;
    this.locked = locked;
    this.roomState = RoomStates.Inactive;
    this.room = room;
  }

  closeAndLockDoors() {
    this.leftDoor?.closeDoor();
    this.rightDoor?.closeDoor();
    this.topDoor?.closeDoor();
    this.bottomDoor?.closeDoor();

    this.leftDoor?.lockDoor();
    this.rightDoor?.lockDoor();
    this.topDoor?.lockDoor();
    this.bottomDoor?.lockDoor();
  }

  unlockDoors() {
    this.leftDoor?.unlockDoor();
    this.rightDoor?.unlockDoor();
    this.topDoor?.unlockDoor();
    this.bottomDoor?.unlockDoor();
  }

  initialize(doors: { leftDoor: DoorSystem; rightDoor: DoorSystem; topDoor: DoorSystem; bottomDoor: DoorSystem }) {
    this.leftDoor = doors.leftDoor;
    this.rightDoor = doors.rightDoor;
    this.topDoor = doors.topDoor;
    this.bottomDoor = doors.bottomDoor;

    if (this.locked) {
      this.leftDoor.lockDoor();
      this.rightDoor.lockDoor();
      this.topDoor.lockDoor();
      this.bottomDoor.lockDoor();
    }

    if (this.type == RoomType.Treasure) {
      let numTreasures = Math.floor(Math.random() * 30) + 10;
      for (let i = 0; i < numTreasures; i++) {
        //find random spot in room
        let x = Math.floor(Math.random() * 575) + 75 - 350;
        let y = Math.floor(Math.random() * 400) + 75 - 250;
        let treasure = getNextTreasure();
        treasure.initTreasure(x, y);
        this.room.addChild(treasure);
      }
    }

    if (this.type == RoomType.Key) {
      let key = new Key();
      this.room.addChild(key);
    }

    if (this.type == RoomType.Exit) {
      let exit = new Exit();
      this.room.addChild(exit);
      console.log("adding exit");
    }

    ActorSignals.on("doorTrigger", (doorData: any) => this.openDoor(doorData.player, doorData.doorSystem));

    this.roomEngine = setInterval(() => {
      if (this.type == RoomType.Start || this.type == RoomType.Exit) return;

      if (this.roomState == RoomStates.Inactive) {
        if (this.checkForPlayerOccupancy(this.room)) {
          this.roomState = RoomStates.Active;
          setTimeout(() => {
            this.closeAndLockDoors();
          }, 1000);
          setTimeout(() => {
            this.waveState = WaveStates.Complete;
          }, 5000);
        }
      } else if (this.roomState == RoomStates.Active) {
        if (this.unlockCondition()) {
          this.roomState = RoomStates.Cleared;
          this.unlockDoors();
        }
      } else {
        // Cleared state
      }
    }, 1000);
  }

  unlockCondition(): boolean {
    if (this.waveState == WaveStates.Complete) return true;
    return false;
  }

  checkForPlayerOccupancy(room: RoomActor) {
    //get players
    let players = room.scene!.entities.filter(e => e instanceof Player) as Player[];
    if (players.length > 0) {
      for (let i = 0; i < players.length; i++) {
        if (this.room.containsActor(players[i])) {
          console.log("player in room", players[i].pos, room.pos);
          return true;
        }
      }
    }
    return false;
  }

  openDoor(player: Player, door: DoorSystem) {
    //sanitize door as one that belongs to this room
    if ((door.room as RoomActor).roomId != this.room.roomId) return;
    if (!door.hasHallway) return;
    if (this.roomState == RoomStates.Active) return;

    if (door.door.lockState == "Locked" && player.keysInInventory > 0) {
      this.unlockDoors();
      door.door.lockState = "Unlocked";
      player.keysInInventory--;
    } else if (door.door.lockState == "Locked" && player.keysInInventory == 0) return;
    door.door.open();
    door.door.doorState = "Open";
  }

  closeDoor(door: DoorSystem) {
    door.door.close();
    door.door.doorState = "Closed";
  }
}
