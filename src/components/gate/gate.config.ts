import { Sprite } from "../../configs/constants/constants";
import GateWithCounterComponent from "./gateWithCounter.component";

export type TGateState = {
  startTime: number;
  target: GateWithCounterComponent;
};

export const hitGateEffect = (object: Sprite, invalid: boolean) => {
  const { scene } = object;
  const originalScaleX = object.scaleX;
  const originalScaleY = object.scaleY;

  const currentColor = invalid ? 0x00ffff : 0xffffff; // Red for invalid, Green for valid

  const holdDuration = 10; // Duration to hold the white flash effect

  scene.tweens.add({
    targets: object,
    scaleX: originalScaleX * 1.05, // 5% scale up
    scaleY: originalScaleY * 1.05,
    duration: 10,
    hold: holdDuration,
    yoyo: true,
    ease: "Power2",
    onStart: () => {
      object.setTintFill(currentColor); // White flash
    },
    onYoyo: () => {
      object.clearTint(); // Remove tint on return
    },
  });
};

export const getGateReward = (object: Sprite, graphicsName: string) => {
  const currentY = object.y + object.displayHeight * 0.5;
  const particles = object.scene.add.particles(
    object.x,
    currentY,
    graphicsName,
    {
      // 將角度限制在上方 90 度的範圍內 (270度為正上方)
      angle: { min: 225, max: 315 },
      speed: { min: 50, max: 300 }, // 粒子移動速度範圍
      scale: { start: 0.8, end: 0 }, // 粒子大小，從 0.8 倍漸變到 0
      alpha: { start: 1, end: 0 }, // 粒子透明度，從 1 漸變到 0 (淡出)
      lifespan: 800, // 粒子生命週期 (毫秒)
      quantity: 30, // 一次爆發的粒子總數
      blendMode: "ADD", // 混合模式設為 'ADD'，讓粒子重疊時更亮，產生發光感
    }
  );

  particles.explode(30);
  const auraRing = object.scene.add.graphics();
  auraRing.setPosition(object.x, currentY);
  auraRing.lineStyle(4, 0xffff00, 0.9);
  auraRing.beginPath();
  auraRing.arc(0, 0, 15, Math.PI, 2 * Math.PI, false);
  auraRing.strokePath();

  object.scene.tweens.add({
    targets: auraRing,
    scale: 10,
    alpha: 0,
    duration: 700,
    ease: "Cubic.easeOut",
    onComplete: () => auraRing.destroy(),
  });
};
