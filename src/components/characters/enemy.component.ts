import Phaser from "phaser";
import { Container, Sprite } from "../../configs/constants/constants";
import {
  enemyEntityConfig,
  enemyEntityPresetConfig,
} from "../../configs/presets/enemy.preset";
import { enemyPreset } from "../../configs/presets/layout.preset";
import { TEnemyState } from "./enemy.config";
import EnemyWidthCounterComponent from "./enemyWithCounter.component";
import { getDepthByOptions } from "../../managers/layout/depth.manager";

export class EnemyComponent extends Container {
  private index = 0;

  public enemyState: TEnemyState[] = [];

  private decreaseEnemyBlood: (enemy: Sprite, firepower: Sprite) => void;
  private decreasePlayerBlood: (player: Sprite, enemy: Sprite) => void;
  private onGameVictory: () => void;

  constructor(
    scene: Phaser.Scene,
    decreaseEnemyBlood: (enemy: Sprite, firepower: Sprite) => void,
    decreasePlayerBlood: (player: Sprite, enemy: Sprite) => void,
    onGameVictory: () => void
  ) {
    super(scene, 0, 0);

    this.decreaseEnemyBlood = decreaseEnemyBlood;
    this.decreasePlayerBlood = decreasePlayerBlood;
    this.onGameVictory = onGameVictory;
    this.setPosition(-scene.scale.width / 2, -scene.scale.height / 2);

    requestAnimationFrame(() => this.buildBeforeStart());
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

  public fire(time: number, config: (typeof enemyEntityConfig)[number]): void {
    this.createEnemy(config.data, time);
  }

  private createEnemy(
    config: (typeof enemyEntityConfig)[number]["data"],
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

    this.enemyState.push({
      startTime: time,
      target: enemy,
    });
  }

  public removeStateByName(name: string): void {
    const [state] = this.enemyState.filter(
      (state) => state.target.enemyName === name
    );

    if (state) {
      state.target.destroy();
    }

    this.enemyState = this.enemyState.filter(
      (state) => state.target.enemyName !== name
    );
  }

  public loseBlood(enemy: Sprite) {
    const [state] = this.enemyState.filter(
      (state) => state.target.enemyName === enemy.name
    );
    if (state) state.target.loseBlood();
  }

  public update(time: number): void {
    const { timeOffset, duration } = enemyPreset;
    this.enemyState.forEach((state) => {
      const percent = (time - state.startTime + timeOffset) / duration;
      const { target } = state;
      target.setPositionByPercentage(percent);
    });
  }

  public adjustSpeedChange(
    currentTime: number,
    oldDuration: number,
    newDuration: number
  ): void {
    const { timeOffset } = enemyPreset;

    // Recalculate startTime for each enemy to maintain their current position
    this.enemyState.forEach((state) => {
      // Calculate current position percentage with old duration
      const currentPercent =
        (currentTime - state.startTime + timeOffset) / oldDuration;

      // Calculate new startTime to maintain the same percentage with new duration
      state.startTime = currentTime + timeOffset - currentPercent * newDuration;
    });
  }

  public destroy(): void {
    this.enemyState.forEach((state) => state.target.destroy());
    this.enemyState = [];
  }
}
