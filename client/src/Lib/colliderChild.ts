import { Actor, Collider, CollisionGroup, CollisionType, CoordPlane, Entity, Vector, World } from "excalibur";
import { TransformComponent, ColliderComponent, BodyComponent, BodyComponentOptions } from "excalibur";

export class ColliderChild extends Entity {
  owner: Actor;
  tc: TransformComponent;
  cc: ColliderComponent;
  bc: BodyComponent;

  //#region gettersetters
  public get pos(): Vector {
    return this.tc.pos;
  }

  public set pos(thePos: Vector) {
    this.tc.pos = thePos.clone();
  }

  public get rotation(): number {
    return this.tc.rotation;
  }

  public set rotation(theAngle: number) {
    this.tc.rotation = theAngle;
  }

  public get scale(): Vector {
    return this.get(TransformComponent).scale;
  }

  public set scale(scale: Vector) {
    this.get(TransformComponent).scale = scale;
  }

  public get z(): number {
    return this.get(TransformComponent).z;
  }

  public set z(newZ: number) {
    this.get(TransformComponent).z = newZ;
  }

  //#endregion gettersetters

  constructor(name: string, position: Vector, owner: Actor, collider: Collider, group: CollisionGroup) {
    super();
    this.name = name;
    this.owner = owner;
    this.tc = new TransformComponent();

    this.bc = new BodyComponent({
      type: CollisionType.Passive,
      group,
    });
    this.cc = new ColliderComponent(collider);

    this.addComponent(this.tc);
    this.addComponent(this.bc);
    this.addComponent(this.cc);

    this.pos = position;
    this.scale = new Vector(1.0, 1.0);
    this.rotation = 0;
    this.z = 1;
    this.tc.coordPlane = CoordPlane.World;

    console.log(this);
  }
}
