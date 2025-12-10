import { BooleanSchema, NumericSchema } from "./game-mechanic.interface";

const NUMERIC_MIN_VALUE = 1;

// Game Logic Configuration Schema
type GameMechanicConfigSchema = {
  playerReinforce: NumericSchema;
  enemySpeed: NumericSchema;
  stopCollision: BooleanSchema;
  usePlayerAtlas: BooleanSchema;
  useEnemyAtlas: BooleanSchema;
  useBossAtlas: BooleanSchema;
  useFullscreenVictory: BooleanSchema;
  useFullscreenDefeat: BooleanSchema;
  showCtaButton: BooleanSchema;
};

// Configuration Schema Definition
export const GAME_MECHANIC_CONFIG_SCHEMA: GameMechanicConfigSchema = {
  playerReinforce: {
    min: NUMERIC_MIN_VALUE,
    max: 20,
    default: 1,
  },
  enemySpeed: {
    min: 5000,
    max: 25000,
    default: 13986, // Default duration (lower = faster movement)
  },
  stopCollision: {
    default: false,
  },
  usePlayerAtlas: {
    default: true, // Set to false to use single player.png image instead of atlas
  },
  useEnemyAtlas: {
    default: true, // Set to false to use single enemy.png image instead of atlas
  },
  useBossAtlas: {
    default: true, // Set to false to use single boss.png image instead of atlas
  },
  useFullscreenVictory: {
    default: false, // Set to true to use fullscreen victory image
  },
  useFullscreenDefeat: {
    default: false, // Set to true to use fullscreen defeat image
  },
  showCtaButton: {
    default: true, // Set to false to hide the PLAY NOW button
  },
};

// Create a mutable version of constants that can be updated at runtime
const createGameMechanicConstants = () => {
  const constants = {} as {
    [K in keyof typeof GAME_MECHANIC_CONFIG_SCHEMA]: (typeof GAME_MECHANIC_CONFIG_SCHEMA)[K]["default"];
  };

  Object.entries(GAME_MECHANIC_CONFIG_SCHEMA).forEach(([key, value]) => {
    (constants as any)[key] = value.default;
  });

  return constants;
};

export const GAME_MECHANIC_CONSTANTS = createGameMechanicConstants();
