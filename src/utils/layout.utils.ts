import Phaser from "phaser";

/**
 * Scales a game object to cover the given dimensions while maintaining aspect ratio
 * @param gameObject The game object to scale, with displayWidth/displayHeight properties
 * @param targetWidth The target width to cover
 * @param targetHeight The target height to cover
 */
export function scaleImageToCover(
    gameObject: Phaser.GameObjects.Image,
    targetWidth: number,
    targetHeight: number
): void {
    if (gameObject.displayWidth <= 0 || gameObject.displayHeight <= 0) {
        if (process.env.NODE_ENV === "development") {
            console.warn(
                "scaleToCover: Invalid gameObject dimensions. Cannot calculate aspect ratio."
            );
        }
        return;
    }

    const objRatio = gameObject.displayWidth / gameObject.displayHeight;
    const targetRatio = targetWidth / targetHeight;

    let newWidth: number;
    let newHeight: number;

    if (objRatio > targetRatio) {
        // Object is wider than target, fit to height
        newHeight = targetHeight;
        newWidth = newHeight * objRatio;
    } else {
        // Object is taller than target, fit to width
        newWidth = targetWidth;
        newHeight = newWidth / objRatio;
    }

    gameObject.setDisplaySize(newWidth, newHeight);
}

/**
 * Calculates display dimensions for a game object based on a percentage of the screen width, maintaining aspect ratio.
 * @param gameObject The Phaser Game Object to scale. Must have width, height, and setDisplaySize properties.
 * @param widthPercentage The desired width as a percentage of the screen width (0 to 1).
 * @returns An object with the calculated width and height.
 */
export function getDisplaySizeByWidthPercentage(
    gameObject:
        | Phaser.GameObjects.Image
        | Phaser.GameObjects.Sprite
        | Phaser.GameObjects.DOMElement,
    widthPercentage: number
): { width: number; height: number; ratio: number } {
    const aspectRatio = gameObject.width / gameObject.height;
    const targetWidth = gameObject.scene.scale.width * widthPercentage;
    return {
        width: targetWidth,
        height: targetWidth / aspectRatio,
        ratio: aspectRatio,
    };
}

export function getDisplayPositionByBorderAlign(
    gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
    scene: Phaser.Scene,
    align: "LEFT" | "RIGHT" | "TOP" | "BOTTOM"
): number {
    const { width, height } = scene.scale;

    switch (align) {
        case "LEFT":
            return -width / 2 + gameObject.displayWidth / 2;

        case "RIGHT":
            return width / 2 - gameObject.displayWidth / 2;

        case "TOP":
            return -height / 2 + gameObject.displayHeight / 2;

        case "BOTTOM":
            return height / 2 - gameObject.displayHeight / 2;
    }
    return 0;
}

export function getDisplayPositionAlign(
    gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
    align:
        | "LEFT_TOP"
        | "RIGHT_TOP"
        | "CENTER_TOP"
        | "LEFT_CENTER"
        | "CENTER_CENTER"
        | "RIGHT_CENTER"
        | "LEFT_BOTTOM"
        | "CENTER_BOTTOM"
        | "RIGHT_BOTTOM"
): { left: number; top: number } {
    const { width, height } = gameObject.scene.scale;

    switch (align) {
        case "RIGHT_TOP":
            return {
                left: width - gameObject.displayWidth / 2,
                top: gameObject.displayHeight / 2,
            };

        case "CENTER_TOP":
            return {
                left: width / 2,
                top: gameObject.displayHeight / 2,
            };

        case "LEFT_CENTER":
            return {
                left: gameObject.displayWidth / 2,
                top: (height - gameObject.displayHeight / 2) / 2,
            };

        case "CENTER_CENTER":
            return {
                left: width / 2,
                top: height / 2,
            };

        case "RIGHT_CENTER":
            return {
                left: width - gameObject.displayWidth / 2,
                top: height / 2,
            };

        case "LEFT_BOTTOM":
            return {
                left: gameObject.displayWidth / 2,
                top: height - gameObject.displayHeight / 2,
            };

        case "CENTER_BOTTOM":
            return {
                left: width / 2,
                top: height - gameObject.displayHeight / 2,
            };

        case "RIGHT_BOTTOM":
            return {
                left: width - gameObject.displayWidth / 2,
                top: height - gameObject.displayHeight / 2,
            };

        default:
        case "LEFT_TOP":
            return {
                left: gameObject.displayWidth / 2,
                top: gameObject.displayHeight / 2,
            };
    }
}

