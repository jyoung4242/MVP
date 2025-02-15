import {
  ActionCompleteEvent,
  Actor,
  CollisionType,
  Color,
  Delay,
  EaseTo,
  EasingFunctions,
  Engine,
  Meet,
  Polygon,
  Random,
  Shape,
  vec,
  Vector,
  Action,
  Entity,
  MotionComponent,
  TransformComponent,
} from "excalibur";
import { enemyColliders } from "../Lib/colliderGroups";
import { BehaviorNode, BehaviorStatus, BehaviorTree, RootNode, SelectorNode, SequenceNode } from "../Lib/behaviorTree";
import { Player } from "./player";
import { RoomActor } from "./room";

export class Enemy extends Actor {
  bt: BehaviorTree;
  target: Player | null = null;
  room: RoomActor | null = null;
  rng: Random = new Random();
  raster: Polygon | null = null;

  constructor() {
    const collide = Shape.Polygon(
      [vec(8, 0), vec(15.61, 5.88), vec(12.94, 15.27), vec(3.06, 15.27), vec(0.39, 5.88)],
      vec(-8, -8),
      true
    );

    super({
      pos: vec(0, 0),
      collider: collide,
      collisionType: CollisionType.Passive,
      collisionGroup: enemyColliders,
      z: 1,
      scale: vec(1.5, 1.5),
    });
    this.raster = new Polygon({
      points: [vec(8, 0), vec(15.61, 5.88), vec(12.94, 15.27), vec(3.06, 15.27), vec(0.39, 5.88)],
      color: Color.Red,
    });

    this.graphics.use(this.raster);

    this.bt = new BehaviorTree({
      owner: this,
      root: new EnemyRoot(this),
    });
    this.addComponent(this.bt);
  }

  isPlayerClose(): boolean {
    let players = this.scene?.entities.filter(e => e instanceof Player);
    for (let i = 0; i < players!.length; i++) {
      //console.log("checking players proximity", players![i]);
      //console.log("distance", this.getGlobalPos().distance(players![i].pos));

      //if (this.within(players![i], 200)) return true;
      if (this.getGlobalPos().distance(players![i].pos) < 200) return true;
    }
    return false;
  }

  chargeClosestPlayer(): void | null {
    let players = this.scene?.entities.filter(e => e instanceof Player);
    console.log("players", players);

    let closestDistance = {
      player: null as Player | null,
      distance: Infinity,
    };

    if (!players) return null;
    for (let i = 0; i < players!.length; i++) {
      let distance = this.getGlobalPos().distance(players![i].pos);
      if (distance < closestDistance.distance) {
        closestDistance.player = players![i];
        closestDistance.distance = distance;
      }
    }

    if (!closestDistance.player) return null;
    this.target = closestDistance.player;
    console.log("charging closest player", closestDistance.player);

    //this.actions.meet(closestDistance.player, 125);
    this.actions.runAction(new GlobalMeet(this, closestDistance.player, 125));
  }

  changeEnemyColor(color: Color) {
    this.raster = new Polygon({
      points: [vec(8, 0), vec(15.61, 5.88), vec(12.94, 15.27), vec(3.06, 15.27), vec(0.39, 5.88)],
      color: color,
    });

    this.graphics.use(this.raster);
  }

  bitePlayer() {
    (this.target as Player).getBitten();
  }

