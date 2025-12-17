import EnterFrame from "lesca-enterframe";
import Phaser from "phaser";
import { EnemyComponent } from "../../components/characters/enemy.component";
import { PlayerComponent } from "../../components/characters/player.component";
import { CtaButtonComponent } from "../../components/ctaButton/ctaButton.component";
import { EndComponent } from "../../components/end.component";
import { FinishComponent } from "../../components/finishLine/finishLine.component";
import { FirepowerComponent } from "../../components/firepower/firepower.component";
import { GateComponent } from "../../components/gate/gate.component";
import { LandingComponent } from "../../components/landing.component";
import { LogoComponent } from "../../components/logo/logo.component";
import { SupplementComponent } from "../../components/supplement/supplement.component";
import { Sprite } from "../../configs/constants/constants";
import { GAME_MECHANIC_CONSTANTS } from "../../configs/constants/game-mechanic/game-mechanic.constants";
import { gamePreset } from "../../configs/presets/layout.preset";
import { ANCHORS } from "../../utils/anchors.constants";
import { scaleImageToCover } from "../../utils/layout.utils";
import BaseLayoutManager from "./base-layout.manager";

type Background = Phaser.GameObjects.Image;

export interface LayoutContainers {
  sceneContainer: Phaser.GameObjects.Container & { zIndex: number };

  landing: LandingComponent;
  background: Background;
  logo: LogoComponent;
  ctaButton?: CtaButtonComponent;
  player: PlayerComponent;
  firepower: FirepowerComponent;
  gate: GateComponent;
  supplement: SupplementComponent;
  enemy: EnemyComponent;
  finishLine: FinishComponent;

  endScreenComponent: EndComponent;
}

export interface GameAreaConfig {
  containerWidth?: number;
  containerHeight?: number;
}

