import { GAME_MECHANIC_CONFIG_SCHEMA } from "../../configs/constants/game-mechanic/game-mechanic.constants";
import {
  enemyEntityConfig,
  enemyEntityPresetConfig,
} from "../../configs/presets/enemy.preset";
import { finishLineEntityConfig } from "../../configs/presets/finishLne.preset";
import {
  gateEntityConfig,
  gateEntityPresetConfig,
} from "../../configs/presets/gate.preset";
import {
  supplementEntityConfig,
  supplementEntityPresetConfig,
} from "../../configs/presets/supplement.preset";

const totalDepth =
  enemyEntityPresetConfig.length +
  enemyEntityConfig.length +
  gateEntityPresetConfig.length +
  supplementEntityConfig.length +
  supplementEntityPresetConfig.length +
  finishLineEntityConfig.length; // number should > all character total count

const depthState = {
  character: totalDepth, // -= 1
  firepower: totalDepth, // += 1
  blood: totalDepth + 1000, // number should > firepower count,
  player: totalDepth * 2 + 1000, // all character total count + blood count + firepower count
  end: totalDepth * 2 + 1000 + GAME_MECHANIC_CONFIG_SCHEMA.playerReinforce.max,
};

export const getDepthByOptions = (
  type:
    | "character"
    | "firepower"
    | "gate"
    | "supplement"
    | "finishLine"
    | "end"
    | "player",
  time?: number
) => {
  if (type === "end" || type === "firepower" || type === "player") {
    switch (type) {
      case "end":
        return depthState.end++;

      case "player":
        return depthState.player++;

      default:
      case "firepower":
        return depthState.firepower++;
    }
  }

  const sortedPresetConfig = [
    ...enemyEntityPresetConfig,
    ...enemyEntityConfig,
    ...finishLineEntityConfig,
    ...gateEntityPresetConfig,
    ...gateEntityConfig,
    ...supplementEntityPresetConfig,
    ...supplementEntityConfig,
  ]
    .sort((a, b) => b.time - a.time)
    .map((cfg, index) => ({ ...cfg, index }));

  depthState.character -= 1;

  const resultConfig = sortedPresetConfig.filter((cfg) => cfg.time === time);
  return resultConfig[0]?.index || depthState.character;
};
