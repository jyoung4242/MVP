import { Color, Engine, Font, Label, ScreenElement, vec, Vector } from "excalibur";

export class PlayerUI extends ScreenElement {
  constructor(player: number) {
    let myPos = new Vector(0, 0);
    if (player == 1) {
      myPos = vec(5, 5);
    } else {
      myPos = vec(window.innerWidth - 200, 5);
    }

    super({
      pos: myPos,
      radius: 24,
    });
  }
}
