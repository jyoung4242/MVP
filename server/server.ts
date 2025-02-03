import { Application, RoomId, startServer, UserId, verifyJwt } from "@hathora/server-sdk";
import dotenv from "dotenv";
import { SnapshotInterpolation, Types, Vault } from "@geckos.io/snapshot-interpolation";
import { Scene } from "./HeadlessEx/Scene";
import { Engine, EngineOptions } from "./HeadlessEx/Engine";
import { PlayableActor } from "./Actor/playableActor";
import { EnemyActor } from "./Actor/EnemyActor";
import { CollisionGroup } from "./HeadlessEx/Collision/Group/CollisionGroup";

import { Random, Side, Vector } from "./HeadlessEx";
import { MainScene } from "./Scene/MianScene";

export const snapshotInterpolation = new SnapshotInterpolation();
const playerSpeed = 4;

dotenv.config();
export const encoder = new TextEncoder();
export const decoder = new TextDecoder("utf-8");

// world state for each room
export type WorldState = {
  players: PlayerState[];
  gameEngine: Engine;
  roomId: RoomId;
  rng: Random;
};

type ServerTransmitEntities = Types.Entity & {
  networkId: string;
  position: Types.Quat;
};

const rooms: Record<RoomId, WorldState> = {};

type PlayerState = {
  name: string;
  id: string;
  position: Types.Quat;
  directions: string[];
};

const game: Application = {
  async verifyToken(token, roomId): Promise<UserId | undefined> {
    const userId = verifyJwt(token, process.env.HATHORA_APP_SECRET!);
    if (userId === undefined) {
      console.error("Failed to verify token", token);
    }
    return userId;
  },
  async subscribeUser(roomId, userId): Promise<void> {
    //bail if user already exists
    const existingRoom = rooms[roomId];
    if (existingRoom && existingRoom.players.find(player => player.name === userId)) {
      return;
    }

    let room = rooms[roomId];

    //check if room exists
    if (!room) {
      // create a new room
      let eConfig: EngineOptions = {
        physics: true,
        fixedUpdateTimestep: 1000 / 60,
        scenes: {
          main: MainScene,
        },
      };

      rooms[roomId] = {
        gameEngine: new Engine(eConfig),
        players: [],
        rng: new Random(Date.now()),
        roomId,
      };

      room = rooms[roomId];
      room.gameEngine.start();
      room.gameEngine.goToScene("main", { sceneActivationData: { room } });
    }

    let tempNewPlayer = new PlayableActor(userId, room.rng, new Vector(5, 5));
    let tempNewPlayerServerEntity: ServerTransmitEntities = {
      id: tempNewPlayer.uuid,
      networkId: userId,
      position: {
        x: tempNewPlayer.pos.x,
        y: tempNewPlayer.pos.y,
        z: 0,
        w: 0,
      },
    };

    rooms[roomId].players.push({ name: userId, id: tempNewPlayer.uuid, position: tempNewPlayerServerEntity.position, directions: [] });
    rooms[roomId].gameEngine.currentScene.add(tempNewPlayer);
  },

  async unsubscribeUser(roomId, userId): Promise<void> {
    let room = rooms[roomId];
    if (room) {
      //find player and remove
      const indexPlayertoDelete = room.players.findIndex(player => player.name === userId);
      //kill Actor
      let playerEntity = room.gameEngine.currentScene.entities.find(entity => entity.name == userId);
      if (playerEntity) playerEntity.kill();
      room.players.splice(indexPlayertoDelete, 1);
    }
  },

  async onMessage(roomId, userId, data): Promise<void> {
    const msg = JSON.parse(decoder.decode(data));

    // add message to player event queue
    let room = rooms[roomId];
    let engine = room.gameEngine;

    //find player in engine
    let playerEntity = engine.currentScene.entities.find(entity => entity.name == userId);

    if (playerEntity) {
      if (msg.type == "keypress") {
        // if player direction isn't there
        if (!(playerEntity as PlayableActor).directions.includes(msg.direction)) {
          (playerEntity as PlayableActor).directions.push(msg.direction);
        }
      } else if (msg.type == "keyrelease") {
        //splice out direction if there
        if ((playerEntity as PlayableActor).directions.includes(msg.direction)) {
          (playerEntity as PlayableActor).directions.splice((playerEntity as PlayableActor).directions.indexOf(msg.direction), 1);
        }
      }
    }
  },
};

// Start the server
const port = parseInt(process.env.PORT ?? "4000");
export const server = await startServer(game, port);
console.log(`Server listening on port ${port}`);

export const updateEntities = (room: RoomId) => {
  const roomState = rooms[room];
  const players = roomState.players;

  for (const player of players) {
    //get entity
    const playerEntity = roomState.gameEngine.currentScene.entities.find(entity => (entity as PlayableActor).uuid == player.id);
    let pEnt = playerEntity as PlayableActor;

    if (pEnt.directions.length > 0) {
      if (pEnt.directions.includes("up")) {
        if (pEnt.isColliding.status && pEnt.isColliding.collisionDirection == Side.Top) return;
        pEnt.position.y -= playerSpeed;
      }
      if (pEnt.directions.includes("down")) {
        if (pEnt.isColliding.status && pEnt.isColliding.collisionDirection == Side.Bottom) return;
        pEnt.position.y += playerSpeed;
      }
      if (pEnt.directions.includes("left")) {
        if (pEnt.isColliding.status && pEnt.isColliding.collisionDirection == Side.Left) return;
        pEnt.position.x -= playerSpeed;
      }
      if (pEnt.directions.includes("right")) {
        if (pEnt.isColliding.status && pEnt.isColliding.collisionDirection == Side.Right) return;
        pEnt.position.x += playerSpeed;
      }
    }
  }
};
