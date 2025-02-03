import { Scene } from "excalibur";

export class StagingScene extends Scene {
  resize(): void {
    //get screensize and adjust camera zoom
    const screensize = this.engine.screen;
    this.camera.zoom = screensize.viewport.width / 1100;
    console.log(this.camera.zoom);
  }
}

class StagingSceneUI {
  static template = `
    <div>
      Hello Title Scene
    </div>
    `;

  constructor() {}

  create() {}
}
