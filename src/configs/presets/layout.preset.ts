import { GAME_MECHANIC_CONSTANTS } from "../constants/game-mechanic/game-mechanic.constants";

export const gamePreset = {
  perspective: 0.1,
  delta: 16, // default delta when game are not lag
  preventJumpTime: 500, // If lag causes time difference to exceed this value, don't spawn entities to avoid flickering
  gameVictoryDelay: 1000,
};

export const logoPreset = {
  ratio: 99 / 320, // size ratio
};

export const landingPreset = {
  finger: {
    ratio: 61 / 320, // size ratio
    offsetY: -80, // Y-axis offset
  },
  leftArrow: {
    ratio: 114 / 320, // size ratio
    offsetY: -80, // Y-axis offset
  },
  rightArrow: {
    ratio: 114 / 320, // size ratio
    offsetY: -80, // Y-axis offset
  },
};

export const firepowerPreset = {
  perspective: 30, // perspective effect
  offsetY: -100, // Y-axis offset
  speed: 3200, // bullet speed
  reload: 500, // bullet interval ms
  ratio: {
    level1: 7 / 320, // size ratio
    level2: 10 / 320, // size ratio
  },
  damage: {
    level1: 50, // damage value
    level2: 100, // damage value
  },
  random: {
    enable: false, // whether to enable randomness
    velocity: 200, // random x-axis offset
  },
};

export const playerPreset = {
  speedByInput: 5, // player movement speed
  ratio: 30 / 320, // size ratio
  offsetY: -450, // Y-axis offset
  gap: 100, //  player gap
  randomGap: 40, // random position gap
  healthBar: {
    offsetY: 40, // Y-axis offset
    width: 280,
    height: 100,
  },
};

export const enemyPreset = {
  damage: 100,
  perspective: 5,
  ratios: {
    boss: (220 * 0.8) / 320,
    ghost: 100 / 320,
  },
  randomWidth: 400,
  get duration() {
    return GAME_MECHANIC_CONSTANTS.enemySpeed;
  },
  healthBar: {
    boss: {
      offsetY: -18,
      width: 150,
      height: 25,
    },
    ghost: {
      offsetY: -28,
      width: 70,
      height: 25,
    },
  },
};

export const gatePreset = {
  missOffsetY: 220, // Ratio to adjust the position of the gate when it is missed
  shouldRemoveCollisionOnMax: false,
  ratio: 160 / 320,
  get duration() {
    return GAME_MECHANIC_CONSTANTS.enemySpeed;
  },
  maxCount: 10,
  fontStyle: {
    fontSize: "44px",
    color: "#ffffff",
    fontFamily: "monospace",
    align: "center",
    fixedHeight: 44,
  },
};

export const supplementPreset = {
  missOffsetY: 230,
  ratio: 120 / 320,
  offsetY: -60,
  gap: 80, // quadrant gap
  get duration() {
    return GAME_MECHANIC_CONSTANTS.enemySpeed;
  },
  hitColor: 0xff6666,
  item: {
    gun: {
      ratio: 54 / 320,
      offsetY: 80,
      originY: 68 / 78, // 68 is image scale center, 78 is image height
    },
    arm: {
      ratio: 30 / 320,
      offsetY: 80,
      originY: 108 / 118, // 108 is image scale center, 118 is image height
    },
  },
  fontStyle: {
    fontSize: "144px",
    color: "#ffffff",
    fontFamily: "monospace",
    align: "center",
    boundsAlignV: "middle",
    fixedHeight: 200,
    // backgroundColor: "#000000", // use background color adjustment padding top
    padding: {
      top: 180,
    },
  },
};

export const endPreset = {
  banner: {
    ratio: 300 / 320,
    offsetY: -200,
  },
  button: {
    ratio: 200 / 320,
    offsetY: 600,
  },
};

export const finishLinePreset = {
  missOffsetY: 150,
  ratio: 180 / 320,
  perspective: 0.4,
  get duration() {
    return GAME_MECHANIC_CONSTANTS.enemySpeed;
  },
  timeOffset: 0,
};