  runAway(speed: number = 500) {
    //find quadrant in room enemy exists.

    let quadrant: string = "";
    let otherQuadrants: string[] = [];
    if (!this.room) return;

    //let relativePos = this.room!.pos.sub(this.pos);

    if (this.pos.x < 0) {
      if (this.pos.y < 0) {
        quadrant = "topLeft";
        otherQuadrants = ["topRight", "bottomLeft", "bottomRight"];
      } else {
        quadrant = "bottomLeft";
        otherQuadrants = ["topLeft", "topRight", "bottomRight"];
      }
    } else {
      if (this.pos.y < 0) {
        quadrant = "topRight";
        otherQuadrants = ["topLeft", "bottomLeft", "bottomRight"];
      } else {
        quadrant = "bottomRight";
        otherQuadrants = ["topLeft", "topRight", "bottomLeft"];
      }
    }
    const whereTo = this.rng.pickOne(otherQuadrants);
    let newPos;
    switch (whereTo) {
      case "topLeft":
        newPos = new Vector(this.rng.integer(-250, -10), this.rng.integer(-100, -10));
        break;
      case "topRight":
        newPos = new Vector(this.rng.integer(10, 250), this.rng.integer(-100, -10));
        break;
      case "bottomLeft":
        newPos = new Vector(this.rng.integer(-250, -10), this.rng.integer(10, 100));
        break;
      case "bottomRight":
        newPos = new Vector(this.rng.integer(10, 250), this.rng.integer(10, 100));
        break;
      default:
        newPos = new Vector(0, 0);
        break;
    }
    this.actions.easeTo(newPos, speed, EasingFunctions.EaseInOutQuad);
  }

  initEnemy(pos: Vector, room: RoomActor) {
    this.pos = pos;
    this.room = room;
  }

  resetEnemy() {
    this.pos = vec(0, 0);
  }
}

class EnemyRoot extends RootNode {
  state = {
    isHungry: false,
    isEating: false,
    foodLevel: 0,
    hunger: 0,
  };
  constructor(public owner: Actor, initialState?: { isHungry: boolean; isEating: boolean; foodLevel: number; hunger: number }) {
    super(owner);
    if (initialState) this.state = initialState;

    this.addChild(new EnemyIsEating(this.owner, this.state));
    this.addChild(new EnemyIsHungry(this.owner, this.state));
    this.addChild(new EnemyIsPassive(this.owner, this.state));
  }
}

class EnemyIsEating extends SelectorNode {
  preCondition: () => boolean = () => {
    return this.state.isEating;
  };

  constructor(public owner: Actor, public state: any) {
    super(owner);
    this.addChild(new EnemyisEatingSequence(this.owner, this.state));
  }
}

class EnemyisEatingSequence extends SequenceNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
    this.addChild(new EnemyColorChange(this.owner, this.state));
    this.addChild(new EnemyWait(this.owner, this.state, 1000));
    this.addChild(new EnemyEat(this.owner, this.state));
  }
}

class EnemyIsHungry extends SelectorNode {
  preCondition: () => boolean = () => {
    return this.state.isHungry && !this.state.isEating;
  };

  constructor(public owner: Actor, public state: any) {
    super(owner);
    this.addChild(new EnemyIsSearchingForPlayer(this.owner, this.state));
    this.addChild(new EnemySearches(this.owner, this.state));
  }
}

class EnemyIsSearchingForPlayer extends SelectorNode {
  preCondition: () => boolean = () => {
    return (this.owner as Enemy).isPlayerClose();
  };

  constructor(public owner: Actor, public state: any) {
    super(owner);
    this.addChild(new EnemyIsAggressive(this.owner, this.state));
  }
}

class EnemyIsAggressive extends SequenceNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
    this.addChild(new EnemyColorChange(this.owner, this.state));
    this.addChild(new EnemyCharges(this.owner, this.state));
    this.addChild(new EnemyAttacks(this.owner, this.state));
    this.addChild(new EnemyFlees(this.owner, this.state));
    this.addChild(new EnemyEat(this.owner, this.state));
  }
}

class EnemyIsPassive extends SequenceNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
    this.addChild(new EnemyColorChange(this.owner, this.state));
    this.addChild(new EnemyWait(this.owner, this.state, 500));
    this.addChild(new EnemyMovesRandomly(this.owner, this.state));
  }
}

/*
 * Behavior Nodes
 */

