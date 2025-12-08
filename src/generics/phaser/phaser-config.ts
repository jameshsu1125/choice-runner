// Phaser game configuration for Match & Fight Game
import Phaser from "phaser";
import BootScene from "../../scenes/boot.scene";
import MainScene from "../../scenes/main.scene";
import PreloadScene from "../../scenes/preload.scene";

export const PHASER_CONFIG = {
    type: Phaser.AUTO,
    parent: "game-container",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1600,
        height: 2400,
        parent: "app",
    },

    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
    scene: [BootScene, PreloadScene, MainScene],
};

