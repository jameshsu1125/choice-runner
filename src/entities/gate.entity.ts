import { gateEntityAfterConfig } from "../configs/presets/gate.preset";
import { gamePreset } from "../configs/presets/layout.preset";
import SceneLayoutManager from "../managers/layout/scene-layout.manager";
import ServiceLocator from "../services/service-locator/service-locator.service";

export default class GateEntity {
  private state = { startTime: 0, index: -1 };
  private entityConfig = gateEntityAfterConfig.map((cfg, index) => ({
    ...cfg,
    index: index + 1,
  }));
  constructor() {}

  public update(time: number): void {
    const currentTime = time - this.state.startTime;
    const [config] = this.entityConfig
      .filter(
        (config) =>
          currentTime >= config.time &&
          currentTime - config.time < gamePreset.preventJumpTime
      )
      .reverse();

    if (config && this.state.index !== config?.index) {
      this.state.index = config?.index || 0;
      ServiceLocator.get<SceneLayoutManager>(
        "gameAreaManager"
      ).layoutContainers.gate.fire(currentTime, config);
    }
  }
}
