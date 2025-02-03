import { Scene } from "../HeadlessEx";
import { RoomId } from "@hathora/server-sdk";
import { SceneActivationContext } from "../HeadlessEx/Interfaces/LifecycleEvents";
import { Engine } from "../HeadlessEx/Engine";
import { encoder, server, snapshotInterpolation, WorldState, updateEntities } from "../server";
import { PlayableActor } from "../Actor/playableActor";

export class MainScene extends Scene {
  room: any;

  constructor(rooms: Record<RoomId, WorldState>) {
    super();
  }

  public onActivate(context: SceneActivationContext<{ room: WorldState }>): void {
    if (!context.data) return;
    this.room = context.data.room;
  }

  public onPreUpdate(engine: Engine, elapsedMs: number): void {
    updateEntities(this.room);
    const roomEntities = engine.currentScene.entities;
    const snapshot = snapshotInterpolation.snapshot.create({
      players: roomEntities.map(player => ({
        userId: player.name,
        id: (player as PlayableActor).uuid,
        position: {
          x: (player as PlayableActor).pos.x,
          y: (player as PlayableActor).pos.y,
          z: 0,
          w: 0,
        },
      })),
    });
    snapshotInterpolation.vault.add(snapshot);
    const update = {
      snapshot,
      roomId: this.room,
    };
    server.broadcastMessage(this.room, encoder.encode(JSON.stringify(update)) as unknown as ArrayBuffer);
  }
}
