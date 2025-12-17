// PreloadScene: Loads all assets for the merge game
import Phaser from "phaser";
import { GAME_MECHANIC_CONSTANTS } from "../configs/constants/game-mechanic/game-mechanic.constants";
import spriteConfig from "../configs/sprite-config.json";
import { getFinalGameAssets } from "../generics/game-assets";
import { PHASER_HELPERS } from "../generics/phaser/phaser-helpers";
import { SpriteConfig } from "../types/sprite-config.types";

export default class PreloadScene extends Phaser.Scene {
  private config: SpriteConfig;

  constructor() {
    super("PreloadScene");
    this.config = spriteConfig as SpriteConfig;
  }

  preload() {
    PHASER_HELPERS.loadAssetsToPhaser(this, getFinalGameAssets().assets);
    this.loadFonts();
    this.loadAtlases();
  }

  create() {
    // We use html loading instead of Phaser loading,
    // because loading Phaser.js and ASSETS_CONFIG.js takes time.
    const loadingContainer =
      document.querySelector<HTMLElement>("#loading-container");
    const backgroundContainer = document.querySelector<HTMLElement>(
      "#background-container"
    );
    if (loadingContainer) {
      loadingContainer.style.display = "none";
    }
    if (backgroundContainer) {
      backgroundContainer.style.display = "none";
    }

    this.scene.start("MainScene");
  }

  private loadFonts() {
    const fontPath = window.__DEV__
      ? "public/assets/fonts/LTMuseum-Light.ttf"
      : "_ASSETS_/fonts/LTMuseum-Light.ttf";
    this.load.font("pixel-font", fontPath, "truetype");
  }

  private loadAtlases() {
    // Load player sprite based on configuration
    if (GAME_MECHANIC_CONSTANTS.usePlayerAtlas) {
      this.load.atlas(
        "playerSheet",
        window.base64Map["assets"]["player-atlas"],
        window.base64Map["assets"]["player-atlas-json"]
      );
    } else {
      // Load single player image instead of atlas
      this.load.image("playerSprite", window.base64Map["assets"]["player"]);
    }

    // Load enemy sprite based on configuration
    if (GAME_MECHANIC_CONSTANTS.useEnemyAtlas) {
      this.load.atlas(
        "enemySheet",
        window.base64Map["assets"]["enemy-atlas"],
        window.base64Map["assets"]["enemy-atlas-json"]
      );
    } else {
      // Load single enemy image instead of atlas
      this.load.image("enemySprite", window.base64Map["assets"]["enemy"]);
    }

    // Load boss sprite based on configuration
    if (GAME_MECHANIC_CONSTANTS.useBossAtlas) {
      this.load.atlas(
        "bossSheet",
        window.base64Map["assets"]["boss-atlas"],
        window.base64Map["assets"]["boss-atlas-json"]
      );
    } else {
      // Load single boss image instead of atlas
      this.load.image("bossSprite", window.base64Map["assets"]["boss"]);
    }

    // Load Supplement sprite based on configuration
    if (GAME_MECHANIC_CONSTANTS.useSupplementAtlas) {
      this.load.atlas(
        "supplementSheet",
        window.base64Map["assets"]["supplement-shipment-atlas"],
        window.base64Map["assets"]["supplement-shipment-atlas-json"]
      );
    } else {
      // Load single Supplement image instead of atlas
      this.load.image(
        "supplementSprite",
        window.base64Map["assets"]["supplement-shipment"]
      );
    }

    this.load.atlas(
      "supplementBrokenSheet",
      window.base64Map["assets"]["supplement-shipment-broken-atlas"],
      window.base64Map["assets"]["supplement-shipment-broken-atlas-json"]
    );
  }
}
