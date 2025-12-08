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

  const supplementOffsetTime = -500;
  const fateOffsetTime = -400;

  const offsetPresetSupplement = [...supplementEntityPresetConfig].map(
    (cfg) => ({
      ...cfg,
      time: cfg.time - supplementOffsetTime,
    })
  );

  const offsetSupplement = [...supplementEntityConfig].map((cfg) => ({
    ...cfg,
    time: cfg.time - supplementOffsetTime,
  }));

  const offsetPresetGate = [...gateEntityPresetConfig].map((cfg) => ({
    ...cfg,
    time: cfg.time - fateOffsetTime,
  }));

  const sortedPresetConfig = [
    ...enemyEntityPresetConfig,
    ...finishLineEntityConfig,
    ...offsetPresetGate,
    ...offsetPresetSupplement,
    ...offsetSupplement,
  ]
    .sort((a, b) => b.time - a.time)
    .map((cfg, index) => ({ ...cfg, index }));

  depthState.character += 1;

  const resultConfig = sortedPresetConfig.filter((cfg) => {
    if (cfg.data.type === "ARMY" || cfg.data.type === "GUN") {
      return cfg.time + supplementOffsetTime === time;
    }
    if (cfg.data.type === "gate") {
      return cfg.time + fateOffsetTime === time;
    }
    return cfg.time === time;
  });
  return resultConfig[0]?.index || depthState.character;
};
