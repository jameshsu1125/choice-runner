import Phaser from "phaser";
import {
  Container,
  Sprite,
  TQuadrant,
} from "../../configs/constants/constants";
import {
  gateAfterConfig,
  gateBeforeConfig,
} from "../../configs/presets/gate.preset";
import { gatePreset } from "../../configs/presets/layout.preset";
import { getDepthByOptions } from "../../managers/layout/depth.manager";
import { TGateState } from "./gate.misc";
import GateWithCounterComponent from "./gateWithCounter.component";

export class GateComponent extends Container {
  public gateState: TGateState[] = [];
  private increaseGateCount: (gate: Sprite, firepower: Sprite) => void;
  private increasePlayerCount: (count: number, gateName: string) => void;
  private index = 0;

  constructor(
    scene: Phaser.Scene,
    increaseGateCount: (gate: Sprite, firepower: Sprite) => void,
    increasePlayerCount: (count: number, gateName: string) => void
  ) {
    super(scene, 0, 0);

    this.increaseGateCount = increaseGateCount;
    this.increasePlayerCount = increasePlayerCount;

    this.setPosition(-scene.scale.width / 2, -scene.scale.height / 2);

    requestAnimationFrame(() => this.buildBeforeStart());
  }

  private buildBeforeStart(): void {
    const { duration } = gatePreset;
    gateBeforeConfig.reverse().forEach((cfg) => {
      const currentConfig = {
        quadrant: cfg.data.quadrant,
        count: cfg.data.count,
      };
      this.createGate(currentConfig, cfg.time);
    });

    this.gateState.forEach((state) => {
      const percent = (0 - state.startTime) / duration;
      const { target } = state;
      target.setPositionByPercentage(percent);
    });
  }

  public fire(time: number, config: (typeof gateAfterConfig)[number]): void {
    this.createGate(config.data, time);
  }

  private createGate(
    config: { quadrant: TQuadrant; count: number },
    time: number
  ): void {
    const name = `${time}-${this.index++}`;
    const gate = new GateWithCounterComponent(
      this.scene,
      config,
      name,
      this.increaseGateCount,
      this.increasePlayerCount
    );
    gate.setDepths(getDepthByOptions("gate", time));

    this.gateState.push({
      startTime: time,
      target: gate,
    });
  }

  public removeStateByName(name: string): void {
    const [state] = this.gateState.filter(
      (state) => state.target.gateName === name
    );

    this.gateState = this.gateState.filter(
      (state) => state.target.gateName !== name
    );

    if (state) {
      state.target.doAnimationAndDestroy();
    }
  }

  public increaseGateCountByName(name: string): void {
    const [state] = this.gateState.filter(
      (state) => state.target.gateName === name
    );
    if (state.target) state.target.increaseNum();
  }

  public update(time: number): void {
    const { duration } = gatePreset;
    this.gateState.forEach((state) => {
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
    // Recalculate startTime for each gate to maintain their current position
    this.gateState.forEach((state) => {
      // Calculate current position percentage with old duration
      const currentPercent = (currentTime - state.startTime) / oldDuration;

      // Calculate new startTime to maintain the same percentage with new duration
      state.startTime = currentTime - currentPercent * newDuration;
    });
  }

  public destroy(): void {
    this.gateState.forEach((state) => {
      state.target.destroy();
    });
    this.gateState = [];
  }
}
