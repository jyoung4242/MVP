import { Actor } from "../HeadlessEx";

/****************************/
//Parent Classes
/****************************/

export class EnemyActor extends Actor {
  constructor() {
    super();
  }
}

export class EnemyBullet extends Actor {}

/******************************/
//Child Classes
/******************************/

export class Minion extends EnemyActor {}

export class Boss extends EnemyActor {}

export class MinionBullet extends EnemyBullet {}

export class BossBullet extends EnemyBullet {}
