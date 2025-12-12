import { GAME_MECHANIC_CONSTANTS } from "../constants/game-mechanic/game-mechanic.constants";

export const gamePreset = {
  perspective: 0.1,
  delta: 16, // default delta when game are not lag
  preventJumpTime: 500, // (ms)如果太lag到時間差超過這個值，則不新增實體避免閃現
  gameVictoryDelay: 1000,
};

export const logoPreset = {
  ratio: 99 / 320, // 大小比例
};

export const landingPreset = {
  finger: {
    ratio: 61 / 320, // 大小比例
  },
  leftArrow: {
    ratio: 114 / 320, // 大小比例
    offsetY: -80, // Y轴偏移
  },
  rightArrow: {
    ratio: 114 / 320, // 大小比例
    offsetY: -80, // Y轴偏移
  },
};

export const firepowerPreset = {
  perspective: 80, // 透视效果
  offsetY: -40, // Y轴偏移
  speed: 3200, // 子弹速度
  reload: 500, // 子彈間隔 ms
  ratio: {
    level1: 9 / 320, // 大小比例
    level2: 17 / 320, // 大小比例
  },
  damage: {
    level1: 50, // 伤害值
    level2: 100, // 伤害值
  },
  random: {
    enable: false, // 是否启用随機
    velocity: 200, // 随機x轴偏移
  },
};

export const playerPreset = {
  speedByInput: 5, // 玩家移動速度
  ratio: (30 / 320) * 1.2, // 大小比例
  offsetY: -450, // Y轴偏移
  gap: 120, //  玩家間距
  isRadom: false, // 是否隨機位置
  randomGap: 40, // 隨機位置間距
  healthBar: {
    offsetY: 40, // Y轴偏移
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
