import { Bullet } from "../Actors/Bullet";
import { RentalPool } from "./RentalPool";

function makeBullet() {
  return new Bullet();
}

function resetBullet(incoming: Bullet) {
  return incoming;
}

export const bulletPool = new RentalPool(makeBullet, resetBullet, 250);

export const getNextBullet = (): Bullet => {
  return bulletPool.rent(true) as Bullet;
};

export const returnBullet = (bullet: Bullet) => {
  bulletPool.return(bullet);
};
