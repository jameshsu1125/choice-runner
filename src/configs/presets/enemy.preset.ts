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
  max: 200,
  value: 200,
  color: 0x7055b7,
};

const boss: TBlood = {
  type: "boss",
  max: 6000,
  value: 6000,
  color: 0xff6600,
};

export const enemyEntityConfig: TEnemyPresetConfig[] = [
  ...randomRange(0, 29999, 58).map(() => {
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

// [
//   { time: 2000, data: { x: 200, type: "follow", blood: smallEnemy } },
//   { time: 3500, data: { x: 100, type: "follow", blood: smallEnemy } },
//   { time: 4500, data: { x: 180, type: "follow", blood: smallEnemy } },
//   { time: 5500, data: { x: 300, type: "follow", blood: smallEnemy } },
//   { time: 7500, data: { x: 100, type: "follow", blood: smallEnemy } },
//   { time: 8500, data: { x: 300, type: "follow", blood: smallEnemy } },
//   { time: 9000, data: { x: 100, type: "follow", blood: smallEnemy } },
//   { time: 12300, data: { x: 60, type: "follow", blood: smallEnemy } },
//   { time: 12300, data: { x: 240, type: "follow", blood: smallEnemy } },
//   { time: 13800, data: { x: 140, type: "follow", blood: smallEnemy } },
//   { time: 14300, data: { x: 300, type: "follow", blood: smallEnemy } },
//   { time: 15300, data: { x: 180, type: "follow", blood: smallEnemy } },
//   { time: 16000, data: { x: 100, type: "follow", blood: smallEnemy } },
//   { time: 16000, data: { x: 300, type: "follow", blood: smallEnemy } },
//   { time: 17500, data: { x: 220, type: "follow", blood: smallEnemy } },
//   { time: 18300, data: { x: 200, type: "follow", blood: smallEnemy } },
//   { time: 19900, data: { x: 80, type: "follow", blood: smallEnemy } },
//   { time: 19700, data: { x: 280, type: "follow", blood: smallEnemy } },
//   { time: 21900, data: { x: 220, type: "follow", blood: smallEnemy } },
//   { time: 23900, data: { x: 100, type: "follow", blood: smallEnemy } },
//   { time: 23900, data: { x: 280, type: "follow", blood: smallEnemy } },
//   { time: 24800, data: { x: 300, type: "follow", blood: smallEnemy } },
//   { time: 26800, data: { x: 220, type: "follow", blood: smallEnemy } },
//   { time: 27400, data: { x: 280, type: "follow", blood: smallEnemy } },
//   { time: 28000, data: { x: 80, type: "follow", blood: smallEnemy } },
//   { time: 28000, data: { x: 240, type: "follow", blood: smallEnemy } },
//   { time: 28800, data: { x: 200, type: "follow", blood: smallEnemy } },
//   { time: 29400, data: { x: 136, type: "follow", blood: smallEnemy } },
//   { time: 30000, data: { x: 220, type: "follow", blood: boss } },
// ];

export const enemyEntityPresetConfig: TEnemyPresetConfig[] = randomRange(
  -7000,
  0,
  0
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

// [
//   { time: -1000, data: { x: 200, type: "follow", blood: practiceEnemy } },
//   { time: -2000, data: { x: 120, type: "follow", blood: practiceEnemy } },
//   { time: -3000, data: { x: 180, type: "follow", blood: practiceEnemy } },
//   { time: -6000, data: { x: 80, type: "follow", blood: practiceEnemy } },
//   { time: -7000, data: { x: 320, type: "follow", blood: practiceEnemy } },
//   { time: -7000, data: { x: 200, type: "follow", blood: practiceEnemy } },
// ];
