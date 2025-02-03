import { Scene } from "excalibur";

export class FinalScene extends Scene {
  resize(): void {
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
    console.log(this.camera.zoom);
  }
}

class FinalSceneUI {
  static template = `
    <div>
      Hello Final Scene
    </div>
    `;

  constructor() {}

  create() {}
}
