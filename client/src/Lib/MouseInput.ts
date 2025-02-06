import { Actor, Engine, Vector } from "excalibur";
import { ActorSignals } from "./CustomEmitterManager";

export class MouseManager {
  init: boolean = false;
  mouseUpdateRate: number = 10;
  mouseTiks: number = 0;
  mouseDown: boolean = false;
  player: Actor | undefined;

  constructor(public engine: Engine) {}

  setPlayerControl(player: Actor) {
    this.init = true;
    this.player = player;
    this.engine.input.pointers.primary.on("down", () => (this.mouseDown = true));
    this.engine.input.pointers.primary.on("up", () => (this.mouseDown = false));
  }

  update(engine: Engine, delta: number) {
    if (this.init) {
      this.mouseTiks += 1;
      if (this.mouseTiks > this.mouseUpdateRate) {
        this.mouseTiks = 0;
        if (this.mouseDown) {
          ActorSignals.emit(getRelativeVector(this.player!.pos, this.engine.input.pointers.primary.lastWorldPos));
        } else {
          ActorSignals.emit("rightStickIdle");
        }
      }
    }
  }
}

function getRelativeVector(playerpos: Vector, mousepos: Vector): string {
  //get Relative Vector
  const relativeVector = mousepos.sub(playerpos);
  const angle = relativeVector.toAngle();
  const index = Math.round((angle / Math.PI) * 4) & 7;

  switch (index) {
    case 0:
      return "rightStickRight";
    case 1:
      return "rightStickDownRight";
    case 2:
      return "rightStickDown";
    case 3:
      return "rightStickDownLeft";
    case 4:
      return "rightStickLeft";
    case 5:
      return "rightStickUpLeft";
    case 6:
      return "rightStickUp";
    case 7:
      return "rightStickUpRight";
    case 8:
      return "rightStickIdle";
  }
  return "";
}

/*
  rightStickUpLeft: {};
  rightStickUpRight: {};
  rightStickDownRight: {};
  rightStickDownLeft: {};
  rightStickUp: {};
  rightStickDown: {};
  rightStickRight: {};
  rightStickLeft: {};
  rightStickIdle: {};
*/
