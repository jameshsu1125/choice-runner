import { firepowerPreset } from "../configs/presets/layout.preset";
import SceneLayoutManager from "../managers/layout/scene-layout.manager";
import ServiceLocator from "../services/service-locator/service-locator.service";

/**
 * FirepowerEntity class representing the firepower component in the game.
 */
export default class FirepowerEntity {
  private isStarted = false;
  private state = { startTime: 0, index: -1 };

  constructor() {}

  public onStart(): void {
    this.isStarted = true;
  }

  public update(time: number, delta: number): void {
    if (!this.isStarted) return;
    const { reload } = firepowerPreset;

    const index = Math.floor((time - this.state.startTime) / reload);
    if (index !== this.state.index && index > this.state.index) {
      this.state.index = index;
      ServiceLocator.get<SceneLayoutManager>(
        "gameAreaManager"
      ).layoutContainers.firepower.fire(delta);
    }
  }
}