class EnemyWait extends BehaviorNode {
  constructor(public owner: Actor, public state: any, public time: number) {
    super(owner);
  }

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.isInterrupted) {
      this.isInterrupted = false;
      this.status = "free";
      return BehaviorStatus.Failure;
    }

    if (this.status == "busy") return BehaviorStatus.Running;
    if (this.status == "complete") {
      this.status = "free";
      return BehaviorStatus.Success;
    }

    this.status = "busy";
    console.log("waiting", this.state);
    let subscription = this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof Delay && event.target == this.owner) {
        subscription.close();
        if (!this.state.isEating && !this.state.isHungry) this.state.hunger += 10;
        if (this.state.hunger >= 100) this.state.isHungry = true;
        if (this.state.isEating) {
          this.state.foodLevel -= 10;
          this.state.hunger -= 10;
          if (this.state.foodLevel <= 0) {
            this.state.isEating = false;
            this.state.isHungry = false;
          }
        }
        this.status = "complete";
      }
    });

    this.owner.actions.runAction(new Delay(this.time));
    return BehaviorStatus.Running;
  }
}

class EnemyEat extends BehaviorNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
  }

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.isInterrupted) {
      this.isInterrupted = false;
      this.status = "free";
      return BehaviorStatus.Failure;
    }

    if (this.status == "busy") return BehaviorStatus.Running;
    if (this.status == "complete") {
      this.status = "free";
      return BehaviorStatus.Success;
    }
    console.log("starting to eat");
    this.status = "busy";
    this.state.isEating = true;
    this.status = "complete";
    return BehaviorStatus.Running;
  }
}

class EnemyCharges extends BehaviorNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
  }
  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.isInterrupted) {
      this.isInterrupted = false;
      this.status = "free";
      return BehaviorStatus.Failure;
    }
    console.log("busy charging");

    if (this.status == "busy") return BehaviorStatus.Running;
    if (this.status == "complete") {
      this.status = "free";
      return BehaviorStatus.Success;
    }

    this.status = "busy";
    console.log("charging");

    let subscription = this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof GlobalMeet && event.target == this.owner) {
        console.log("charging complete");

        this.status = "complete";
        subscription.close();
        return BehaviorStatus.Success;
      }
    });

    (this.owner as Enemy).chargeClosestPlayer();
    return BehaviorStatus.Running;
  }
}

class EnemyAttacks extends BehaviorNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
  }

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.isInterrupted) {
      this.isInterrupted = false;
      this.status = "free";
      return BehaviorStatus.Failure;
    }

    if (this.status == "busy") return BehaviorStatus.Running;
    if (this.status == "complete") {
      this.status = "free";
      return BehaviorStatus.Success;
    }
    this.status = "busy";
    console.log("biting player");

    (this.owner as Enemy).bitePlayer();
    this.status = "complete";
    this.state.foodLevel = 100;
    return BehaviorStatus.Running;
  }
}

class EnemyFlees extends BehaviorNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
  }

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.isInterrupted) {
      this.isInterrupted = false;
      this.status = "free";
      return BehaviorStatus.Failure;
    }

    if (this.status == "busy") return BehaviorStatus.Running;
    if (this.status == "complete") {
      this.status = "free";
      return BehaviorStatus.Success;
    }
    this.status = "busy";
    console.log("fleeing");

    //find spot to run too
    let subscription = this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof EaseTo && event.target == this.owner) {
        this.status = "complete";
        subscription.close();
      }
    });

    (this.owner as Enemy).runAway(500);

    return BehaviorStatus.Running;
  }
}

class EnemyMovesRandomly extends BehaviorNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
  }

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.isInterrupted) {
      this.isInterrupted = false;
      this.status = "free";
      return BehaviorStatus.Failure;
    }

    if (this.status == "busy") return BehaviorStatus.Running;
    if (this.status == "complete") {
      this.status = "free";
      return BehaviorStatus.Success;
    }

    this.status = "busy";
    console.log("moving randomly");
    //find spot to run too
    let subscription = this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof EaseTo && event.target == this.owner) {
        this.status = "complete";
        subscription.close();
      }
    });

    (this.owner as Enemy).runAway(700);

    return BehaviorStatus.Running;
  }
}

