import { Engine, Keys } from "excalibur";
import { ActorSignals } from "./CustomEmitterManager";

type directions = "Left" | "Right" | "Up" | "Down";

export class KeyboardControl {
  directions: directions[] = [];
  constructor(engine: Engine) {}

  update(engine: Engine, delta: number) {
    const oldDirections = [...this.directions];
    this.directions = [];
    if (engine.input.keyboard.isHeld(Keys.Left)) this.directions.push("Left");
    if (engine.input.keyboard.isHeld(Keys.Right)) this.directions.push("Right");
    if (engine.input.keyboard.isHeld(Keys.Up)) this.directions.push("Up");
    if (engine.input.keyboard.isHeld(Keys.Down)) this.directions.push("Down");
    //add wasd
    if (engine.input.keyboard.isHeld(Keys.W)) this.directions.push("Up");
    if (engine.input.keyboard.isHeld(Keys.A)) this.directions.push("Left");
    if (engine.input.keyboard.isHeld(Keys.S)) this.directions.push("Down");
    if (engine.input.keyboard.isHeld(Keys.D)) this.directions.push("Right");

    if (!areArraysEqual(this.directions, oldDirections)) {
      if (this.directions.length === 0) ActorSignals.emit("idle");
      else ActorSignals.emit("keypressChanged", { keypress: this.directions });
    }
  }
}

function areArraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
  const setS = new Set(a);
  const setB = new Set(b);
  if (setS.size === setB.size) {
    for (const item of setS) {
      if (!setB.has(item)) {
        return false;
      }
    }
    return true;
  }
  return false;
}
