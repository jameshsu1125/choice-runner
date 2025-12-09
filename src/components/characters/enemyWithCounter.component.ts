import { getDepthByOptions } from "@/managers/layout/depth.manager";
import { Container, Graphics, Sprite } from "../../configs/constants/constants";
import { GAME_MECHANIC_CONSTANTS } from "../../configs/constants/game-mechanic/game-mechanic.constants";
import { Easing } from "../../configs/constants/layout.constants";
import { enemyEntityConfig } from "../../configs/presets/enemy.preset";
import {
  enemyPreset,
  firepowerPreset,
  gamePreset,
} from "../../configs/presets/layout.preset";
import SceneLayoutManager from "../../managers/layout/scene-layout.manager";
import MainScene from "../../scenes/main.scene";
import ServiceLocator from "../../services/service-locator/service-locator.service";
import { getDisplaySizeByWidthPercentage } from "../../utils/layout.utils";
import { enemyDeadEffect, hitEnemyEffect } from "./enemy.config";

export default class EnemyWithCounterComponent extends Container {
  private isDestroyed = false;
  private defaultScale = 1;

  public enemy: Sprite | null = null;
  public enemyName = "";
  public maxBlood: number = 100;
  public blood: number = 100;

  private healthBarBorderWidth: number = 5;
  private healthBarBorder = this.scene.add.graphics();
  private healthBar = this.scene.add.image(0, 0, "health-bar");
  private healthBarFill: Graphics = this.scene.add.graphics();

  // Cached geometry/state for health bar
  private barInitialized = false;
  private barBaseWidth = 0;
  private barBaseHeight = 0;
  private innerOffset = 0; // calculated from border width per size
  private lastPercent = -1;
  private lastDrawW = -1;
  private lastDrawH = -1;

  private graphicsName = "glow-particle";
  private graphics = this.scene.make.graphics();

  private removeStateByName: (name: string) => void;
  private decreaseEnemyBlood: (enemy: Sprite, firepower: Sprite) => void;
  private decreasePlayerBlood: (player: Sprite, enemy: Sprite) => void;
  private onGameVictory: () => void;
  private sheetName: string;

  private config?: (typeof enemyEntityConfig)[number]["data"];

  constructor(
    scene: Phaser.Scene,
    name: string,
    config: (typeof enemyEntityConfig)[number]["data"],
    removeStateByName: (name: string) => void,
    decreaseEnemyBlood: (
      enemy: Phaser.Physics.Arcade.Sprite,
      firepower: Phaser.Physics.Arcade.Sprite
    ) => void,
    decreasePlayerBlood: (
      player: Phaser.Physics.Arcade.Sprite,
      enemy: Phaser.Physics.Arcade.Sprite
    ) => void,
    onGameVictory: () => void
  ) {
    super(scene, 0, 0);
    this.enemyName = name;
    this.removeStateByName = removeStateByName;
    this.decreaseEnemyBlood = decreaseEnemyBlood;
    this.decreasePlayerBlood = decreasePlayerBlood;
    this.onGameVictory = onGameVictory;

    this.config = config;
    this.sheetName =
      this.config.blood.type === "boss"
        ? GAME_MECHANIC_CONSTANTS.useBossAtlas
          ? "bossSheet"
          : "bossSprite"
        : GAME_MECHANIC_CONSTANTS.useEnemyAtlas
        ? "enemySheet"
        : "enemySprite";
    this.blood = config.blood.value;
    this.maxBlood = config.blood.max;

    this.healthBar.setOrigin(0, 0);
    this.healthBar.setVisible(false); // use Graphics for rounded fill
    this.healthBarFill.setName("healthBar");

    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillCircle(16, 16, 16);
    this.graphics.generateTexture(this.graphicsName, 32, 32);
    this.graphics.destroy();

    const { width, height } = enemyPreset.healthBar.boss;
    const colorGraphics = this.scene.make.graphics();
    colorGraphics.fillStyle(this.config.blood.color, 1);
    colorGraphics.fillRect(0, 0, width, height);
    colorGraphics.generateTexture(`${this.config.blood.color}`, width, height);
    this.healthBar.setTexture(`${this.config.blood.color}`);

    this.build();
    this.setHealthBar();
  }

  setDepths(depth: number): void {
    if (this.enemy) this.enemy.setDepth(depth);
    this.healthBarBorder.setDepth(depth);
    this.healthBar.setDepth(depth);
    this.healthBarFill.setDepth(depth);
  }

