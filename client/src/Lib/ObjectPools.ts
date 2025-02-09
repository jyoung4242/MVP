import { Bullet } from "../Actors/Bullet";
import { Enemy } from "../Actors/Enemy";
import { Treasure } from "../Actors/treasure";
import { RentalPool } from "./RentalPool";

/****************
 * Bullet Pool
 ****************/
function makeBullet(): Bullet {
  return new Bullet();
}

function resetBullet(incoming: Bullet): Bullet {
  return incoming;
}

export const bulletPool = new RentalPool(makeBullet, resetBullet, 250);

export const getNextBullet = (): Bullet => {
  return bulletPool.rent(true) as Bullet;
};

export const returnBullet = (bullet: Bullet): void => {
  bulletPool.return(bullet);
};

/****************
 * Treasure Pool
 ****************/
function makeTreasure(): Treasure {
  return new Treasure();
}

function resetTreasure(incoming: Treasure): Treasure {
  incoming.resetTreasure();
  return incoming;
}

export const treasurePool = new RentalPool(makeTreasure, resetTreasure, 400);

export const getNextTreasure = (): Treasure => {
  return treasurePool.rent(true) as Treasure;
};

export const returnTreasure = (treasure: Treasure): void => {
  treasurePool.return(treasure);
};

/****************
 * Enemy Pool
 ****************/

const makeEnemy = () => {
  return new Enemy();
};

const resetEnemy = (incoming: Enemy) => {
  incoming.resetEnemy();
  return incoming;
};

export const enemyPool = new RentalPool(makeEnemy, resetEnemy, 600);

export const getNextEnemy = (): Enemy => {
  return enemyPool.rent(true) as Enemy;
};

export const returnEnemy = (enemy: Enemy): void => {
  enemyPool.return(enemy);
};
