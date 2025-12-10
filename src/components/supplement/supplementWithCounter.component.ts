import {
  Container,
  Graphics,
  Image,
  Scene,
  Sprite,
  Text,
} from "../../configs/constants/constants";
import { GAME_MECHANIC_CONSTANTS } from "../../configs/constants/game-mechanic/game-mechanic.constants";
import { Easing } from "../../configs/constants/layout.constants";
import {
  playerPreset,
  supplementPreset,
} from "../../configs/presets/layout.preset";
import SceneLayoutManager from "../../managers/layout/scene-layout.manager";
import ServiceLocator from "../../services/service-locator/service-locator.service";
import { getDisplaySizeByWidthPercentage as getSize } from "../../utils/layout.utils";
import {
  getSupplementItemEffect,
  hitSupplementEffect,
  TConfig,
  TSupplementType,
} from "./supplement.config";

export default class SupplementWithCounterComponent extends Container {
  public isDestroyed = false;
  public supplementName: string;

  private num = 0;

  // items
  public collisionArea?: Graphics;
  private bucket?: Sprite;
  private text?: Text;
  private item?: Image;

  private graphicsName = "glow-particle";
  private graphics = this.scene.make.graphics();

  private removeStateByName: (name: string) => void;
  private decreaseSupplementCount: (name: string, firepower: Sprite) => void;
  private increaseSupplementCountByType: (
    type: TSupplementType,
    name: string
  ) => void;

  private config?: TConfig;

  constructor(
    scene: Scene,
    config: TConfig,
    name: string,
    removeStateByName: (name: string) => void,
    decreaseSupplementCount: (name: string, firepower: Sprite) => void,
    increaseSupplementCountByType: (type: TSupplementType, name: string) => void
  ) {
    super(scene, 0, 0);

    this.supplementName = name;
    this.config = config;
    this.num = this.config?.count || 0;

    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillCircle(16, 16, 16);
    this.graphics.generateTexture(this.graphicsName, 32, 32);
    this.graphics.destroy();

    this.removeStateByName = removeStateByName;
    this.increaseSupplementCountByType = increaseSupplementCountByType;
    this.decreaseSupplementCount = decreaseSupplementCount;

    this.build();
  }

  private build(): void {
    this.createBucket();
    this.createText();
    this.createItem();
    this.drawCollisionArea();
  }

  public setDepths(depth: number): void {
    this.bucket?.setDepth(depth);
    this.text?.setDepth(depth);
    this.item?.setDepth(depth);
    this.collisionArea?.setDepth(depth);
  }

  private drawCollisionArea(): void {
    this.collisionArea?.clear();

    if (this.bucket) {
      this.collisionArea = this.scene.add.graphics();
      this.collisionArea.fillStyle(0xff0000, 0.3);
      this.collisionArea.fillRect(
        this.bucket.x - this.bucket.displayWidth / 2,
        this.bucket.y - this.bucket.displayHeight / 2,
        this.bucket.displayWidth,
        this.bucket.displayHeight
      );
      if (GAME_MECHANIC_CONSTANTS.stopCollision)
        this.addCollision(this.collisionArea);
    }
  }

  private createItem(): void {
    const preset =
      this.config?.type === "GUN"
        ? supplementPreset.item.gun
        : supplementPreset.item.arm;
    const { ratio } = preset;

    this.item = this.scene.add.image(
      0,
      0,
      this.config?.type === "GUN"
        ? "supplement-item-firepower"
        : "supplement-item-army"
    );
    const { width, height } = getSize(this.item, ratio);

    this.item.setDisplaySize(width, height);
    this.item.setOrigin(0.5, 1);
  }

  private createBucket(): void {
    const { ratio } = supplementPreset;

    if (GAME_MECHANIC_CONSTANTS.useSupplementAtlas) {
      // Use atlas with animation
      this.bucket = this.scene.physics.add.sprite(0, 0, "supplementSheet");
      this.bucket.setName(this.supplementName);

      const { width, height } = getSize(this.bucket, ratio);
      this.bucket.setDisplaySize(width, height);

      this.bucket.anims.create({
        key: "rolling",
        frames: this.scene.anims.generateFrameNames("supplementSheet", {
          prefix: "",
          start: 0,
          end: 11,
          zeroPad: 3,
        }),
        frameRate: 9,
        repeat: -1,
      });
    } else {
      // Use single sprite image
      this.bucket = this.scene.physics.add.sprite(0, 0, "supplementSprite");
      const { width, height } = getSize(this.bucket, ratio);
      this.bucket.setName(this.supplementName);
      this.bucket.setDisplaySize(width, height);
    }
  }

