import { Sprite } from "../../configs/constants/constants";
import EnemyWithCounterComponent from "./enemyWithCounter.component";

export type TEnemyState = {
  startTime: number;
  target: EnemyWithCounterComponent;
};

export const hitEnemyEffect = (enemy: Sprite) => {
  const holdDuration = 10; // Duration to hold the white flash effect
  const scaleUpFactor = 1.05; // 5% scale up
  const flashColor = 0xffffff; // White flash
  const flashDuration = 10; // Duration of the flash effect

  const { scene } = enemy;
  const originalScaleX = enemy.scaleX;
  const originalScaleY = enemy.scaleY;

  scene.tweens.add({
    targets: enemy,
    scaleX: originalScaleX * scaleUpFactor,
    scaleY: originalScaleY * scaleUpFactor,
    duration: flashDuration,
    hold: holdDuration,
    yoyo: true,
    ease: "Power2",
    onStart: () => {
      enemy.setTintFill(flashColor);
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
  const shakeIntensity = 3; // Intensity of the shake effect
  const shakeDuration = 50; // Duration of the shake effect

  const colorDuration = 400; // Duration of the color effect

  // particle effect parameters, boss has more intense effects
  const particleLifespan =
    type === "boss" ? { min: 1000, max: 2000 } : { min: 100, max: 500 };
  const particleScale = { start: enemy.scale, end: 0 };
  const particleQuantity = type === "boss" ? 60 : 40;
  const particleExplode = type === "boss" ? 60 : 30;

  onStart?.();

  const { scene, x, y } = enemy;

  // Remove enemy collision event if exists
  if (enemy.body && enemy.body.onCollide) {
    enemy.body.onCollide = false;
    enemy.body.enable = false;
  }

  // shake effect
  scene.tweens.add({
    targets: enemy,
    x: x + shakeIntensity,
    y: y + shakeIntensity,
    duration: shakeDuration,
    yoyo: true,
    repeat: 3,
    ease: "Power2.easeInOut",
  });

  // color Effect
  const color = { r: 255, g: 255, b: 255 };
  scene.tweens.add({
    targets: color,
    r: 0,
    g: 0,
    b: 0,
    duration: colorDuration,
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
      onComplete?.();
    },
  });

  // particle effect
  const fireEmitter = scene.add.particles(enemy.x, enemy.y, graphicsName, {
    scale: particleScale,
    quantity: particleQuantity,
    lifespan: particleLifespan,
    blendMode: "ADD",
    speed: { min: 180, max: 350 },
    angle: { min: 0, max: 360 },
    tint: [0xff0000, 0xffa500, 0xffff00],
  });

  fireEmitter.explode(particleExplode);
};

// get this code from appier team.
export const enemyBeenAttackedEffect = (enemy: Sprite) => {
  const { scene } = enemy;

  // createShatteredEffect
  const texture = enemy.texture;
  const frame = enemy.frame;
  const spriteX = enemy.x;
  const spriteY = enemy.y;
  const spriteScale = enemy.scaleX;
  const spriteRotation = enemy.rotation;

  const width = frame.width;
  const height = frame.height;
  const numPieces = Phaser.Math.Between(6, 10);

  // Create fragments using cropped sprites (lighter than render textures)
  for (let i = 0; i < numPieces; i++) {
    // Random crop area on the texture
    const cropX = Phaser.Math.Between(0, Math.max(1, width * 0.7));
    const cropY = Phaser.Math.Between(0, Math.max(1, height * 0.7));
    // Smaller fragment sizes (15-25% of original)
    const cropWidth = Phaser.Math.Between(width * 0.15, width * 0.25);
    const cropHeight = Phaser.Math.Between(height * 0.15, height * 0.25);

    // Create sprite fragment
    const fragment = scene.add.sprite(
      spriteX,
      spriteY,
      texture.key,
      frame.name
    );

    // Scale fragments smaller (60-80% of original sprite scale)
    const fragmentScale = spriteScale * Phaser.Math.FloatBetween(0.6, 0.8);
    fragment.setScale(fragmentScale);
    fragment.setCrop(cropX, cropY, cropWidth, cropHeight);
    fragment.setOrigin(0.5, 0.5);
    fragment.setRotation(spriteRotation);

    // Calculate offset based on crop position (using fragment scale)
    const offsetX = (cropX + cropWidth / 2 - width / 2) * fragmentScale;
    const offsetY = (cropY + cropHeight / 2 - height / 2) * fragmentScale;
    fragment.setPosition(spriteX + offsetX, spriteY + offsetY);

    // Add Arcade Physics for realistic motion
    scene.physics.add.existing(fragment);
    const body = fragment.body as Phaser.Physics.Arcade.Body;

    // Random velocity for explosive scatter effect
    const velocityX = Phaser.Math.Between(-300, 300);
    const velocityY = Phaser.Math.Between(-400, -100);
    body.setVelocity(velocityX, velocityY);

    // Gravity for realistic falling
    body.setGravityY(800);

    // Random angular velocity for spinning effect
    const angularVelocity = Phaser.Math.Between(-360, 360);
    body.setAngularVelocity(angularVelocity);

    // Fade out and destroy
    scene.tweens.add({
      targets: fragment,
      alpha: 0,
      duration: 500,
      delay: Phaser.Math.Between(0, 100),
      onComplete: () => {
        fragment.destroy();
      },
    });
  }
};
