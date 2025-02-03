import { Engine, Scene, SceneActivationContext } from "excalibur";
import { UI, UIView } from "@peasy-lib/peasy-ui";
import { GamepadControl } from "../Lib/Gamepad";
import { Player } from "../Actors/player";
import { KeyboardControl } from "../Lib/Keyboard";

export class TitleScene extends Scene {
  ui: UIView | null = null;
  gpad: GamepadControl | null = null;
  kboard: KeyboardControl | null = null;

  constructor() {
    super();
  }

  async onActivate(context: SceneActivationContext<{ gamepad: GamepadControl; keyboard: KeyboardControl }>): Promise<void> {
    (this.ui as UIView) = UI.create(document.getElementById("ui") as HTMLDivElement, new TitleSceneUI(this), TitleSceneUI.template);
    await (this.ui as UIView).attached;
    this.engine = context.engine;
    this.gpad = (context.data as { gamepad: GamepadControl }).gamepad;
    this.kboard = (context.data as { keyboard: KeyboardControl }).keyboard;
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
    console.log(this.camera.zoom);
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
  }

  resize(): void {
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
    console.log(this.camera.zoom);
  }
}

class TitleSceneUI {
  static template = `
  <div>
    <style>
        .startbutton {
            background-color: #4CAF50; /* Green */
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            
        }

        .startbutton:hover {
            background-color: #45a049;
            -webkit-box-shadow: 0px 0px 20px 4px rgba(255,255,255,0.84);
            -moz-box-shadow: 0px 0px 20px 4px rgba(255,255,255,0.84);
            box-shadow: 0px 0px 20px 4px rgba(255,255,255,0.84);
        }

        .controlcontainer {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            gap: 20px;
            font-size: 24px;
        }

        .buttoncontainer {
            display: flex;
            gap: 20px;
        }
    </style>
    <div class="controlcontainer">
        <span>SmashTV meets Deadspace</span>
        <div class="buttoncontainer">
            <button class="startbutton" \${click@=>solo}>Solo</button>
            <button class="startbutton" \${click@=>coop}>Co-op</button>
        </div>
    </div>

  </div>
  `;

  solo = () => {
    this.owner.engine.goToScene("game", { sceneActivationData: { gamepad: this.owner.gpad, keyboard: this.owner.kboard } });
  };
  coop = () => {};

  constructor(public owner: TitleScene) {}

  create() {}
}
