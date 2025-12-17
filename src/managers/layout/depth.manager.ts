import { GAME_MECHANIC_CONFIG_SCHEMA } from "../../configs/constants/game-mechanic/game-mechanic.constants";
import {
  enemyAfterConfig,
  enemyBeforeConfig,
} from "../../configs/presets/enemy.preset";
import { finishLineConfig } from "../../configs/presets/finishLne.preset";
import {
  gateAfterConfig,
  gateBeforeConfig,
} from "../../configs/presets/gate.preset";
import {
  supplementAfterConfig,
  supplementBeforeConfig,
} from "../../configs/presets/supplement.preset";

// Define depth values for all layout elements

type DepthType =
  | "character"
  | "firepower"
  | "gate"
  | "supplement"
  | "finishLine"
  | "end"
  | "player";

const totalDepth =
  enemyBeforeConfig.length +
  enemyAfterConfig.length +
  gateBeforeConfig.length +
  supplementAfterConfig.length +
  supplementBeforeConfig.length +
  finishLineConfig.length; // number should > all character total count

const depthState = {
  finishLine: 1,
  character: totalDepth, // -= 1
  firepower: totalDepth, // += 1
  blood: totalDepth + 1000, // number should > firepower count,
  player: totalDepth * 2 + 1000, // all character total count + blood count + firepower count
  end:
    totalDepth * 2 + 1000 + GAME_MECHANIC_CONFIG_SCHEMA.playerReinforce.max * 3,
};

export const getDepthByOptions = (type: DepthType, time?: number) => {
  if (
    type === "end" ||
    type === "firepower" ||
    type === "player" ||
    type === "finishLine"
  ) {
    switch (type) {
      case "finishLine":
        return depthState.finishLine;

      case "end":
        return depthState.end++;

      case "player":
        return depthState.player++;

      default:
      case "firepower":
        return depthState.firepower++;
    }
  }

  const sortedConfig = [
    ...enemyBeforeConfig,
    ...enemyAfterConfig,
    ...finishLineConfig,
    ...gateBeforeConfig,
    ...gateAfterConfig,
    ...supplementBeforeConfig,
    ...supplementAfterConfig,
  ]
    .sort((a, b) => b.time - a.time)
    .map((cfg, index) => ({ ...cfg, index }));

  depthState.character -= 1;

  const resultConfig = sortedConfig.filter((cfg) => cfg.time === time);
  return resultConfig[0]?.index || depthState.character;
};
