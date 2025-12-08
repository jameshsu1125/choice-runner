import { GAME_MECHANIC_CONFIG_SCHEMA } from "../../configs/constants/game-mechanic/game-mechanic.constants";
import {
  enemyEntityConfig,
  enemyEntityPresetConfig,
} from "../../configs/presets/enemy.preset";
import { finishLineEntityConfig } from "../../configs/presets/finishLne.preset";
import { gateEntityPresetConfig } from "../../configs/presets/gate.preset";
import {
  supplementEntityConfig,
  supplementEntityPresetConfig,
} from "../../configs/presets/supplement.preset";

const firepowerDepthStart =
  enemyEntityPresetConfig.length +
  enemyEntityConfig.length +
  gateEntityPresetConfig.length +
  supplementEntityConfig.length +
  supplementEntityPresetConfig.length +
  finishLineEntityConfig.length; // number should > all character total count

const depthState = {
  character: 1,
  firepower: firepowerDepthStart, // number should > all character total count
  blood: firepowerDepthStart + 1000, // number should > firepower count,
  player: firepowerDepthStart * 2 + 1000, // all character total count + blood count + firepower count
  end:
    firepowerDepthStart * 2 +
    1000 +
    GAME_MECHANIC_CONFIG_SCHEMA.playerReinforce.max,
};

export const getDepthByOptions = (
  type:
    | "character"
    | "firepower"
    | "gate"
    | "supplement"
    | "finishLine"
    | "end",
  time?: number
) => {
  if (time === undefined || time > 0) {
    switch (type) {
      case "end":
        return depthState.end++;

      case "firepower":
        return depthState.firepower++;

      case "character":
      case "supplement":
      case "gate":
      case "finishLine":
      default:
        return depthState.character++;
    }
  }

  const offsetTime = -500;

  const offsetSupplement = [...supplementEntityPresetConfig].map((cfg) => ({
    ...cfg,
    time: cfg.time - offsetTime,
  }));

  const sortedPresetConfig = [...enemyEntityPresetConfig, ...offsetSupplement]
    .sort((a, b) => b.time - a.time)
    .map((cfg, index) => ({ ...cfg, index }));
  depthState.character += 1;

  return (
    sortedPresetConfig.filter((cfg) => {
      if (cfg.data.type === "ARMY" || cfg.data.type === "GUN") {
        return cfg.time + offsetTime === time;
      }
      return cfg.time === time;
    })[0].index || depthState.character
  );
};
