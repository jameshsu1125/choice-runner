import Phaser from "phaser";
import { Container, Sprite } from "../../configs/constants/constants";
import {
  enemyAfterConfig,
  enemyEntityPresetConfig,
} from "../../configs/presets/enemy.preset";
import { enemyPreset } from "../../configs/presets/layout.preset";
import { getDepthByOptions } from "../../managers/layout/depth.manager";
import { TEnemyState } from "./enemy.misc";
import EnemyWidthCounterComponent from "./enemyWithCounter.component";

export class EnemyComponent extends Container {
  private index = 0;
  public enemyState: TEnemyState[] = [];

  private decreaseEnemyBlood: (enemy: Sprite, firepower: Sprite) => void;
  private decreasePlayerBlood: (playerHitArea: Sprite, enemy: Sprite) => void;
  private onGameVictory: () => void;

  constructor(
    scene: Phaser.Scene,
    decreaseEnemyBlood: (enemy: Sprite, firepower: Sprite) => void,
    decreasePlayerBlood: (playerHitArea: Sprite, enemy: Sprite) => void,
    onGameVictory: () => void
  ) {
    super(scene, 0, 0);

    this.decreaseEnemyBlood = decreaseEnemyBlood;
    this.decreasePlayerBlood = decreasePlayerBlood;
    this.onGameVictory = onGameVictory;
    this.setPosition(-scene.scale.width / 2, -scene.scale.height / 2);

    this.buildBeforeStart();
  }

  public buildBeforeStart(): void {
    const { duration } = enemyPreset;
    enemyEntityPresetConfig.reverse().forEach((cfg) => {
      const { data } = cfg;
      this.createEnemy(data, cfg.time);
    });

    this.enemyState.forEach((state) => {
      const percent = (0 - state.startTime) / duration;
      const { target } = state;
      target.setPositionByPercentage(percent);
      target.enemy?.refreshBody();
    });
  }

  public fire(time: number, config: (typeof enemyAfterConfig)[number]): void {
    this.createEnemy(config.data, time);
  }

  private createEnemy(
    config: (typeof enemyAfterConfig)[number]["data"],
    time: number
  ): void {
    const name = `${config.blood.type}-${this.index++}`;

    const enemy = new EnemyWidthCounterComponent(
      this.scene,
      name,
      config,
      this.removeStateByName.bind(this),
      this.decreaseEnemyBlood,
      this.decreasePlayerBlood,
      this.onGameVictory
    );

    enemy.setDepths(getDepthByOptions("character", time));
    this.enemyState.push({ startTime: time, target: enemy });
  }

  public removeStateByName(name: string): void {
    const [state] = this.enemyState.filter(
      (state) => state.target.enemyName === name
    );

    if (state) state.target.destroy();
    this.enemyState = this.enemyState.filter(
      (state) => state.target.enemyName !== name
    );
  }

  public decreaseBlood(enemy: Sprite) {
    const [state] = this.enemyState.filter(
      (state) => state.target.enemyName === enemy.name
    );
    if (state) state.target.decreaseBlood();
  }

  public update(time: number): void {
    const { duration } = enemyPreset;
    this.enemyState.forEach((state) => {
      const percent = (time - state.startTime) / duration;
      const { target } = state;
      target.setPositionByPercentage(percent);
    });
  }

  public adjustSpeedChange(
    currentTime: number,
    oldDuration: number,
    newDuration: number
  ): void {
    // Recalculate startTime for each enemy to maintain their current position
    this.enemyState.forEach((state) => {
      // Calculate current position percentage with old duration
      const currentPercent = (currentTime - state.startTime) / oldDuration;

      // Calculate new startTime to maintain the same percentage with new duration
      state.startTime = currentTime - currentPercent * newDuration;
    });
  }

  public destroy(): void {
    this.enemyState.forEach((state) => state.target.destroy());
    this.enemyState = [];
  }
}
