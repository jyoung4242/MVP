import { Actor, DefaultLoader, Engine, Scene, SceneActivationContext, Vector } from "excalibur";
import { GamepadControl } from "../Lib/Gamepad";
import { UI, UIView } from "@peasy-lib/peasy-ui";
import { LevelBuilder, RoomType } from "../Lib/levelBuilder";
import { RoomActor } from "../Actors/room";
import { Player } from "../Actors/player";
import { KeyboardControl } from "../Lib/Keyboard";
import { HallwayActor } from "../Actors/hallway";
import { MouseManager } from "../Lib/MouseInput";

export class GameScene extends Scene {
  ui: UIView | null = null;
  levelBuilder: LevelBuilder = new LevelBuilder();
  level: number = 1;
  gpad: GamepadControl | null = null;
  kboard: KeyboardControl | null = null;
  mouse: MouseManager | null = null;

  constructor() {
    super();
  }

  override onPreLoad(loader: DefaultLoader): void {
    console.log("in loader, in game scene: ", loader);
  }

  async onActivate(
    context: SceneActivationContext<{ gamepad: GamepadControl; keyboard: KeyboardControl; mouse: MouseManager }>
  ): Promise<void> {
    (this.ui as UIView) = UI.create(document.getElementById("ui") as HTMLDivElement, new GameSceneUI(), GameSceneUI.template);
    await (this.ui as UIView).attached;
    this.engine = context.engine;
    //build level
    this.levelBuilder.setLevel(this.level);
    const leveldata = this.levelBuilder.generateRooms(this.level);
    console.log(leveldata);
    leveldata.rooms.forEach(room => {
      this.add(new RoomActor(room));
    });
    leveldata.edges.forEach(edge => {
      this.add(new HallwayActor(edge, leveldata.rooms));
    });

    this.gpad = (context.data as { gamepad: GamepadControl }).gamepad;
    this.kboard = (context.data as { keyboard: KeyboardControl }).keyboard;
    this.mouse = (context.data as { mouse: MouseManager }).mouse;

    //find room that is starting room
    const startingRoom = leveldata.rooms.find(room => room.roomType === RoomType.Start);

    if (startingRoom) {
      let sRoom = this.entities.find(e => e instanceof RoomActor && e.roomId === startingRoom.roomID) as Actor;

      //get center of starting room
      const center = sRoom!.pos.clone();
      let player = new Player(center);
      if (this.mouse) this.mouse.setPlayerControl(player);
      this.add(player);
      this.camera.strategy.lockToActor(player);
    }
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
  }

  async onDeactivate(context: SceneActivationContext<unknown>): Promise<void> {
    if (this.ui) {
      this.ui.destroy();
      await this.ui.detached;
    }
  }

  onPreUpdate(engine: Engine, delta: number): void {
    if (this.gpad) {
      (this.gpad as GamepadControl).update(engine, delta);
    }
    if (this.kboard) {
      (this.kboard as KeyboardControl).update(engine, delta);
    }

    if (this.mouse) {
      (this.mouse as MouseManager).update(engine, delta);
    }
  }

  resize(): void {
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
  }
}

class GameSceneUI {
  static template = `
    <div>
      
    </div>
    `;

  constructor() {}

  create() {}
}
