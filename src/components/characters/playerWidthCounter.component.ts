import Tweener, { Bezier } from "lesca-object-tweener";
import {
  Container,
  Graphics,
  Image,
  Sprite,
} from "../../configs/constants/constants";
import {
  GAME_MECHANIC_CONFIG_SCHEMA,
  GAME_MECHANIC_CONSTANTS,
} from "../../configs/constants/game-mechanic/game-mechanic.constants";
import { enemyPreset, playerPreset } from "../../configs/presets/layout.preset";
import { playerFormation } from "../../configs/presets/player.preset";
import SceneLayoutManager from "../../managers/layout/scene-layout.manager";
import ServiceLocator from "../../services/service-locator/service-locator.service";
import { getDisplayPositionAlign as getAlign } from "../../utils/layout.utils";

export default class PlayerWidthCounterComponent extends Container {
  private isDestroyed = false;
  private randomOffset = {
    x:
      -playerPreset.randomGap * 0.5 +
      Math.random() * -playerPreset.randomGap * 0.5,
    y:
      -playerPreset.randomGap * 0.5 +
      Math.random() * -playerPreset.randomGap * 0.5,
  };
  public tweenProperty = { y: -20 };

  public playerName: string;
  public blood: number = 100;

  public player?: Sprite;
  public healthBarBorder: Graphics = this.scene.add.graphics();
  public healthBar: Image = this.scene.add.image(0, 0, "health-bar");
  private healthBarFill: Graphics = this.scene.add.graphics();

  public hitArea?: Graphics;
  private hitAreaState = { debug: false, offset: { x: 0, y: 0.26 } };

  // Cached geometry/state to avoid per-frame redraws
  private barInitialized = false;
  private barBaseWidth = 0;
  private barBaseHeight = 0;
  private innerOffset = 2; // border thickness
  private lastPercent = -1;

  private increasePlayerCount: (count: number, gateName: string) => void;
  private removePlayerByName: (name: string) => void;
  private decreasePlayerBlood: (playerHitArea: Graphics, enemy: Sprite) => void;
  private currentDepth: number | null = null;

  constructor(
    scene: Phaser.Scene,
    playerName: string,
    decreasePlayerBlood: (playerHitArea: Graphics, enemy: Sprite) => void,
    increasePlayerCount: (count: number, gateName: string) => void,
    removePlayerByName: (name: string) => void,
    depth: number
  ) {
    super(scene, 0, 0);
    this.playerName = playerName;
    this.decreasePlayerBlood = decreasePlayerBlood;
    this.increasePlayerCount = increasePlayerCount;
    this.removePlayerByName = removePlayerByName;
    this.currentDepth = depth;

    this.build();
  }

  private build(): void {
    this.initHealthBar();
    this.createPlayer();
    this.createCollider();
    this.drawHitArea();
  }

  private drawHitArea(): void {
    if (!this.player) return;
    const { x, y, displayHeight, displayWidth } = this.player;

    this.hitArea?.clear();
    this.hitArea = this.scene.add.graphics();
    this.hitArea.name = this.playerName;
    this.hitArea.fillStyle(0xff0000, this.hitAreaState.debug ? 0.5 : 0);
    this.hitArea.fillCircle(
      x - displayWidth * this.hitAreaState.offset.x,
      y - displayHeight * (0.5 - this.hitAreaState.offset.y),
      this.player!.displayWidth * 0.2
    );
    this.hitArea.setDepth(this.currentDepth! + this.depth + 10);
  }

  private initHealthBar(): void {
    const bloodBarDepth =
      this.currentDepth! + GAME_MECHANIC_CONFIG_SCHEMA.playerReinforce.max;

    this.healthBarBorder.setDepth(bloodBarDepth);
    this.healthBarBorder.setName("healthBar");

    this.healthBar.setName("healthBar");
    this.healthBar.setOrigin(0, 0);
    this.healthBar.setDepth(bloodBarDepth);
    this.healthBar.setVisible(false); // use Graphics fill instead of image

    this.healthBarFill.setDepth(bloodBarDepth);
    this.healthBarFill.setName("healthBar");
  }

  private createHealthBar(x: number, y: number): void {
    if (!this.player) return;
    const { displayWidth, displayHeight } = this.player;

    const baseWidth = displayWidth * 0.5; // Health bar is 50% of player width
    const baseHeight = 24; // Fixed height for health bar
    const currentX = x - baseWidth / 2;
    const currentY = y - displayHeight / 2 - 15; // Position above the player

    // Initialize static geometry once per player
    if (!this.barInitialized) {
      this.barInitialized = true;
      this.barBaseWidth = baseWidth;
      this.barBaseHeight = baseHeight;

      // Draw border (outer white) and inner background (black) once at local (0,0)
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

      // Prepare fill graphics; will draw on percent updates
      this.healthBarFill.clear();
      this.lastPercent = -1; // force draw below
    }

    // Move border and fill without re-drawing
    this.healthBarBorder.setPosition(currentX, currentY);
    const innerX = currentX + this.innerOffset;
    const innerY = currentY + this.innerOffset;
    this.healthBarFill.setPosition(innerX, innerY);

    // Update fill only when percent changes
    const percent = Phaser.Math.Clamp(this.blood / 100, 0, 1);
    if (percent !== this.lastPercent) {
      this.lastPercent = percent;
      const innerW = this.barBaseWidth - this.innerOffset * 2;
      const innerH = this.barBaseHeight - this.innerOffset * 2;
      const fillW = Math.max(0, innerW * percent);
      const radius = Math.min(innerH * 0.5, fillW * 0.5);

      this.healthBarFill.clear();
      // Green health fill
      this.healthBarFill.fillStyle(0x00ff00, 1);
      this.healthBarFill.fillRoundedRect(0, 0, fillW, innerH, radius);
    }
  }

