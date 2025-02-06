import { EngineEvents, EventEmitter } from "excalibur";
import { ActorEvents } from "excalibur/build/dist/Actor";
import { Door } from "../Actors/room";

export interface CustomActorEventBus extends ActorEvents {
  rightStickUpLeft: {};
  rightStickUpRight: {};
  rightStickDownRight: {};
  rightStickDownLeft: {};
  rightStickUp: {};
  rightStickDown: {};
  rightStickRight: {};
  rightStickLeft: {};
  rightStickIdle: {};
  leftStickUpLeft: {};
  leftStickUpRight: {};
  leftStickDownRight: {};
  leftStickDownLeft: {};
  leftStickUp: {};
  leftStickDown: {};
  leftStickRight: {};
  leftStickLeft: {};
  leftStickIdle: {};
  walkDown: {};
  walkUp: {};
  walkLeft: {};
  walkRight: {};
  walkDownLeft: {};
  walkDownRight: {};
  walkUpLeft: {};
  walkUpRight: {};
  idle: {};
  keypressChanged: { keypress: string[] };
  doorTrigger: { door: Door };
}

export interface CustomeEngineEventBus extends EngineEvents {}

export const ActorSignals = new EventEmitter<CustomActorEventBus>();

export const EngineSignals = new EventEmitter<CustomeEngineEventBus>();

// publisher
/*
ActorSignals.emit("myEvent", { health: 0 }); // works, and event name shows in intellisense
EngineSignals.emit("testEvent", { keypress: 0 });
*/
// subscriber
/*
ActorSignals.on("myEvent", data => {
  console.log("myEvent", data);
});

EngineSignals.on("testEvent", data => {
  console.log("testEvent", data);
});
*/
