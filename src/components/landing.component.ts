import { getDepthByOptions } from "../managers/layout/depth.manager";
import { Container, Scene } from "../configs/constants/constants";
import { landingPreset } from "../configs/presets/layout.preset";
import MainScene from "../scenes/main.scene";
import { getDisplaySizeByWidthPercentage as setSize } from "../utils/layout.utils";

export class LandingComponent extends Container {
  private fingerWidth: number = 0;

  constructor(scene: Scene) {
    super(scene);
    this.build();
  }

  private build(): void {
    this.createFinger();
    this.createArrows();
  }

  private createLeftArrow() {
    const { ratio, offsetY } = landingPreset.leftArrow;
    const { width, height } = this.scene.scale;

    const arrow = this.scene.add.image(0, 0, "arrow-left");
    arrow.setDepth(getDepthByOptions("end"));

    const { width: arrowWidth, height: arrowHeight } = setSize(arrow, ratio);
    arrow.setDisplaySize(arrowWidth, arrowHeight);

    const x = width / 2 - this.fingerWidth / 2 - arrowWidth / 2;
    const y = height - arrowHeight / 2 + offsetY + 100;
    arrow.setPosition(x, y);

    this.scene.tweens.add({
      targets: arrow,
      y: `-=100`,
      duration: 800,
      ease: "Quart.easeOut",
    });
  }

  private createRightArrow(): void {
    const { ratio, offsetY } = landingPreset.rightArrow;
    const { width, height } = this.scene.scale;

    const arrow = this.scene.add.image(0, 0, "arrow-right");
    arrow.setDepth(getDepthByOptions("end"));

    const { width: arrowWidth, height: arrowHeight } = setSize(arrow, ratio);
    arrow.setDisplaySize(arrowWidth, arrowHeight);

    const x = width / 2 + this.fingerWidth / 2 + arrowWidth / 2;
    const y = height - arrowHeight / 2 + offsetY + 100;
    arrow.setPosition(x, y);

    this.scene.tweens.add({
      targets: arrow,
      y: `-=100`,
      duration: 800,
      delay: 200,
      ease: "Quart.easeOut",
    });
  }

  private createArrows(): void {
    this.createLeftArrow();
    this.createRightArrow();
  }

  private createFinger(): void {
    const { ratio, offsetY } = landingPreset.finger;
    const { width, height } = this.scene.scale;

    const finger = this.scene.add.image(0, 0, "finger");
    const { width: fingerWidth, height: fingerHeight } = setSize(finger, ratio);
    const x = width / 2;
    const y = height - fingerHeight / 2 + offsetY + 400;

    finger.setDisplaySize(fingerWidth, fingerHeight);
    finger.setPosition(x, y);
    finger.setDepth(getDepthByOptions("end"));

    this.scene.tweens.add({
      targets: finger,
      y: `-=400`,
      duration: 800,
      ease: "Quart.easeOut",
      delay: 100,
      onComplete: () => {
        this.scene?.tweens.add({
          targets: finger,
          x: `+=80`,
          duration: 500,
          ease: "linear",
          onComplete: () => {
            this.scene?.tweens.add({
              targets: finger,
              x: `-=160`,
              duration: 1000,
              ease: "linear",
              yoyo: true,
              repeat: -1,
            });
            const scene = this.scene as MainScene;
            scene.onLandingAnimationEnd();
          },
        });
      },
    });

    this.fingerWidth = fingerWidth;
  }
}
