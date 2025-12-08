import { Container, Scene } from "../configs/constants/constants";
import { landingPreset } from "../configs/presets/layout.preset";
import MainScene from "../scenes/main.scene";
import {
    getDisplayPositionByBorderAlign as getAlign,
    getDisplaySizeByWidthPercentage as setSize,
} from "../utils/layout.utils";

export class LandingComponent extends Container {
    private fingerWidth: number = 0;

    constructor(scene: Scene) {
        super(scene);
        this.build();
        this.setDepth(1000);
    }

    private build(): void {
        this.createFinger();
        this.createArrows();
    }

    private createLeftArrow() {
        const { ratio, offsetY } = landingPreset.leftArrow;
        const arrow = this.scene.add.image(0, 0, "arrow-left");

        const { width, height } = setSize(arrow, ratio);
        arrow.setDisplaySize(width, height);

        const x = -this.fingerWidth / 2 - width / 2;
        const y = getAlign(arrow, this.scene, "BOTTOM") + offsetY + 100;
        arrow.setPosition(x, y);

        this.scene.tweens.add({
            targets: arrow,
            y: `-=100`,
            duration: 800,
            ease: "Quart.easeOut",
        });

        this.add(arrow);
    }

    private createRightArrow(): void {
        const { ratio, offsetY } = landingPreset.rightArrow;

        const arrow = this.scene.add.image(0, 0, "arrow-right");

        const { width: rightWidth, height: rightHeight } = setSize(
            arrow,
            ratio
        );
        arrow.setDisplaySize(rightWidth, rightHeight);

        const x = 0 + this.fingerWidth / 2 + rightWidth / 2;
        const y = getAlign(arrow, this.scene, "BOTTOM") + offsetY + 100;
        arrow.setPosition(x, y);

        this.scene.tweens.add({
            targets: arrow,
            y: `-=100`,
            duration: 800,
            delay: 200,
            ease: "Quart.easeOut",
        });

        this.add(arrow);
    }

    private createArrows(): void {
        this.createLeftArrow();
        this.createRightArrow();
    }

    private createFinger(): void {
        const { ratio } = landingPreset.finger;

        const finger = this.scene.add.image(0, 0, "finger");
        const { width, height } = setSize(finger, ratio);
        const y = getAlign(finger, this.scene, "BOTTOM") + 200;

        finger.setDisplaySize(width, height);
        finger.setPosition(0, y);

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

        this.fingerWidth = width;

        this.add(finger);
    }
}

