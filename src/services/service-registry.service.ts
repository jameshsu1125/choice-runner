import Phaser from "phaser";
import SceneLayoutManager from "../managers/layout/scene-layout.manager";
import EndScreenSystem from "../systems/end-screen.system";
import ServiceLocator from "./service-locator/service-locator.service";

export default class ServiceRegistry {
  constructor(scene: Phaser.Scene) {
    this.createServices(scene);
  }

  private createServices(scene: Phaser.Scene): void {
    ServiceLocator.register("victorySystem", new EndScreenSystem());
    ServiceLocator.register("gameAreaManager", new SceneLayoutManager(scene));
  }
}
