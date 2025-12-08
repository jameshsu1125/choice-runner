import { Container, Scene } from "../../configs/constants/constants";
import { logoPreset } from "../../configs/presets/layout.preset";
import {
    getDisplayPositionByBorderAlign as getAlign,
    getDisplaySizeByWidthPercentage as getSize,
} from "../../utils/layout.utils";

export class LogoComponent extends Container {
    constructor(scene: Scene) {
        super(scene, 0, 0);
        this.build();
        this.setDepth(1);
        this.setName("logo");
    }

    private build(): void {
        const { ratio } = logoPreset;

        const image = this.scene.add.image(0, 0, "logo");
        const { width, height } = getSize(image, ratio);
        image.setDisplaySize(width, height);
        image.setPosition(
            getAlign(image, this.scene, "LEFT"),
            getAlign(image, this.scene, "TOP")
        );
        this.add(image);
    }
}

