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
  private cursors?: CursorKeys = undefined;

  private isStarted = false;
  private touchState = { isDown: false, playerX: 0, pointerX: 0 };
  public playersCount = GAME_MECHANIC_CONSTANTS.playerReinforce;
  private index = 0;

  private decreasePlayerBlood: (playerHitArea: Sprite, enemy: Sprite) => void;

  private increasePlayerCount: (count: number, gateName: string) => void;
  private onGameOver: () => void;

  private currentDepth = getDepthByOptions("player");

  constructor(
    scene: Phaser.Scene,
    decreasePlayerBlood: (playerHitArea: Sprite, enemy: Sprite) => void,
    increasePlayerCount: (count: number, gateName: string) => void,
    onGameOver: () => void
  ) {
    super(scene, 0, 0);
    this.decreasePlayerBlood = decreasePlayerBlood;
    this.increasePlayerCount = increasePlayerCount;
    this.onGameOver = onGameOver;
    this.build();
  }

  private build(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.createPlayer(this.playersCount, false);
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
        this.decreasePlayerBlood,
        this.increasePlayerCount,
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
    if (count > 0) this.createPlayer(count);
    else {
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
  }

  public decreaseBlood(playerHitArea: Sprite): void {
    const [playerComponent] = this.players.filter((p) => {
      console.log(playerHitArea.name, p.player?.name);

      return p.player?.name === playerHitArea.name;
    });

    if (playerComponent) {
      playerComponent.decreaseBlood();
    }
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

  public update(): void {
    const { speedByInput } = playerPreset;
    if (!this.cursors || this.players.length === 0 || !this.isStarted) return;
    const deltaX = this.cursors.left.isDown
      ? -speedByInput
      : this.cursors.right.isDown
      ? speedByInput
      : 0;
    const targetX = this.x + deltaX;
    this.setCurrentPositionByUserInput(targetX, deltaX);
  }
}
