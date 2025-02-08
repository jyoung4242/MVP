import { Scene, SceneActivationContext } from "excalibur";
import { GamepadControl } from "../Lib/Gamepad";
import { KeyboardControl } from "../Lib/Keyboard";
import { MouseManager } from "../Lib/MouseInput";
import { UIView, UI } from "@peasy-lib/peasy-ui";

export class FinalScene extends Scene {
  gpad: GamepadControl | null = null;
  kboard: KeyboardControl | null = null;
  mouse: MouseManager | null = null;
  ui: UIView | null = null;
  resize(): void {
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
    console.log(this.camera.zoom);
  }

  async onActivate(context: SceneActivationContext<unknown>): Promise<void> {
    (this.ui as UIView) = UI.create(document.getElementById("ui") as HTMLDivElement, new FinalSceneUI(this), FinalSceneUI.template);
    await (this.ui as UIView).attached;
    this.engine = context.engine;
    this.gpad = (context.data as { gamepad: GamepadControl }).gamepad;
    this.kboard = (context.data as { keyboard: KeyboardControl }).keyboard;
    this.mouse = (context.data as { mouse: MouseManager }).mouse;

    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
  }

  async onDeactivate(context: SceneActivationContext): Promise<void> {
    if (this.ui) {
      this.ui.destroy();
      await this.ui.detached;
      this.ui = null;
    }
  }
}

class FinalSceneUI {
  reset = () => {
    this.owner.engine.goToScene("game", {
      sceneActivationData: { gamepad: this.owner.gpad, keyboard: this.owner.kboard, mouse: this.owner.mouse },
    });
  };

  static template = `
    <div>
      You Finished the Demo
      <button \${click@=>reset}>Play Again?</button>
    </div>
    `;

  constructor(public owner: FinalScene) {}

  create() {}
}