export default class SceneLayoutManager {
  private scene: Phaser.Scene;
  private constants: Required<GameAreaConfig>;
  private layoutManager: BaseLayoutManager;
  public layoutContainers!: LayoutContainers;
  public isGameOver = false;
  private gameOverCallback: () => void = () => {};

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.layoutManager = new BaseLayoutManager(scene);
    this.constants = {
      containerWidth: this.scene.scale.width,
      containerHeight: this.scene.scale.height,
    };
  }

  public createGameAreas(): LayoutContainers {
    this.createMainContainer();

    this.layoutContainers.background = this.createBackground();
    this.layoutContainers.logo = this.createLogo();
    this.layoutContainers.player = this.createPlayer();
    this.layoutContainers.enemy = this.createEnemy();
    this.layoutContainers.gate = this.createGate();
    this.layoutContainers.supplement = this.createSupplement();
    this.layoutContainers.firepower = this.createFirepower();
    this.layoutContainers.finishLine = this.createFinishLine();
    if (GAME_MECHANIC_CONSTANTS.showCtaButton) {
      this.layoutContainers.ctaButton = this.createCtaButton();
    }
    this.layoutContainers.endScreenComponent = this.createEndScreenOverlay();
    this.layoutContainers.landing = this.createLanding();

    const containerItems: Phaser.GameObjects.GameObject[] = [
      this.layoutContainers.background,
      this.layoutContainers.finishLine,
      this.layoutContainers.gate,
      this.layoutContainers.supplement,
      this.layoutContainers.enemy,
      this.layoutContainers.firepower,
      this.layoutContainers.player,
      this.layoutContainers.logo,
    ];

    if (this.layoutContainers.ctaButton) {
      containerItems.push(this.layoutContainers.ctaButton);
    }

    containerItems.push(
      this.layoutContainers.landing,
      this.layoutContainers.endScreenComponent
    );

    this.layoutContainers.sceneContainer.add(containerItems);

    EnterFrame.add(({ delta }: { delta: number }) => {
      this.layoutContainers.player.update();
      this.layoutContainers.gate.update(delta);
      this.layoutContainers.enemy.update(delta);
      this.layoutContainers.supplement.update(delta);
      this.layoutContainers.finishLine.update(delta);
    });

    return this.layoutContainers;
  }

  private createFinishLine(): FinishComponent {
    const finishLineComponent = new FinishComponent(
      this.scene,
      this.onGameVictory.bind(this)
    );
    return finishLineComponent;
  }

  private createSupplement(): SupplementComponent {
    const firepowerSupplement = new SupplementComponent(
      this.scene,
      this.increaseSupplementCountByType.bind(this)
    );
    return firepowerSupplement;
  }

  private createMainContainer(): void {
    const sceneContainer = this.scene.add.container(0, 0);
    this.layoutManager.placeAt(sceneContainer, ANCHORS.CENTER);
    this.layoutContainers = {
      sceneContainer: sceneContainer,
    } as LayoutContainers;
  }

  private createLanding(): LandingComponent {
    const landingComponent = new LandingComponent(this.scene);
    return landingComponent;
  }

  private createEnemy(): EnemyComponent {
    const enemyComponent = new EnemyComponent(
      this.scene,
      this.decreaseEnemyBlood.bind(this),
      this.decreasePlayerBlood.bind(this),
      this.onGameVictory.bind(this)
    );
    return enemyComponent;
  }

  private createFirepower(): FirepowerComponent {
    const firepowerComponent = new FirepowerComponent(
      this.scene,
      this.increaseGateCount.bind(this),
      this.decreaseEnemyBlood.bind(this),
      this.decreaseSupplementCount.bind(this)
    );
    return firepowerComponent;
  }

  private createPlayer(): PlayerComponent {
    const playerComponent = new PlayerComponent(
      this.scene,
      this.decreasePlayerBlood.bind(this),
      this.increasePlayerCount.bind(this),
      this.onGameOver.bind(this)
    );
    return playerComponent;
  }

  private createLogo(): LogoComponent {
    const logoComponent = new LogoComponent(this.scene);
    return logoComponent;
  }

  private createCtaButton(): CtaButtonComponent {
    const ctaButtonComponent = new CtaButtonComponent(this.scene);
    return ctaButtonComponent;
  }

  private createGate(): GateComponent {
    const gateComponent = new GateComponent(
      this.scene,
      this.increaseGateCount.bind(this),
      this.increasePlayerCount.bind(this)
    );
    return gateComponent;
  }

  private createBackground(): Background {
    const background = this.scene.add.image(0, 0, "background");
    scaleImageToCover(
      background,
      this.constants.containerWidth,
      this.constants.containerHeight
    );
    background.setDepth(1);
    background.setName("background");

    return background;
  }

  private createEndScreenOverlay(): EndComponent {
    const endScreenOverlay = new EndComponent(this.scene);
    return endScreenOverlay;
  }

  public increasePlayerCount(count: number = 1, gateName: string): void {
    this.layoutContainers.player.increasePlayersCount(count);
    this.layoutContainers.gate.removeStateByName(gateName);
    if (count > 0) {
      this.scene.sound.add("audio-award").play({ volume: 0.5 });
    } else {
      this.scene.sound.add("audio-death").play({ volume: 0.5 });
    }
  }

  public increaseGateCount(
    gate: Phaser.Physics.Arcade.Sprite,
    firepower: Phaser.Physics.Arcade.Sprite
  ) {
    this.layoutContainers.firepower.removeFirepowerByName(firepower.name);
    this.layoutContainers.gate.increaseGateCountByName(gate.name);
  }

  public decreasePlayerBlood(playerHitArea: Sprite, enemy: Sprite): void {
    if (enemy.name.startsWith("boss")) {
      // this.layoutContainers.enemy.removeStateByName(enemy.name);
      this.layoutContainers.player.removeAllPlayers();
      this.onGameOver();
    } else {
      this.layoutContainers.player.decreaseBlood(playerHitArea);
      this.layoutContainers.enemy.removeStateByName(enemy.name);
    }
    this.scene.sound.add("audio-death").play({ volume: 0.5 });
  }

  public decreaseEnemyBlood(
    enemy: Phaser.Physics.Arcade.Sprite,
    firepower: Phaser.Physics.Arcade.Sprite
  ): void {
    this.layoutContainers.enemy.decreaseBlood(enemy);
    this.layoutContainers.firepower.removeFirepowerByName(firepower.name);
  }

  public decreaseSupplementCount(
    supplementName: string,
    firepower: Phaser.Physics.Arcade.Sprite
  ): void {
    this.layoutContainers.firepower.removeFirepowerByName(firepower.name);
    this.layoutContainers.supplement.decreaseSupplementCount(supplementName);
  }

  public increaseSupplementCountByType(
    type: "ARMY" | "GUN",
    supplementName: string
  ) {
    this.layoutContainers.supplement.removeStateByName(supplementName);
    if (type === "ARMY") this.layoutContainers.player.increasePlayersCount(1);
    else this.layoutContainers.firepower.increaseFirepowerLevel();
    this.scene.sound.add("audio-award").play({ volume: 0.5 });
  }

  public onGameOver(): void {
    this.isGameOver = true;
    this.gameOverCallback();
    EnterFrame.stop();

    this.scene.tweens.add({
      targets: { time: 0 },
      time: gamePreset.gameVictoryDelay,
      onComplete: () => {
        Object.entries(this.layoutContainers).forEach(([key, container]) => {
          if (key === "endScreenComponent") {
            container.gameResult = "DEFEAT";
            container.setVisibility(true);
          }
        });
      },
    });

    this.scene.sound.add("audio-defeat").play({ volume: 0.5 });
  }

  public onGameVictory(): void {
    this.isGameOver = true;
    this.gameOverCallback();

    this.layoutContainers.player.stopAnimationSheet();
    EnterFrame.stop();

    this.scene.tweens.add({
      targets: { time: 0 },
      time: gamePreset.gameVictoryDelay,
      onComplete: () => {
        Object.entries(this.layoutContainers).forEach(([key, container]) => {
          if (key === "endScreenComponent") {
            container.gameResult = "VICTORY";
            container.setVisibility(true);
          }
        });
      },
    });
    this.scene.sound.add("audio-victory").play({ volume: 0.5 });
  }

  public update(): void {
    if (this.isGameOver) return;
    this.layoutContainers.player.update();
    this.layoutContainers.firepower.update();
    this.checkEnemyPlayerCollision();
  }

  public onStart(gameOver: () => void): void {
    this.gameOverCallback = gameOver;
    this.layoutContainers.player.onStart();
    this.layoutContainers.firepower.onStart();
    this.layoutContainers.supplement.onStart();

    this.layoutContainers.landing.destroy();
    this.scene.sound.add("audio-bgm").play({ volume: 0.4, loop: true });
  }

  private checkEnemyPlayerCollision(): void {
    const { enemy, player } = this.layoutContainers;

    const { enemyState } = enemy;
    const { players } = player;

    enemyState.forEach((state) => {
      if (!state.target.enemy) return;
      const enemyBounds = state.target.enemy.getBounds();

      players.forEach((playerSprite) => {
        if (!playerSprite.hitArea) return;
        const playerBounds = playerSprite.hitArea?.getBounds();
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(enemyBounds, playerBounds)
        ) {
          if (!state.target.enemy) return;
          this.decreasePlayerBlood(playerSprite.hitArea, state.target.enemy);
        }
      });
    });
  }
}