  private build(): void {
    const { ratios, randomWidth } = enemyPreset;

    this.enemy = this.scene.physics.add.staticSprite(0, 0, this.sheetName);

    const { width, height } = getDisplaySizeByWidthPercentage(
      this.enemy,
      this.config?.blood.type === "ghost" ? ratios.ghost : ratios.boss
    );
    const randomX =
      (this.scene.scale.width - randomWidth) / 2 + (this.config?.x || 0);
    this.enemy.setName(this.enemyName);
    this.enemy.setDisplaySize(width, height);
    this.enemy.setOrigin(0.5, 0.5);
    this.enemy.setPosition(randomX, -height / 2);

    this.defaultScale = this.enemy.scale;

    // Only create and play animations when using atlas
    if (
      (this.config?.blood.type === "boss" &&
        GAME_MECHANIC_CONSTANTS.useBossAtlas) ||
      (this.config?.blood.type !== "boss" &&
        GAME_MECHANIC_CONSTANTS.useEnemyAtlas)
    ) {
      this.enemy.anims.create({
        key: "run",
        frames: this.scene.anims.generateFrameNames(this.sheetName, {
          prefix: "",
          start: 0,
          end: this.config?.blood.type === "boss" ? 7 : 5,
          zeroPad: 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
      this.enemy.play("run", true);
    }
    // For single sprite, no animation needed

    if (!GAME_MECHANIC_CONSTANTS.stopCollision) this.addCollision(this.enemy);
  }

  private addCollision(enemy: Phaser.Physics.Arcade.Sprite) {
    const layoutContainers =
      ServiceLocator.get<SceneLayoutManager>(
        "gameAreaManager"
      ).layoutContainers;

    if (layoutContainers.firepower) {
      layoutContainers.firepower?.firepowerContainer.forEach((firepower) => {
        this.scene.physics.add.collider(
          enemy,
          firepower,
          () => {
            if (this.isDestroyed) return;
            this.decreaseEnemyBlood(enemy, firepower);
          },
          undefined,
          this.scene
        );
        this.scene.physics.add.overlap(
          enemy,
          firepower,
          () => {
            if (this.isDestroyed) return;
            this.decreaseEnemyBlood(enemy, firepower);
          },
          undefined,
          this.scene
        );
      });
    }

    if (layoutContainers.player) {
      layoutContainers.player.players.forEach((player) => {
        if (!player.player) return;
        this.scene.physics.add.collider(
          enemy,
          player.player,
          () => {
            if (this.isDestroyed) return;
            this.decreasePlayerBlood(player.player!, enemy);
          },
          undefined,
          this.scene
        );
        this.scene.physics.add.overlap(
          enemy,
          player.player,
          () => {
            if (this.isDestroyed) return;
            this.decreasePlayerBlood(player.player!, enemy);
          },
          undefined,
          this.scene
        );
      });
    }
  }

  private setHealthBar(): void {
    if (!this.enemy) return;
    const { offsetY, width, height } =
      this.config?.blood.type === "ghost"
        ? enemyPreset.healthBar.ghost
        : enemyPreset.healthBar.boss;

    const { displayHeight } = this.enemy;

    // Use screen-width-based scaling like supplements
    const minScale = 0.05 * 0.8; // Minimum scale when far
    const maxScale = 0.1 * 0.8; // Maximum scale when close
    const enemyY = this.enemy.y;
    const screenHeight = this.scene.scale.height;
    const percentage = Math.min(1, Math.max(0, enemyY / screenHeight));
    const targetScale = minScale + (maxScale - minScale) * percentage;

    const currentWidth = targetScale * this.scene.scale.width;
    const currentHeight = height * (currentWidth / width);

    const x = this.enemy.x;
    const y = this.enemy.y;

    const currentX = x - currentWidth / 2;
    const currentY = y - displayHeight / 2 + offsetY;
    // Determine border gap in pixels (scaled)
    const gap = this.healthBarBorderWidth * (currentWidth / width);

    // Redraw static shapes only when size changes significantly
    const sizeChanged =
      Math.round(currentWidth) !== Math.round(this.lastDrawW) ||
      Math.round(currentHeight) !== Math.round(this.lastDrawH) ||
      !this.barInitialized;

    if (sizeChanged) {
      this.barInitialized = true;
      this.lastDrawW = currentWidth;
      this.lastDrawH = currentHeight;
      this.barBaseWidth = currentWidth;
      this.barBaseHeight = currentHeight;
      this.innerOffset = gap;

      // Draw border at local origin
      this.healthBarBorder.clear();
      this.healthBarBorder.fillStyle(0xffffff, 1);
      this.healthBarBorder.fillRoundedRect(
        0,
        0,
        this.barBaseWidth,
        this.barBaseHeight,
        this.barBaseHeight * 0.5
      );

      // Inner background (empty health) — white like previous look
      const innerW = this.barBaseWidth - this.innerOffset * 2;
      const innerH = this.barBaseHeight - this.innerOffset * 2;
      this.healthBarBorder.fillStyle(0xffffff, 1);
      this.healthBarBorder.fillRoundedRect(
        this.innerOffset,
        this.innerOffset,
        innerW,
        innerH,
        innerH * 0.5
      );

      // Prepare fill graphics; will draw based on health percent
      this.healthBarFill.clear();
      this.lastPercent = -1;
    }

    // Position border and fill
    this.healthBarBorder.setPosition(currentX, currentY);
    const innerX = currentX + this.innerOffset;
    const innerY = currentY + this.innerOffset;
    this.healthBarFill.setPosition(innerX, innerY);

    // Update crop according to health percent
    const percent = Phaser.Math.Clamp(this.blood / this.maxBlood, 0, 1);
    if (percent !== this.lastPercent) {
      this.lastPercent = percent;
      const innerW = this.barBaseWidth - this.innerOffset * 2;
      const innerH = this.barBaseHeight - this.innerOffset * 2;
      const fillW = Math.max(0, innerW * percent);
      const radius = Math.min(innerH * 0.5, fillW * 0.5);

      this.healthBarFill.clear();
      this.healthBarFill.fillStyle(this.config?.blood.color || 0xff0000, 1);
      this.healthBarFill.fillRoundedRect(0, 0, fillW, innerH, radius);
    }
  }

  public setPxy(x: number, y: number) {
    this.enemy?.setPosition(x, y);
    this.enemy?.refreshBody();
    this.setHealthBar();
  }

  public update(): void {
    if (!this.enemy || this.isDestroyed) return;
    const { perspective } = gamePreset;

    const scale =
      this.defaultScale -
      this.defaultScale *
        (1 - perspective) *
        (Math.abs(this.scene.scale.height - this.enemy.y) /
          this.scene.scale.height);
    this.enemy.setScale(scale, scale);
    this.setHealthBar();

    if (this.enemy.y > this.scene.scale.height - 150) {
      this.destroy();
      this.removeStateByName(this.enemyName);
    }
  }

  setVisibility(value: boolean) {
    this.enemy?.setVisible(value);
    this.healthBarBorder.setVisible(value);
    this.healthBarFill.setVisible(value);
  }

  public loseBlood(): void {
    if (!this.enemy || this.isDestroyed) return;
    const { damage } = firepowerPreset;

    const layoutContainers =
      ServiceLocator.get<SceneLayoutManager>(
        "gameAreaManager"
      ).layoutContainers;

    const currentDamage =
      layoutContainers.firepower.level === 1 ? damage.level1 : damage.level2;
    this.blood -= currentDamage;

    hitEnemyEffect(this.enemy);

    if (this.blood <= 0) {
      this.scene.sound.add("audio-enemy-dead").play({ volume: 0.2 });

      if (this.config?.blood.type === "boss") {
        this.onGameVictory();
      }
      this.destroy();
      this.removeStateByName(this.enemyName);
    }
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.enemy)
      enemyDeadEffect(
        this.enemy,
        this.graphicsName,
        this.config?.blood.type || "ghost",
        () => {
          [this.healthBarBorder, this.healthBarFill].forEach((item) => {
            item.setVisible(false);
            item.destroy();
          });
        },
        () => {
          this.enemy!.destroy(true);
          this.removeStateByName(this.enemyName);
          super.destroy(true);
        }
      );
  }

  public setPositionByPercentage(percentage: number) {
    const { enemy } = this;
    if (!enemy || this.isDestroyed) return;
    const { player } =
      ServiceLocator.get<SceneLayoutManager>(
        "gameAreaManager"
      ).layoutContainers;

    const currentPercent = Easing(percentage);
    const [playerComponent] = player.players;
    const playerX = playerComponent?.player?.x || 0;

    const x =
      this.config?.type === "follow" &&
      this.enemy!.y > this.scene.scale.height / 3
        ? this.enemy!.x + (playerX - this.enemy!.x) / 100
        : this.enemy!.x +
          (this.enemy!.x > this.scene.scale.width / 2
            ? 0.5 * currentPercent
            : -0.5 * currentPercent);

    const y = this.scene.scale.height * currentPercent;

    this.setPxy(x, y);
    this.update();
  }
}
