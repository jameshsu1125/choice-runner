import Phaser from "phaser";
import { Container } from "../../configs/constants/constants";
import {
  gatePreset,
  supplementPreset,
} from "../../configs/presets/layout.preset";
import {
  supplementAfterConfig,
  supplementBeforeConfig,
} from "../../configs/presets/supplement.preset";
import { getDepthByOptions } from "../../managers/layout/depth.manager";
import { TConfig, TSupplementState } from "./supplement.misc";
import SupplementWithCounterComponent from "./supplementWithCounter.component";

export class SupplementComponent extends Container {
  private index = 0;
  public supplementState: TSupplementState[] = [];

  private increaseSupplementCountByType: (
    type: "ARMY" | "GUN",
    supplementName: string
  ) => void;

  constructor(
    scene: Phaser.Scene,
    increaseSupplementCountByType: (
      type: "ARMY" | "GUN",
      supplementName: string
    ) => void
  ) {
    super(scene, 0, 0);
    this.setPosition(-scene.scale.width / 2, -scene.scale.height / 2);
    this.increaseSupplementCountByType = increaseSupplementCountByType;
    requestAnimationFrame(() => this.buildBeforeStart());
  }

  private buildBeforeStart(): void {
    const { duration } = supplementPreset;
    supplementBeforeConfig.reverse().forEach((cfg) => {
      const currentConfig = {
        quadrant: cfg.data.quadrant,
        count: cfg.data.count,
        type: cfg.data.type,
      };
      this.createSupplement(currentConfig, cfg.time);
    });

    this.supplementState.forEach((state) => {
      const percent = (0 - state.startTime) / duration;
      const { target } = state;
      target.update(percent);
    });
  }

  public fire(
    time: number,
    config: (typeof supplementAfterConfig)[number]
  ): void {
    this.createSupplement(config.data, time);
  }

  private createSupplement(config: TConfig, time: number): void {
    const name = `supplement-${this.index++}`;
    const supplement = new SupplementWithCounterComponent(
      this.scene,
      config,
      name,
      this.removeStateByName.bind(this),
      this.decreaseSupplementCount,
      this.increaseSupplementCountByType
    );

    this.supplementState.push({
      startTime: time,
      target: supplement,
    });
    const depth = getDepthByOptions("supplement", time);
    supplement.setDepths(depth);
  }

  public removeStateByName(name: string): void {
    const [state] = this.supplementState.filter(
      (state) => state.target.supplementName === name
    );

    if (state) {
      state.target.doAnimationAndDestroy();
    }

    this.supplementState = this.supplementState.filter(
      (state) => state.target.supplementName !== name
    );
  }

  public update(time: number): void {
    const { duration } = gatePreset;
    this.supplementState.forEach((state) => {
      const percent = (time - state.startTime) / duration;
      const { target } = state;
      target.update(percent);
    });
  }

  public adjustSpeedChange(
    currentTime: number,
    oldDuration: number,
    newDuration: number
  ): void {
    // Recalculate startTime for each supplement to maintain their current position
    this.supplementState.forEach((state) => {
      // Calculate current position percentage with old duration
      const currentPercent = (currentTime - state.startTime) / oldDuration;

      // Calculate new startTime to maintain the same percentage with new duration
      state.startTime = currentTime - currentPercent * newDuration;
    });
  }

  public destroy(): void {
    this.supplementState.forEach((state) => {
      state.target.destroy();
    });
    this.supplementState = [];
  }

  public decreaseSupplementCount(supplementName: string): void {
    if (!this.supplementState) return;

    const [state] = this.supplementState?.filter(
      (state) => state.target.supplementName === supplementName
    );

    if (state) {
      state.target.decreaseNum();
    }
  }

  public onStart(): void {
    this.supplementState.forEach((state) => {
      state.target.doRollingAnimation();
    });
  }
}
