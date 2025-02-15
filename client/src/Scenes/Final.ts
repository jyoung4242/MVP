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

  async onActivate(
    context: SceneActivationContext<{
      gamepad: GamepadControl;
      keyboard: KeyboardControl;
      mouse: MouseManager;
      levelTime: number;
      score: number;
    }>
  ): Promise<void> {
    (this.ui as UIView) = UI.create(document.getElementById("ui") as HTMLDivElement, new FinalSceneUI(this), FinalSceneUI.template);
    await (this.ui as UIView).attached;
    this.engine = context.engine;
    this.gpad = (context.data as { gamepad: GamepadControl }).gamepad;
    this.kboard = (context.data as { keyboard: KeyboardControl }).keyboard;
    this.mouse = (context.data as { mouse: MouseManager }).mouse;
    this.ui?.model.setTime((context.data as { levelTime: number }).levelTime as number);
    this.ui?.model.setScore((context.data as { score: number }).score as number);

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
  finalTime: number = 0;
  finalScore: number = 0;

  get minutes(): string {
    // convert leveltimer form overall seconds to a 2 digit minutes string
    let min = Math.floor(this.finalTime / 60);
    if (min < 10) return "0" + min.toString();
    return min.toString();
  }
  get seconds(): string {
    // convert finalTime form overall seconds to a 2 digit seconds string
    let sec = this.finalTime % 60;
    if (sec < 10) return "0" + sec.toString();
    return sec.toString();
  }

  reset = () => {
    this.owner.engine.goToScene("game", {
      sceneActivationData: { gamepad: this.owner.gpad, keyboard: this.owner.kboard, mouse: this.owner.mouse, newGame: false },
    });
  };

  static template = `
    <style>
      #finalUI {
        user-select: none;
        pointer-events: auto;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    </style>
    <div id="finalUI">
      <h1>You Finished the Demo</h1>
      <p>Level Time of: \${minutes}:\${seconds}</p>
      <p>Score: \${finalScore}</p>
      <button \${click@=>reset}>Play Again?</button>
    </div>
    `;

  constructor(public owner: FinalScene) {}

  setTime(time: number) {
    this.finalTime = time;
  }

  setScore(score: number) {
    this.finalScore = score;
  }

  create() {}
}
