import { Actor, Axes, Engine, GamepadButtonEvent, GamepadConnectEvent, GamepadDisconnectEvent } from "excalibur";
import { ActorSignals } from "./CustomEmitterManager";

export class GamepadControl {
  gamePadConnected: boolean = false;
  gamePadIndex: number = -1;
  threshold: number = 0.5;

  l_lr = 0;
  l_ud = 0;
  r_lr = 0;
  r_ud = 0;

  constructor(engine: Engine) {
    engine.input.gamepads.setMinimumGamepadConfiguration({
      axis: 4,
      buttons: 8,
    });

    engine.input.gamepads.on("connect", (event: GamepadConnectEvent) => {
      this.gamePadConnected = true;
      console.log("Gamepad connected", event);
      this.gamePadIndex = event.index;

      engine.input.gamepads.at(this.gamePadIndex).on("button", (event: GamepadButtonEvent) => {
        ActorSignals.emit("toggleArm");
      });
    });

    engine.input.gamepads.on("disconnect", (event: GamepadDisconnectEvent) => {
      this.gamePadConnected = false;
      console.log("Gamepad disconnected", event.gamepad);
      this.gamePadIndex = -1;
    });
  }

  update(engine: Engine, delta: number) {
    if (!this.gamePadConnected) {
      return;
    }

    this.l_lr = engine.input.gamepads.at(this.gamePadIndex).getAxes(Axes.LeftStickX);
    this.l_ud = engine.input.gamepads.at(this.gamePadIndex).getAxes(Axes.LeftStickY);
    this.r_lr = engine.input.gamepads.at(this.gamePadIndex).getAxes(Axes.RightStickX);
    this.r_ud = engine.input.gamepads.at(this.gamePadIndex).getAxes(Axes.RightStickY);
    //console.log(this.l_lr, this.l_ud, this.r_lr, this.r_ud);

    if (this.r_ud < -this.threshold && this.r_lr < -this.threshold) {
      ActorSignals.emit("rightStickUpLeft");
    } else if (this.r_ud < -this.threshold && this.r_lr > this.threshold) {
      ActorSignals.emit("rightStickUpRight");
    } else if (this.r_ud > this.threshold && this.r_lr > this.threshold) {
      ActorSignals.emit("rightStickDownRight");
    } else if (this.r_ud > this.threshold && this.r_lr < -this.threshold) {
      ActorSignals.emit("rightStickDownLeft");
    } else if (this.r_ud < -this.threshold) {
      ActorSignals.emit("rightStickUp");
    } else if (this.r_ud > this.threshold) {
      ActorSignals.emit("rightStickDown");
    } else if (this.r_lr > this.threshold) {
      ActorSignals.emit("rightStickRight");
    } else if (this.r_lr < -this.threshold) {
      ActorSignals.emit("rightStickLeft");
    } else if (this.r_ud == 0 && this.r_lr == 0) {
      ActorSignals.emit("rightStickIdle");
    }

    if (this.l_ud < -this.threshold && this.l_lr < -this.threshold) {
      ActorSignals.emit("leftStickUpLeft");
    } else if (this.l_ud < -this.threshold && this.l_lr > this.threshold) {
      ActorSignals.emit("leftStickUpRight");
    } else if (this.l_ud > this.threshold && this.l_lr > this.threshold) {
      ActorSignals.emit("leftStickDownRight");
    } else if (this.l_ud > this.threshold && this.l_lr < -this.threshold) {
      ActorSignals.emit("leftStickDownLeft");
    } else if (this.l_ud < -this.threshold) {
      ActorSignals.emit("leftStickUp");
    } else if (this.l_ud > this.threshold) {
      ActorSignals.emit("leftStickDown");
    } else if (this.l_lr > this.threshold) {
      ActorSignals.emit("leftStickRight");
    } else if (this.l_lr < -this.threshold) {
      ActorSignals.emit("leftStickLeft");
    } else if (this.l_ud == 0 && this.l_lr == 0) {
      ActorSignals.emit("leftStickIdle");
    }
  }
}