  private createText(): void {
    const { fontStyle } = supplementPreset;
    const { x, y } = this.bucket || { x: 0, y: 0 };

    this.text = this.scene.add.text(x, y, `${this.num}`, {
      ...fontStyle,
      fixedHeight: this.bucket?.displayHeight,
      fixedWidth: this.bucket?.displayWidth,
    });
    this.text.setOrigin(0.5, 0.5);
  }

  private addCollision(collisionArea: Phaser.GameObjects.Graphics): void {
    const { firepower } =
      ServiceLocator.get<SceneLayoutManager>(
        "gameAreaManager"
      ).layoutContainers;

    if (firepower) {
      firepower.firepowerContainer.forEach((firepower) => {
        this.scene.physics.add.collider(
          collisionArea,
          firepower,
          () => {
            if (this.isDestroyed) return;
            this.decreaseSupplementCount(this.supplementName, firepower);
          },
          undefined,
          this
        );

        this.scene.physics.add.overlap(
          collisionArea,
          firepower,
          () => {
            if (this.isDestroyed) return;
            this.decreaseSupplementCount(this.supplementName, firepower);
          },
          undefined,
          this
        );
      });
    }
  }

  public setPxy(x: number, y: number, scale: number): void {
    const preset =
      this.config?.type === "GUN"
        ? supplementPreset.item.gun
        : supplementPreset.item.arm;

    const { offsetY } = preset;

    this.text?.setPosition(x, y);
    this.bucket?.setPosition(x, y);
    this.bucket?.refreshBody();

    const itemY = y - this.bucket!.displayHeight * 0.5 + offsetY * scale;
    this.item?.setPosition(x, itemY);
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.item?.destroy();
    this.text?.destroy();
    this.bucket?.destroy();
    this.collisionArea?.clear();
    this.collisionArea?.destroy();

    if (this.bucket && this.bucket.body) this.bucket.body.enable = false;

    this.removeStateByName(this.supplementName);
    this.setVisibility(false);
    super.destroy(true);
  }

  public doAnimationAndDestroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.bucket && this.item) {
      getSupplementItemEffect(
        this.bucket,
        this.item,
        this.graphicsName,
        () => {
          this.text?.destroy();
          this.text?.setVisible(false);
        },
        () => {
          this.bucket?.destroy();
          this.item?.destroy();
          this.bucket?.setVisible(false);
          this.item?.setVisible(false);
          this.removeStateByName(this.supplementName);
        }
      );
    }
  }

  public decreaseNum() {
    this.num -= 1;
    if (this.num <= 0) {
      this.num = 0;
      this.text?.setText(`${this.num}`);
      this.increaseSupplementCountByType(
        this.config?.type || "ARMY",
        this.supplementName
      );
      this.collisionArea?.clear();
    } else {
      this.text?.setText(`${this.num}`);
      if (this.bucket && this.item)
        hitSupplementEffect([this.bucket, this.item]);
    }
  }

  setVisibility(value: boolean) {
    this.bucket?.setVisible(value);
    this.text?.setVisible(value);
    this.item?.setVisible(value);
    this.collisionArea?.clear();
  }

  public update(percentage: number): void {
    const { item, bucket, text, collisionArea } = this;
    if (!bucket || !text || !item || !collisionArea || this.isDestroyed) return;

    const { offsetY } = playerPreset;
    const { gap, missOffsetY } = supplementPreset;

    const currentPercent = Easing(percentage);

    // Calculate scale based on screen width percentage: 10% normally, 30% when close
    const minScale = 0.05; // 10% of screen width
    const maxScale = 0.2; // 30% of screen width when close
    const targetScale = minScale + (maxScale - minScale) * currentPercent;

    // Apply screen-width-based scaling to both bucket and item
    const bucketScale = targetScale * (this.scene.scale.width / bucket.width);
    const itemScale = targetScale * (this.scene.scale.width / item.width);

    bucket.setScale(bucketScale, bucketScale);
    text.setScale(bucketScale, bucketScale);
    item.setScale(itemScale, itemScale);

    const x =
      this.scene.scale.width / 2 +
      (this.config?.quadrant || 0) * (bucket.displayWidth + gap);
    const y =
      (this.scene.scale.height + Math.abs(bucket.displayHeight)) *
      currentPercent;

    this.setPxy(x, y, bucketScale);

    this.drawCollisionArea();

    const missPositionY =
      this.scene.scale.height - bucket.displayHeight - offsetY - missOffsetY;

    if (y > missPositionY) {
      this.destroy();
    }
  }
}
