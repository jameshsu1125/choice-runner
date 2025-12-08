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

  const currentColor = invalid ? 0x00ffff : 0xffffff; // Cyan for invalid, White for valid

  const holdDuration = 10; // Duration to hold the white flash effect

  if (scene.tweens.isTweening(object)) return;

  scene.tweens.add({
    targets: object,
    scaleX: originalScaleX * 1.2, // 20% scale up
    scaleY: originalScaleY * 1.2,
    duration: 50,
    hold: holdDuration,
    yoyo: true,
    ease: "easeOutQuart",
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
      // Limit the angle to a 90-degree range upward (270 degrees is straight up)
      angle: { min: 225, max: 315 },
      speed: { min: 50, max: 300 }, // Particle movement speed range
      scale: { start: 0.8, end: 0 }, // Particle size, gradually scales from 0.8 to 0
      alpha: { start: 1, end: 0 }, // Particle opacity, gradually fades from 1 to 0 (fade out)
      lifespan: 800, // Particle lifespan (milliseconds)
      quantity: 30, // Total number of particles per burst
      blendMode: "ADD", // Blend mode set to 'ADD' for brighter overlapping particles, creating a glow effect
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
