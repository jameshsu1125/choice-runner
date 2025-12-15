import { Container, Scene } from "../../configs/constants/constants";
import { getDisplayPositionByBorderAlign as getAlign } from "../../utils/layout.utils";
import { openUrl } from "../../utils/storeview";

export class CtaButtonComponent extends Container {
  constructor(scene: Scene) {
    super(scene, 0, 0);
    this.build();
    this.setDepth(1);
    this.setName("ctaButton");
  }

  private build(): void {
    const image = this.scene.add.image(0, 0, "play-button");
    image.setDisplaySize(360, 120);
    image.setPosition(
      getAlign(image, this.scene, "LEFT") + 48,
      getAlign(image, this.scene, "TOP") + 140
    );
    image.setInteractive({ cursor: "pointer" });
    image.on("pointerdown", () => {
      openUrl();
    });
    this.add(image);

    const playButtonText = this.scene.add.text(
      getAlign(image, this.scene, "LEFT") + -100,
      getAlign(image, this.scene, "TOP") + 100,
      "PLAY NOW",
      {
        font: "48px Arial",
        color: "#FFFFFF",
        stroke: "#540000",
        strokeThickness: 12,
        fontStyle: "bold",
        letterSpacing: 4,
      }
    );
    playButtonText.setInteractive({ cursor: "pointer" });
    playButtonText.on("pointerdown", () => {
      openUrl();
    });
    this.add(playButtonText);
  }
}
