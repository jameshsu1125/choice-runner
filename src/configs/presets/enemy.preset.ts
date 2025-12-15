import { randomRange } from "../../utils/misc.utils";

type TBlood = {
  type: "ghost" | "boss";
  max: number;
  value: number;
  color: number;
};

type TEnemyPresetConfig = {
  time: number;
  data: {
    x: number;
    type: "follow" | "straight";
    blood: {
      type: "ghost" | "boss";
      max: number;
      value: number;
      color: number;
    };
  };
};

const practiceEnemy: TBlood = {
  type: "ghost",
  max: 100,
  value: 100,
  color: 0x60df4a,
};

const smallEnemy: TBlood = {
  type: "ghost",
  max: 400,
  value: 400,
  color: 0x7055b7,
};

const boss: TBlood = {
  type: "boss",
  max: 6000,
  value: 6000,
  color: 0xff6600,
};

// config need to split before and after game start for stage deploy.
export const enemyAfterConfig: TEnemyPresetConfig[] = [
  ...randomRange(0, 29999, 60).map(() => {
    return {
      time: 0 + Math.floor(Math.random() * 29999),
      data: {
        x: Math.random() * 400,
        type:
          Math.random() > 0.5
            ? "follow"
            : ("straight" as "follow" | "straight"),
        blood: smallEnemy,
      },
    };
  }),
  { time: 30000, data: { x: 220, type: "follow", blood: boss } },
];

export const enemyEntityPresetConfig: TEnemyPresetConfig[] = randomRange(
  -7000,
  0,
  5
).map((time) => {
  return {
    time,
    data: {
      x: Math.random() * 400,
      type: Math.random() > 0.5 ? "follow" : "straight",
      blood: practiceEnemy,
    },
  };
});
