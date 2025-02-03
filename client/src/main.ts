// main.ts
import "./style.css";

import { Engine, DisplayMode, Color, FadeInOut } from "excalibur";
import { TitleScene } from "./Scenes/Title";
import { GameScene } from "./Scenes/Game";
import { FinalScene } from "./Scenes/Final";
import { StagingScene } from "./Scenes/Staging";
import { GamepadControl } from "./Lib/Gamepad";
import { KeyboardControl } from "./Lib/Keyboard";

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.FillScreen, // the display mode
  backgroundColor: Color.fromHex("#080808"),
  pixelArt: true,
  scenes: {
    title: {
      scene: TitleScene,
      transitions: {
        in: new FadeInOut({ duration: 500, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 500, direction: "out", color: Color.Black }),
      },
    },
    game: {
      scene: GameScene,
      transitions: {
        in: new FadeInOut({ duration: 500, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 500, direction: "out", color: Color.Black }),
      },
    },
    staging: {
      scene: StagingScene,
      transitions: {
        in: new FadeInOut({ duration: 500, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 500, direction: "out", color: Color.Black }),
      },
    },
    final: {
      scene: FinalScene,
      transitions: {
        in: new FadeInOut({ duration: 500, direction: "in", color: Color.Black }),
        out: new FadeInOut({ duration: 500, direction: "out", color: Color.Black }),
      },
    },
  },
});

const gamepad = new GamepadControl(game);
console.log(gamepad);
const keyboard = new KeyboardControl(game);

await game.start();
game.goToScene("title", {
  sceneActivationData: {
    gamepad: gamepad,
    keyboard: keyboard,
  },
});

//@ts-ignore
window.addEventListener("resize", () => game.currentScene.resize());
