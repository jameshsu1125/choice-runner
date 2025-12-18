import { gateAfterConfig } from "../configs/presets/gate.preset";
import { gamePreset } from "../configs/presets/layout.preset";
import SceneLayoutManager from "../managers/layout/scene-layout.manager";
import ServiceLocator from "../services/service-locator/service-locator.service";

export default class GateEntity {
  private state = { startTime: 0, index: -1 };
  private entityConfig = gateAfterConfig.map((cfg, index) => ({
    ...cfg,
    index: index + 1,
  }));

  constructor() {}

  public update(time: number): void {
    const currentTime = time - this.state.startTime;

    const filteredEntityConfigs = this.entityConfig
      .filter((config) => currentTime >= config.time)
      .reverse();

    this.entityConfig = this.entityConfig.filter(
      (config) => !filteredEntityConfigs.includes(config)
    );

    if (filteredEntityConfigs.length === 0) return;

    filteredEntityConfigs.forEach((config) => {
      ServiceLocator.get<SceneLayoutManager>(
        "gameAreaManager"
      ).layoutContainers.gate.fire(currentTime, config);
    });
  }
}
