import { getDepthByOptions } from "../managers/layout/depth.manager";
import {
  Container,
  Image,
  Rectangle,
  Scene,
} from "../configs/constants/constants";
import { GAME_MECHANIC_CONSTANTS } from "../configs/constants/game-mechanic/game-mechanic.constants";
import { endPreset } from "../configs/presets/layout.preset";
import {
  getDisplayPositionAlign as getAlign,
  getDisplaySizeByWidthPercentage as getSize,
} from "../utils/layout.utils";
import { openUrl } from "../utils/storeview";

export type EndGameResult = "VICTORY" | "DEFEAT";
export interface ResultComponentConfig {
  type: EndGameResult;
  onRestart?: () => void;
}

export class EndComponent extends Container {
  public gameResult: EndGameResult = "VICTORY";

  private darkScreen?: Rectangle;
  private banner?: Image;
  private button?: Image;
  private buttonScale: number = 1;
  private hasOpenStoreView: boolean = false;

  private currentDepth = getDepthByOptions("end");

  constructor(scene: Scene) {
    super(scene);
    this.build();
    this.setVisibility(false);
  }

  private restartHandler(): void {
    // TODO: For platform game preview, should have a config for restart or RTB ad serving.
    // location.reload()
    this.hasOpenStoreView = true;
    openUrl();
  }

  private build(): void {
    this.createDarkScreen();
    this.createBanner();
    this.createButton();
  }

  private createDarkScreen(): void {
    const darkScreen = this.scene.add.rectangle(
      0,
      0,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000000,
      1
    );
    darkScreen.setOrigin(0, 0);
    darkScreen.setDepth(this.currentDepth);
    darkScreen.setAlpha(0);
    darkScreen.setInteractive();
    darkScreen.on("pointerdown", this.restartHandler);
    darkScreen.setName("darkScreen");
    this.darkScreen = darkScreen;
  }

  private createBanner(): void {
    const useFullscreen =
      this.gameResult === "VICTORY"
        ? GAME_MECHANIC_CONSTANTS.useFullscreenVictory
        : GAME_MECHANIC_CONSTANTS.useFullscreenDefeat;

    const assets = useFullscreen
      ? this.gameResult === "VICTORY"
        ? "victory-fullscreen"
        : "defeat-fullscreen"
      : this.gameResult === "VICTORY"
      ? "end-banner-victory"
      : "end-banner-defeat";

    const image = this.scene.add.image(0, 0, assets);

    if (useFullscreen) {
      // Scale to fullscreen
      const scaleX = this.scene.scale.width / image.width;
      const scaleY = this.scene.scale.height / image.height;
      const scale = Math.max(scaleX, scaleY);
      image.setScale(scale);
      image.setPosition(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2
      );
    } else {
      // Regular banner sizing
      const { ratio, offsetY } = endPreset.banner;
      const { width, height } = getSize(image, ratio);
      image.setDisplaySize(width, height);
      const { left, top } = getAlign(image, "CENTER_CENTER");
      image.setPosition(left, top + offsetY + 100);
    }

    image.setDepth(this.currentDepth);
    image.setAlpha(0);

    image.setInteractive();
    image.on("pointerdown", this.restartHandler);

    this.banner = image;
  }

  private createButton(): void {
    const { ratio, offsetY } = endPreset.button;
    const image = this.scene.add.image(0, 0, "end-button");
    image.setDepth(this.currentDepth);

    const { width, height } = getSize(image, ratio);
    image.setDisplaySize(width, height);

    const { left, top } = getAlign(image, "CENTER_CENTER");
    image.setPosition(left, top + offsetY);

    this.buttonScale = image.scale;
    image.setScale(this.buttonScale * 2);
    image.setAlpha(0);

    image.setInteractive({ cursor: "pointer" });
    image.on("pointerdown", this.restartHandler);

    this.button = image;
  }

  setVisibility(visible: boolean): void {
    if (visible && this.banner) {
      const useFullscreen =
        this.gameResult === "VICTORY"
          ? GAME_MECHANIC_CONSTANTS.useFullscreenVictory
          : GAME_MECHANIC_CONSTANTS.useFullscreenDefeat;

      const assets = useFullscreen
        ? this.gameResult === "VICTORY"
          ? "victory-fullscreen"
          : "defeat-fullscreen"
        : this.gameResult === "VICTORY"
        ? "end-banner-victory"
        : "end-banner-defeat";

      this.banner.setTexture(assets);

      // Update positioning and scaling based on mode
      if (useFullscreen) {
        const scaleX = this.scene.scale.width / this.banner.width;
        const scaleY = this.scene.scale.height / this.banner.height;
        const scale = Math.max(scaleX, scaleY);
        this.banner.setScale(scale);
        this.banner.setPosition(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2
        );
        this.banner.setRotation(0); // Reset rotation for fullscreen
      } else {
        // Regular banner logic
        if (Math.abs(this.banner.width) < Math.abs(this.banner.height)) {
          const { ratio } = endPreset.banner;
          this.banner.setRotation(-Math.PI / 2);

          const { width, height } = getSize(this.banner, (ratio * 438) / 600);
          this.banner.setDisplaySize(width, height);
        }
      }

      this.scene.tweens.add({
        targets: this.darkScreen,
        alpha: useFullscreen ? 0 : 0.5, // No dark screen for fullscreen mode
        duration: 500,
        ease: "Quart.easeOut",
      });

      const bannerTweenProps = useFullscreen
        ? { alpha: 1 } // No y movement for fullscreen
        : { y: "-=100", alpha: 1 }; // Original animation for regular mode

      this.scene.tweens.add({
        targets: this.banner,
        ...bannerTweenProps,
        duration: 500,
        ease: "Quart.easeOut",
      });

      // Only show button in regular mode, not fullscreen
      if (!useFullscreen) {
        this.scene.tweens.add({
          targets: this.button,
          scale: this.buttonScale,
          alpha: 1,
          delay: 300,
          duration: 400,
          ease: "Back.easeOut",
        });
      }
    }

    this.darkScreen?.setVisible(visible);
    this.banner?.setVisible(visible);

    // Hide button in fullscreen mode
    const useFullscreen =
      this.gameResult === "VICTORY"
        ? GAME_MECHANIC_CONSTANTS.useFullscreenVictory
        : GAME_MECHANIC_CONSTANTS.useFullscreenDefeat;
    this.button?.setVisible(visible && !useFullscreen);
  }
}
