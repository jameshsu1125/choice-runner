import {
  Container,
  CursorKeys,
  Sprite,
} from "../../configs/constants/constants";
import {
  GAME_MECHANIC_CONFIG_SCHEMA,
  GAME_MECHANIC_CONSTANTS,
} from "../../configs/constants/game-mechanic/game-mechanic.constants";
import { playerPreset } from "../../configs/presets/layout.preset";
import { playerFormation } from "../../configs/presets/player.preset";
import { getDepthByOptions } from "../../managers/layout/depth.manager";
import PlayerWidthCounterComponent from "./playerWidthCounter.component";

export class PlayerComponent extends Container {
  public players: PlayerWidthCounterComponent[] = [];
  private playerUpgradeEffect?: Phaser.GameObjects.Sprite;

  private cursors?: CursorKeys = undefined;

  private isStarted = false;
  private touchState = { isDown: false, playerX: 0, pointerX: 0 };
  public playersCount = GAME_MECHANIC_CONSTANTS.playerReinforce;
  private index = 0;
  private onGameOver: () => void;

  private currentDepth = getDepthByOptions("player");

  constructor(scene: Phaser.Scene, onGameOver: () => void) {
    super(scene, 0, 0);

    this.onGameOver = onGameOver;
    this.build();
  }

  private build(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.createPlayer(this.playersCount, false);
    this.createUpgradeEffect();
  }

  private createUpgradeEffect(): void {
    this.playerUpgradeEffect = this.scene.add.sprite(0, 0, "upgradeSheet");
    this.playerUpgradeEffect.setVisible(false);
    this.playerUpgradeEffect.setDepth(getDepthByOptions("end"));
    const [firstPlayer] = this.players;
    this.playerUpgradeEffect.setPosition(
      firstPlayer.player?.x || 0,
      (firstPlayer.player?.y || 0) + playerPreset.effect.offset
    );

    this.playerUpgradeEffect.anims.create({
      key: "upgrade",
      frames: this.scene.anims.generateFrameNames("upgradeSheet", {
        prefix: "",
        start: 1,
        end: 16,
        zeroPad: 3,
      }),
      frameRate: 12,
      hideOnComplete: true,
    });
    this.setUpgradeEffectDisplaySizeByPlayerLength();
  }

  private createPlayer(count: number, autoPlaySheet: boolean = true): void {
    const { max } = GAME_MECHANIC_CONFIG_SCHEMA.playerReinforce;
    const currentCount =
      this.players.length + count > max ? max - this.players.length : count;

    if (currentCount <= 0) return;

    [...new Array(currentCount).keys()].forEach(() => {
      const player = new PlayerWidthCounterComponent(
        this.scene,
        `player-${this.index++}`,
        this.removePlayerByName.bind(this),
        this.currentDepth,
        this.players.length
      );
      this.players.push(player);
      if (autoPlaySheet) {
        player.runAnimationSheet();
      }
    });
    this.calculatePlayersPosition();
  }

  private resetDepths(): void {
    this.players.forEach((player, index) => {
      const { depth = 0 } = playerFormation[index];
      player.resetDepth(this.currentDepth! + depth);
    });
  }

  private setCurrentPositionByUserInput(targetX: number, _: number): void {
    const [player] = this.players;
    if (player.player === null) return;

    const currentFormation = playerFormation.slice(0, this.players.length);
    const xs = currentFormation.map((f) => f.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    const halfWidth = this.scene.scale.width * 0.5;
    const playerWidth = player.player!.displayWidth;
    const minimumX = -halfWidth - playerWidth * minX;
    const maximumX = halfWidth - playerWidth * maxX;
    const currentX = Phaser.Math.Clamp(targetX, minimumX, maximumX);

    this.x = currentX;
    this.calculatePlayersPosition(currentX);
  }

  private calculatePlayersPosition(offset: number = 0): void {
    this.players.forEach((player, index) => {
      if (!player.player) return;
      player.setPositionByIndex(index, offset);
    });
  }

  public increasePlayersCount(count: number = 1): void {
    if (count > 0) {
      this.createPlayer(count);
      this.doAnimationUpgrade();
    } else {
      if (this.players.length - Math.abs(count) <= 0) {
        this.players.forEach((player) => player.destroy());
        this.onGameOver();
      } else {
        const minDiscount = Math.min(this.players.length - 1, Math.abs(count));
        this.players.splice(-minDiscount, minDiscount).forEach((player) => {
          player.destroy();
        });
      }
    }
    this.resetDepths();
  }

  public decreaseBlood(playerHitArea: Sprite): void {
    const [playerComponent] = this.players.filter(
      (p) => p.player?.name === playerHitArea.name
    );

    if (playerComponent) {
      playerComponent.decreaseBlood();
    }
    this.resetDepths();
  }

  public onStart(): void {
    this.isStarted = true;
    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.touchState.isDown = true;
      this.touchState.playerX = this.x;
      this.touchState.pointerX = pointer.x;
    });
    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.touchState.isDown) {
        const deltaX = pointer.x - this.touchState.pointerX;
        const targetX = this.touchState.playerX + deltaX;
        this.setCurrentPositionByUserInput(targetX, deltaX);
      }
    });
    this.scene.input.on("pointerup", () => {
      this.touchState.isDown = false;
    });
    this.players.forEach((player) => {
      player.runAnimationSheet();
    });
  }

  public removeAllPlayers(): void {
    this.players.forEach((player) => player.destroy());
    this.players = [];
  }

  public removePlayerByName(name: string): void {
    const [player] = this.players.filter((p) => p.playerName === name);

    if (player) {
      player.destroy();
      this.players = this.players.filter((p) => p.playerName !== name);

      // no player left, it's over
      if (this.players.length === 0) this.onGameOver();
    }
  }

  public stopAnimationSheet(): void {
    this.players.forEach((player) => player.stopAnimationSheet());
  }

  private doAnimationUpgrade(): void {
    const { max } = GAME_MECHANIC_CONFIG_SCHEMA.playerReinforce;
    if (this.players.length <= 0 || this.players.length >= max) return;

    if (this.playerUpgradeEffect) {
      this.setUpgradeEffectDisplaySizeByPlayerLength();
      this.playerUpgradeEffect.setVisible(true);
      this.playerUpgradeEffect.play("upgrade", true);
    }
  }

  private setUpgradeEffectDisplaySizeByPlayerLength(): void {
    if (!this.playerUpgradeEffect) return;
    const { baseSize } = playerPreset.effect;
    const { length } = this.players;

    const formation = playerFormation.filter((_, index) => index < length);
    const scale = formation.reduce((max, curr) => {
      const maxCoordinate = Math.max(curr.x, curr.y) + 1;
      return maxCoordinate > max ? maxCoordinate : max;
    }, 0);

    this.playerUpgradeEffect.setDisplaySize(baseSize * scale, baseSize * scale);
  }

  public update(): void {
    const { speedByInput, effect } = playerPreset;
    if (!this.cursors || this.players.length === 0 || !this.isStarted) return;
    const deltaX = this.cursors.left.isDown
      ? -speedByInput
      : this.cursors.right.isDown
      ? speedByInput
      : 0;
    const targetX = this.x + deltaX;
    this.setCurrentPositionByUserInput(targetX, deltaX);

    if (this.players.length > 0) {
      this.playerUpgradeEffect?.setPosition(
        this.players[0].player?.x || 0,
        (this.players[0].player?.y || 0) + effect.offset
      );
    }
  }
}
