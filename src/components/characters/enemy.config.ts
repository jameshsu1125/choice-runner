import { Sprite } from "../../configs/constants/constants";
import EnemyWithCounterComponent from "./enemyWithCounter.component";

export type TEnemyState = {
  startTime: number;
  target: EnemyWithCounterComponent;
};

export const hitEnemyEffect = (enemy: Sprite) => {
  const { scene } = enemy;
  const originalScaleX = enemy.scaleX;
  const originalScaleY = enemy.scaleY;

  const holdDuration = 10; // Duration to hold the white flash effect

  scene.tweens.add({
    targets: enemy,
    scaleX: originalScaleX * 1.05, // 5% scale up
    scaleY: originalScaleY * 1.05,
    duration: 10,
    hold: holdDuration,
    yoyo: true,
    ease: "Power2",
    onStart: () => {
      enemy.setTintFill(0xffffff); // White flash
    },
    onYoyo: () => {
      enemy.clearTint(); // Remove tint on return
    },
  });
};

export const enemyDeadEffect = (
  enemy: Sprite,
  graphicsName: string,
  type: "ghost" | "boss",
  onStart: () => void,
  onComplete: () => void
) => {
  const { scene } = enemy;

  const originalX = enemy.x;
  const originalY = enemy.y;

  const shakeIntensity = 3;

  if (onStart) onStart();

  // Remove enemy collision event if exists
  if (enemy.body && enemy.body.onCollide) {
    enemy.body.onCollide = false;
    enemy.body.enable = false;
  }

  scene.tweens.add({
    targets: enemy,
    x: originalX + shakeIntensity,
    y: originalY + shakeIntensity,
    duration: 50,
    yoyo: true,
    repeat: 3,
    ease: "Power2.easeInOut",
  });

  const color = { r: 255, g: 255, b: 255 };
  scene.tweens.add({
    targets: color,
    r: 0,
    g: 0,
    b: 0,
    duration: 400,
    ease: "Power2.easeIn",
    onUpdate: () => {
      const tint = Phaser.Display.Color.GetColor(
        Math.floor(color.r),
        Math.floor(color.g),
        Math.floor(color.b)
      );
      enemy.setTint(tint);
    },
    onComplete: () => {
      enemy.setTint(0x000000);
      if (onComplete) onComplete();
    },
  });

  const lifespan =
    type === "boss" ? { min: 1000, max: 2000 } : { min: 100, max: 500 };
  const scale = type === "boss" ? { start: 1, end: 0 } : { start: 0.3, end: 0 };
  const quantity = type === "boss" ? 60 : 40;
  const explode = type === "boss" ? 60 : 30;

  const fireEmitter = scene.add.particles(enemy.x, enemy.y, graphicsName, {
    scale,
    quantity,
    lifespan,
    blendMode: "ADD",
    speed: { min: 180, max: 350 },
    angle: { min: 0, max: 360 },
    tint: [0xff0000, 0xffa500, 0xffff00],
  });

  fireEmitter.explode(explode);
  // TODO phaser Bug
  if (type === "boss") {
    fireEmitter.setDepth(1498);
  }
};
