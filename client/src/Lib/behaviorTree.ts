import { Component, Engine, Entity, EventEmitter } from "excalibur";
import { Actor, ActorEvents } from "excalibur/build/dist/Actor";

export enum BehaviorStatus {
  Success = 0,
  Failure = 1,
  Running = 2,
}

export interface BehaviorEvents extends ActorEvents {
  behaviorInterrupt: {};
}
export const BehaviorSignals = new EventEmitter<BehaviorEvents>();

// Define base class for behavior nodes
export abstract class BehaviorNode {
  isInterrupted: boolean = false;
  status: "free" | "busy" | "complete" = "free";
  interruptSignal;

  constructor(public owner: Actor) {
    this.interruptSignal = BehaviorSignals.on("behaviorInterrupt", () => (this.isInterrupted = true));
  }

  preCondition: () => boolean = () => {
    return true;
  };

  abstract update(engine: Engine, delta: number): BehaviorStatus;
}

export class RootNode extends BehaviorNode {
  private children: BehaviorNode[] = [];

  addChild(child: BehaviorNode): void {
    this.children.push(child);
  }

  update(engine: Engine, delta: number): BehaviorStatus {
    for (const child of this.children) {
      if (child.isInterrupted) {
        child.isInterrupted = false;
        return BehaviorStatus.Failure;
      }
      if (child.preCondition()) {
        const result = child.update(engine, delta);
        if (result !== BehaviorStatus.Failure) {
          return result;
        }
      } else continue;
    }
    return BehaviorStatus.Failure;
  }
}

// Composite node for handling multiple behaviors
export class SelectorNode extends BehaviorNode {
  private children: BehaviorNode[] = [];

  addChild(child: BehaviorNode): void {
    this.children.push(child);
  }

  // Runs through each child until one succeeds
  update(engine: Engine, delta: number): BehaviorStatus {
    for (const child of this.children) {
      if (child.isInterrupted) {
        child.isInterrupted = false;
        return BehaviorStatus.Failure;
      }
      if (child.preCondition()) {
        const result = child.update(engine, delta);
        if (result !== BehaviorStatus.Failure) {
          return result;
        }
      } else continue;
    }
    return BehaviorStatus.Failure;
  }
}

export class SequenceNode extends BehaviorNode {
  public children: BehaviorNode[] = [];
  private currentIndex: number = 0; // Track which child is currently running

  addChild(child: BehaviorNode): void {
    this.children.push(child);
  }

  // Runs each child in sequence, failing if any one fails, no precondition check
  update(engine: Engine, delta: number): BehaviorStatus {
    const result = this.children[this.currentIndex].update(engine, delta);

    if (result == BehaviorStatus.Success) {
      this.currentIndex++;
    } else if (result == BehaviorStatus.Failure) {
      return result;
    }

    if (this.currentIndex >= this.children.length) {
      console.log("sequence complete", this);
      this.currentIndex = 0;
      return BehaviorStatus.Success;
    }
    return BehaviorStatus.Running;
  }
}

interface BTConfig {
  owner: Actor;
  root: RootNode;
}

export class BehaviorTree extends Component {
  owner: Actor;
  root: RootNode;
  constructor(config: BTConfig) {
    super();
    this.owner = config.owner;
    this.root = config.root;
  }

  onAdd(owner: Entity): void {
    this.owner.on("preupdate", this.onPreUpdate.bind(this));
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {
    this.root.update(event.engine, event.delta);
  }
}

/*
console.log("running sequence", this);

    while (this.currentIndex < this.children.length) {
      console.log("running child", this.children[this.currentIndex], this.currentIndex);

      const result = this.children[this.currentIndex].update(engine, delta);
      if (result == BehaviorStatus.Success) {
        console.warn("success");
        debugger;
      }
      if (result === BehaviorStatus.Running) {
        console.log("running");
        return BehaviorStatus.Running; // Wait for current child to finish
      }

      if (result === BehaviorStatus.Failure) {
        console.log("failed");
        this.currentIndex = 0; // Reset index on failure
        return BehaviorStatus.Failure;
      }

      // Move to next child on success
      this.currentIndex++;
    }

    // If all children succeed, reset and return success
    this.currentIndex = 0;
    return BehaviorStatus.Success;

*/
