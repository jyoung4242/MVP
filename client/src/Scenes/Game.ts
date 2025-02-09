import { Actor, DefaultLoader, Engine, Scene, SceneActivationContext, vec, Vector } from "excalibur";
import { GamepadControl } from "../Lib/Gamepad";
import { UI, UIView } from "@peasy-lib/peasy-ui";
import { LevelBuilder, RoomType } from "../Lib/levelBuilder";
import { RoomActor } from "../Actors/room";
import { Player } from "../Actors/player";
import { KeyboardControl } from "../Lib/Keyboard";
import { HallwayActor } from "../Actors/hallway";
import { MouseManager } from "../Lib/MouseInput";
import { MiniMap } from "../UI/MiniMap";
import { PlayerUI } from "../UI/PlayerUI";
import { Enemy } from "../Actors/Enemy";
import { getNextEnemy } from "../Lib/ObjectPools";

export class GameScene extends Scene {
  uiview: UIView | null = null;
  uiinstance = new GameSceneUI();
  screenUI: PlayerUI | null = null;
  levelBuilder: LevelBuilder = new LevelBuilder();
  level: number = 1;
  gpad: GamepadControl | null = null;
  kboard: KeyboardControl | null = null;
  mouse: MouseManager | null = null;
  map: MiniMap | null = null;
  constructor() {
    super();
  }

  override onPreLoad(loader: DefaultLoader): void {
    console.log("in loader, in game scene: ", loader);
  }

  async onActivate(
    context: SceneActivationContext<{ gamepad: GamepadControl; keyboard: KeyboardControl; mouse: MouseManager }>
  ): Promise<void> {
    (this.uiview as UIView) = UI.create(document.getElementById("ui") as HTMLDivElement, this.uiinstance, GameSceneUI.template);
    await (this.uiview as UIView).attached;
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
      let enemypos = player.pos.add(vec(20, 20));
      let enemy = getNextEnemy();
      enemy.initEnemy(enemypos);
      this.add(enemy);
      this.camera.strategy.lockToActor(player);
    }
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;

    this.map = new MiniMap();
    this.map.makeMap(leveldata);
    this.add(this.map);

    this.resize();

    //add playerui
    this.screenUI = new PlayerUI(1);
    this.add(this.screenUI);
  }

  async onDeactivate(context: SceneActivationContext<unknown>): Promise<void> {
    if (this.uiview) {
      this.uiview.destroy();
      await this.uiview.detached;
    }

    this.entities.forEach(entity => this.remove(entity));

    this.map = null;
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
    let ui = document.getElementById("ui") as HTMLDivElement;
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
    if (this.map) this.map.resize(this.camera.zoom);
    console.log(this.uiinstance);
    ui.style.cssText = `position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%); width: ${screensize.viewport.width}px;height: ${screensize.viewport.height}px;`;
  }

  addKey() {
    this.uiinstance.addKey();
  }

  removeKey() {
    this.uiinstance.removeKey();
  }

  updateScore(score: number) {
    this.uiinstance.P1Score = score;
  }
}

class GameSceneUI {
  isSolo: boolean = true;
  P1Score: number = 0;
  P1Keys: number = 0;
  LevelTimer: number = 0;
  timerHandler: any = null;
  get minutes(): string {
    // convert leveltimer form overall seconds to a 2 digit minutes string
    let min = Math.floor(this.LevelTimer / 60);
    if (min < 10) return "0" + min.toString();
    return min.toString();
  }
  get seconds(): string {
    // convert leveltimer form overall seconds to a 2 digit seconds string
    let sec = this.LevelTimer % 60;
    if (sec < 10) return "0" + sec.toString();
    return sec.toString();
  }

  resetTimer() {
    this.LevelTimer = 0;
  }

  enabletimer() {
    this.timerHandler = setInterval(() => {
      this.LevelTimer++;
    }, 1000);
  }

  disabletimer() {
    clearInterval(this.timerHandler);
    this.timerHandler = null;
  }

  addKey() {
    this.P1Keys++;
  }

  removeKey() {
    this.P1Keys--;
    if (this.P1Keys < 0) this.P1Keys = 0;
  }

  constructor() {
    this.timerHandler = setInterval(() => {
      this.LevelTimer++;
    }, 1000);
  }

  getPosition() {
    let elem = document.getElementById("gameclassUI");
    let elemPos = elem!.getBoundingClientRect();
    return vec(elemPos.left, elemPos.top);
  }

  static template = `
    <style>
       #gameclassUI {
         user-select: none;
         pointer-events: none;
       }
    </style>
    <div id="gameclassUI" >
      <style>
        #Player1UI {
          position: absolute;
          top: 0;
          left: 0;
          width: 200px;
          height: 100px;  
          color: #006400;
          font-size: 8px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 10px;
          margin-left: 25px;
          margin-top: 25px;
          font-family: Courier-New, Helvetica, sans-serif;
          pointer-events: none;
          user-select: none;
        }
        .pdata {
          font-size: 24px;
          font-weight: bold;
          height: 10px;
        }
        .ptitle {
          font-size: 18px;
          font-weight: bold;
          text-decoration: underline;
        }
        .leveltimerdiv {
          position: absolute;
          top: 0;
          left: 50%;
          width: 200px;
          height: 100px;  
          color: #006400;
          font-size: 8px;          
          margin-left: 25px;
          margin-top: 25px;
          font-family: Courier-New, Helvetica, sans-serif;
          transform: translateX(-50%);
          user-select: none;
          pointer-events: none;
        }
      </style>
      <div id="Player1UI">
        <span class="ptitle">Player 1</span>
        <span class="pdata">Score: \${P1Score}</span>
        <span class="pdata">Keys: \${P1Keys}</span>
      </div>
      <div class="leveltimerdiv">
        <span class="ptitle">Level Timer: \${minutes}:\${seconds}</span>
      </div>
    
    </div>
    `;
}

/*

*/