  private createPlayer(): void {
    let player: Sprite;
    const targetWidth = this.scene.scale.width * 0.12;

    if (GAME_MECHANIC_CONSTANTS.usePlayerAtlas) {
      // Use atlas with animation
      player = this.scene.physics.add.sprite(0, 0, "playerSheet");
      const targetHeight = (targetWidth / player.width) * player.height;
      player.setDisplaySize(targetWidth, targetHeight);

      player.anims.create({
        key: "run",
        frames: this.scene.anims.generateFrameNames("playerSheet", {
          prefix: "",
          start: 0,
          end: 7,
          zeroPad: 3,
        }),
        frameRate: 9,
        repeat: -1,
      });
    } else {
      // Use single sprite image
      player = this.scene.physics.add.sprite(0, 0, "playerSprite");
      const targetHeight = (targetWidth / player.width) * player.height;
      player.setName(this.playerName);
      player.setDisplaySize(targetWidth, targetHeight);
    }

    this.player = player;
    this.player.setDepth(this.currentDepth! + this.depth);
  }

  public stopAnimationSheet(): void {
    if (!this.player) return;
    if (GAME_MECHANIC_CONSTANTS.usePlayerAtlas) {
      this.player.stop();
      this.player.setFrame(0);
    }
    // For single sprite, no animation to stop
  }

  public runAnimationSheet(): void {
    if (GAME_MECHANIC_CONSTANTS.usePlayerAtlas) {
      this.player?.play("run", true);
    }
    // For single sprite, no animation to play

    new Tweener({
      from: this.tweenProperty,
      to: { y: 0 },
      duration: 500,
      delay: Math.random() * 100,
      easing: Bezier.easeOutQuart,
      onUpdate: (property: { y: number }) => {
        this.tweenProperty = property;
      },
    }).play();
  }

  private createCollider(): void {
    if (!this.player || !this.hitArea) return;
    const { hitArea } = this;

    const { layoutContainers } =
      ServiceLocator.get<SceneLayoutManager>("gameAreaManager");

    layoutContainers.enemy.enemyState.forEach((enemyState) => {
      const { target } = enemyState;
      if (!target.enemy) {
        this.scene.physics.add.collider(
          hitArea!,
          target,
          () => this.decreasePlayerBlood(hitArea!, target.enemy!),
          () => {},
          this.scene
        );
        this.scene.physics.add.overlap(
          hitArea!,
          target,
          () => this.decreasePlayerBlood(hitArea!, target.enemy!),
          () => {},
          this.scene
        );
      }
    });

    layoutContainers.gate.gateState.forEach((gateState) => {
      const { target } = gateState;
      this.scene.physics.add.collider(
        hitArea!,
        target,
        () => {
          this.increasePlayerCount(target.num, target.name);
          target.destroy();
        },
        () => {},
        this.scene
      );
      this.scene.physics.add.overlap(
        hitArea!,
        target,
        () => {
          this.increasePlayerCount(target.num, target.name);
          target.destroy();
        },
        () => {},
        this.scene
      );
    });
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.healthBarBorder.destroy();
    this.healthBar.destroy();
    this.healthBarFill.destroy();
    if (this.player) {
      this.player.destroy(true);
      this.hitArea?.clear();
      this.hitArea?.destroy();
    }
    super.destroy(true);
  }

  public decreaseBlood() {
    const { damage } = enemyPreset;
    this.blood -= damage;

    if (this.blood <= 0) {
      if (this.blood < 0) this.blood = 0;
      this.removePlayerByName(this.playerName);
    }
  }

  public setPositionByIndex(index: number, offset: number) {
    if (this.player === null || this.isDestroyed) return;
    const { gap, offsetY, isRadom } = playerPreset;

    const position = playerFormation[index] || { x: 0, y: 0, depth: 0 };
    const { left, top } = getAlign(this.player!, "CENTER_BOTTOM");

    const randomX = isRadom ? this.randomOffset.x : 0;
    const randomY = isRadom ? this.randomOffset.y : 0;

    const currentX = left + position.x * gap + randomX;
    const currentY = top + position.y * gap + randomY + this.tweenProperty.y;

    this.player!.setDepth(this.currentDepth! + position.depth);
    this.player!.setPosition(currentX + offset, currentY + offsetY);
    this.createHealthBar(currentX + offset, currentY + offsetY);
    this.drawHitArea();
  }
}
