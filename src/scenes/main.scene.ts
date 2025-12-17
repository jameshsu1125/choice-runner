import EnterFrame from "lesca-enterframe";
import Phaser from "phaser";
import EnemyEntity from "../entities/enemy.entity";
import FinishLineEntity from "../entities/finishLine.entity";
import FirepowerEntity from "../entities/firepower.entity";
import GateEntity from "../entities/gate.entity";
import SupplementEntity from "../entities/supplement.entity";
import SceneLayoutManager from "../managers/layout/scene-layout.manager";
import { DebugService } from "../services/debug.service";
import ServiceLocator from "../services/service-locator/service-locator.service";
import ServiceRegistry from "../services/service-registry.service";
import EndScreenSystem from "../systems/end-screen.system";
import { openStoreUrl } from "../utils/storeview";
// import { DebugOverlay } from "../services/event-bus/debug-overlay";

export default class MainScene extends Phaser.Scene {
  private firepowerEntity?: FirepowerEntity;
  private gateEntity?: GateEntity;
  private enemyEntity?: EnemyEntity;
  private supplementEntity?: SupplementEntity;
  private finishLineEntity?: FinishLineEntity;

  private isGameOver = false;
  public zIndex: number = 998;

  constructor() {
    super("MainScene");
  }

  /**
   * This fn gets called by Phaser.js when the scene is created
   */
  create() {
    // DebugOverlay.getInstance();
    new ServiceRegistry(this);
    this.initializeChoreography();
    this.initEventListeners();
    this.initializeDebugService();
  }

  private initializeDebugService(): void {
    // Initialize debug service
    const debugService = DebugService.getInstance();
    debugService.initialize(this);
  }

  private initializeChoreography(): void {
    this.initializeSystems();
  }

  private initializeSystems(): void {
    ServiceLocator.get<SceneLayoutManager>("gameAreaManager").createGameAreas();
    ServiceLocator.get<EndScreenSystem>("victorySystem").initialize();
  }

  private initEventListeners(): void {
    this.addEntityListener();
  }

  private addEntityListener(): void {
    this.firepowerEntity = new FirepowerEntity();
    this.gateEntity = new GateEntity();
    this.enemyEntity = new EnemyEntity();
    this.supplementEntity = new SupplementEntity();
    this.finishLineEntity = new FinishLineEntity();

    EnterFrame.add((time: { delta: number }) => {
      this.gateEntity?.update(time.delta);
      this.enemyEntity?.update(time.delta);
      this.supplementEntity?.update(time.delta);
      this.finishLineEntity?.update(time.delta);
    });
  }

  public onLandingAnimationEnd(): void {
    if (this.isGameOver) return;
    const onUserInput = (event: Event) => {
      // Ignore clicks on debug panel (lil-gui)
      const target = event.target as HTMLElement;
      if (
        target?.closest(".lil-gui") ||
        target?.classList.contains("lil-gui")
      ) {
        return;
      }

      ServiceLocator.get<SceneLayoutManager>("gameAreaManager").onStart(
        this.onGameOver.bind(this)
      );

      this.firepowerEntity?.onStart();

      EnterFrame.play();

      window.removeEventListener("pointerdown", onUserInput);
      window.removeEventListener("keydown", onUserInput);

      // window.addEventListener("blur", () => {
      //   if (!STOP_COLLISION) return location.reload();
      // });
    };
    window.addEventListener("pointerdown", onUserInput);
    window.addEventListener("keydown", onUserInput);
  }

  public getIndex(): number {
    this.zIndex -= 1;
    return this.zIndex;
  }

  private onGameOver(): void {
    this.isGameOver = true;

    // TODO: For platform game preview, should have a config for restart or RTB ad serving.
    this.time.delayedCall(2000, () => {
      openStoreUrl();
    });
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) return;
    ServiceLocator.get<SceneLayoutManager>("gameAreaManager").update();
    this.firepowerEntity?.update(time, delta);
  }
}
