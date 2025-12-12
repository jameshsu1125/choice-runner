import Phaser from "phaser";
import { Container, Scene, Sprite } from "../../configs/constants/constants";
import { GAME_MECHANIC_CONSTANTS } from "../../configs/constants/game-mechanic/game-mechanic.constants";
import {
  firepowerPreset,
  gamePreset,
} from "../../configs/presets/layout.preset";
import { getDepthByOptions } from "../../managers/layout/depth.manager";
import SceneLayoutManager from "../../managers/layout/scene-layout.manager";
import ServiceLocator from "../../services/service-locator/service-locator.service";
import {
  getDisplayPositionByBorderAlign as getAlign,
  getDisplaySizeByWidthPercentage as getSize,
} from "../../utils/layout.utils";
import { PlayerComponent } from "../characters/player.component";

const FIREPOWER_CONSTANTS = {
  PLAYER_FIRE_DELAY_MS: 30,
  MAX_VELOCITY_Y: -3500, // Maximum upward velocity (most negative value allowed)
  STUCK_VELOCITY_THRESHOLD: -200,
  STUCK_FRAME_COUNT_LIMIT: 3,
  STUCK_POSITION_DELTA_LIMIT: 5,
  NEAR_ZERO_VELOCITY_THRESHOLD: 50,
  TOP_BOUNDARY_Y: 100,
};

export class FirepowerComponent extends Container {
  private isStarted = false;
  private baseScale = 1;
  private index = 0;

  public level = 1;

  private player: PlayerComponent;
  public firepowerContainer: Sprite[] = [];
  private bulletPositionTracker = new Map<
    string,
    { y: number; frameCount: number }
  >();

  private increaseGateCount: (gate: Sprite, firepower: Sprite) => void;
  private decreaseEnemyBlood: (enemy: Sprite, firepower: Sprite) => void;
  private decreaseSupplementCount: (name: string, firepower: Sprite) => void;

  constructor(
    scene: Scene,
    increaseGateCount: (gate: Sprite, firepower: Sprite) => void,
    decreaseEnemyBlood: (enemy: Sprite, firepower: Sprite) => void,
    decreaseSupplementCount: (name: string, firepower: Sprite) => void
  ) {
    super(scene, 0, 0);

    this.increaseGateCount = increaseGateCount;
    this.decreaseEnemyBlood = decreaseEnemyBlood;
    this.decreaseSupplementCount = decreaseSupplementCount;

    this.player =
      ServiceLocator.get<SceneLayoutManager>(
        "gameAreaManager"
      ).layoutContainers.player;

    this.build();
    this.setDepth(getDepthByOptions("firepower"));
  }

  private build(): void {
    if (this.player && this.player.players.length > 0) {
      const [player] = this.player.players;
      const { offsetY } = firepowerPreset;

      if (player.player) {
        this.setPosition(
          getAlign(player.player, this.scene, "LEFT"),
          getAlign(player.player, this.scene, "TOP") -
            player.displayHeight * 0.5 +
            offsetY
        );
      }
    }
  }

  public fire(delta: number): void {
    if (!this.isStarted || !this.player || this.player.players.length === 0)
      return;

    const { perspective, delta: gameDelta } = gamePreset;
    const { perspective: firePerspective, offsetY, ratio } = firepowerPreset;
    const { speed, random } = firepowerPreset;

    const safeDelta = Math.max(10, Math.min(delta, 100));

    this.player.players.forEach((player, playerIndex) => {
      if (!player.player) return;

      const delayMs = playerIndex * FIREPOWER_CONSTANTS.PLAYER_FIRE_DELAY_MS;

      this.scene.time.delayedCall(delayMs, () => {
        if (!player.player || !player.player.active) return;

        const firepower = this.scene.physics.add
          .sprite(
            player.player.x,
            player.player.y - offsetY,
            this.level === 1 ? "firepower-level-1" : "firepower-level-2"
          )
          .refreshBody();

        const bulletName = `firepower-${this.index++}`;
        firepower.setName(bulletName);

        const currentRatio = this.level === 1 ? ratio.level1 : ratio.level2;

        const { width, height } = getSize(firepower, currentRatio);
        firepower.setDisplaySize(width * 2, height * 2);
        this.baseScale = firepower.scale;

        const velocityX =
          ((player.player.x - this.scene.scale.width / 2) *
            firePerspective *
            -1 *
            perspective *
            (700 / player.player.y)) /
          safeDelta;

        const currentVelocity = random.enable
          ? -random.velocity * 0.5 + Math.random() * random.velocity + velocityX
          : velocityX;

        firepower.setPosition(
          player.player.x - player.player.displayWidth / 2,
          player.player.y - player.displayHeight + offsetY - 100
        );

        const bulletVelocityY = -(speed * gameDelta) / safeDelta;
        // Use Math.max to cap maximum speed (prevent bullets from moving too fast)
        // Since velocities are negative (moving up), Math.max chooses the less negative value
        const finalVelocityY = Math.max(
          bulletVelocityY,
          FIREPOWER_CONSTANTS.MAX_VELOCITY_Y
        );

        firepower.setVelocity(currentVelocity, finalVelocityY);
        firepower.setRotation(
          Phaser.Math.DegToRad(
            (player.player.x - this.scene.scale.width / 2) *
              firePerspective *
              -0.005 *
              perspective
          )
        );

        this.bulletPositionTracker.set(bulletName, {
          y: firepower.y,
          frameCount: 0,
        });

        this.add(firepower);

        if (!GAME_MECHANIC_CONSTANTS.stopCollision)
          this.addCollision(firepower);
        this.firepowerContainer.push(firepower);

        this.scene.sound.add("audio-fire").play({ volume: 0.1 });
      });
    });
  }