class EnemyColorChange extends BehaviorNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
  }

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.isInterrupted) {
      this.isInterrupted = false;
      this.status = "free";
      return BehaviorStatus.Failure;
    }

    if (this.status == "busy") return BehaviorStatus.Running;
    if (this.status == "complete") {
      this.status = "free";
      return BehaviorStatus.Success;
    }

    let eColor: Color = Color.Green;
    if (this.state.isHungry) {
      eColor = Color.Red;
    }
    if (this.state.isEating) {
      eColor = Color.Blue;
    }

    (this.owner as Enemy).changeEnemyColor(eColor);
    return BehaviorStatus.Success;
  }
}

class EnemySearches extends BehaviorNode {
  constructor(public owner: Actor, public state: any) {
    super(owner);
  }

  preCondition: () => boolean = () => {
    return !this.state.isEating;
  };

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.isInterrupted) {
      this.isInterrupted = false;
      this.status = "free";
      return BehaviorStatus.Failure;
    }

    if (this.status == "busy") return BehaviorStatus.Running;
    if (this.status == "complete") {
      this.status = "free";
      return BehaviorStatus.Success;
    }
    this.status = "busy";
    console.log("searching");

    //find spot to run too
    let subscription = this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof EaseTo && event.target == this.owner) {
        this.status = "complete";
        subscription.close();
      }
    });

    (this.owner as Enemy).runAway(900);

    return BehaviorStatus.Running;
  }
}

export class GlobalMeet implements Action {
  //id = nextActionId();
  private _tx: TransformComponent;
  private _motion: MotionComponent;
  private _meetTx: TransformComponent;
  private _meetMotion: MotionComponent;
  public x!: number;
  public y!: number;
  private _current: Vector;
  private _end: Vector;
  private _dir!: Vector;
  private _speed: number;
  private _distanceBetween!: number;
  private _started = false;
  private _stopped = false;
  private _speedWasSpecified = false;

  constructor(actor: Entity, actorToMeet: Entity, speed?: number) {
    this._tx = actor.get(TransformComponent);
    this._motion = actor.get(MotionComponent);
    this._meetTx = actorToMeet.get(TransformComponent);
    this._meetMotion = actorToMeet.get(MotionComponent);
    this._current = new Vector(this._tx.globalPos.x, this._tx.globalPos.y);
    this._end = new Vector(this._meetTx.globalPos.x, this._meetTx.globalPos.y);
    this._speed = speed || 0;

    if (speed !== undefined) {
      this._speedWasSpecified = true;
    }
  }

  public update(elapsed: number): void {
    if (!this._started) {
      this._started = true;
      this._distanceBetween = this._current.distance(this._end);
      this._dir = this._end.sub(this._current).normalize();
    }

    const actorToMeetSpeed = Math.sqrt(Math.pow(this._meetMotion.vel.x, 2) + Math.pow(this._meetMotion.vel.y, 2));
    if (actorToMeetSpeed !== 0 && !this._speedWasSpecified) {
      this._speed = actorToMeetSpeed;
    }
    this._current = vec(this._tx.globalPos.x, this._tx.globalPos.y);

    this._end = vec(this._meetTx.globalPos.x, this._meetTx.globalPos.y);
    this._distanceBetween = this._current.distance(this._end);
    this._dir = this._end.sub(this._current).normalize();

    const m = this._dir.scale(this._speed);
    this._motion.vel = vec(m.x, m.y);

    if (this.isComplete()) {
      this._tx.globalPos = vec(this._end.x, this._end.y);
      this._motion.vel = vec(0, 0);
    }
  }

  public isComplete(): boolean {
    return this._stopped || this._distanceBetween <= 1;
  }

  public stop(): void {
    this._motion.vel = vec(0, 0);
    this._stopped = true;
  }

  public reset(): void {
    this._started = false;
    this._stopped = false;
    this._distanceBetween = Infinity;
  }
}