  private addCollision(firepower: Sprite) {
    const { layoutContainers } =
      ServiceLocator.get<SceneLayoutManager>("gameAreaManager");

    let hasCollided = false;

    layoutContainers.gate.gateState.forEach((state) => {
      if (state.target.gate) {
        this.scene.physics.add.overlap(
          firepower,
          state.target.gate,
          () => {
            if (!state.target.gate || hasCollided || !firepower.active) return;
            hasCollided = true;
            this.increaseGateCount(state.target.gate, firepower);
          },
          undefined,
          this.scene
        );
      }
    });

    layoutContainers.enemy.enemyState.forEach((state) => {
      if (state.target.enemy) {
        this.scene.physics.add.overlap(
          firepower,
          state.target.enemy,
          () => {
            if (hasCollided || !firepower.active) return;
            hasCollided = true;
            this.decreaseEnemyBlood(state.target.enemy!, firepower);
          },
          undefined,
          this.scene
        );
      }
    });

    layoutContainers.supplement.supplementState.forEach((state) => {
      if (state.target.bucket) {
        this.scene.physics.add.overlap(
          firepower,
          state.target.bucket!,
          () => {
            if (hasCollided || !firepower.active) return;
            hasCollided = true;
            this.decreaseSupplementCount(
              state.target.supplementName,
              firepower
            );
          },
          undefined,
          this.scene
        );
      }
    });
  }

  public increaseFirepowerLevel(): void {
    this.level = Math.min(this.level + 1, 2);

    this.firepowerContainer.forEach((firepower) => {
      firepower.setTexture(
        this.level === 1 ? "firepower-level-1" : "firepower-level-2"
      );
    });
  }

  removeFirepowerByName(name: string): void {
    const index = this.firepowerContainer.findIndex((fp) => fp.name === name);
    if (index !== -1) {
      this._removeFirepowerByIndex(index);
    }
  }

  private _removeFirepowerByIndex(index: number): void {
    if (index < 0 || index >= this.firepowerContainer.length) return;

    const firepower = this.firepowerContainer[index];
    if (firepower) {
      if (firepower.body) {
        firepower.body.enable = false;
      }
      firepower.destroy();
      this.bulletPositionTracker.delete(firepower.name);
      this.firepowerContainer.splice(index, 1);
    }
  }

  private _isBulletStuck(firepower: Sprite): boolean {
    if (!firepower.body) return false;

    const velocityY = firepower.body.velocity.y;
    if (velocityY > FIREPOWER_CONSTANTS.STUCK_VELOCITY_THRESHOLD) {
      return true;
    }

    const tracker = this.bulletPositionTracker.get(firepower.name);
    if (tracker) {
      const positionDelta = Math.abs(firepower.y - tracker.y);
      tracker.frameCount++;

      if (tracker.frameCount > FIREPOWER_CONSTANTS.STUCK_FRAME_COUNT_LIMIT) {
        if (positionDelta < FIREPOWER_CONSTANTS.STUCK_POSITION_DELTA_LIMIT) {
          return true;
        } else {
          tracker.y = firepower.y;
          tracker.frameCount = 0;
        }
      }
    }

    if (
      velocityY === 0 ||
      Math.abs(velocityY) < FIREPOWER_CONSTANTS.NEAR_ZERO_VELOCITY_THRESHOLD
    ) {
      return true;
    }

    return false;
  }

  public update(): void {
    if (!this.isStarted) return;
    const { perspective } = gamePreset;

    for (let i = this.firepowerContainer.length - 1; i >= 0; i--) {
      const firepower = this.firepowerContainer[i];

      if (!firepower.active) {
        this._removeFirepowerByIndex(i);
        continue;
      }

      if (this._isBulletStuck(firepower)) {
        this._removeFirepowerByIndex(i);
        continue;
      }

      const scale =
        this.baseScale -
        this.baseScale *
          (1 - perspective) *
          (Math.abs(this.scene.scale.height - firepower.y) /
            this.scene.scale.height);

      firepower.setScale(scale, scale);

      if (firepower.y < FIREPOWER_CONSTANTS.TOP_BOUNDARY_Y) {
        this._removeFirepowerByIndex(i);
      }
    }
  }

  public onStart(): void {
    this.isStarted = true;
  }

  public destroy(): void {
    this.firepowerContainer.forEach((firepower) => {
      firepower.destroy();
    });
    this.firepowerContainer = [];
    this.bulletPositionTracker.clear();
  }
}
