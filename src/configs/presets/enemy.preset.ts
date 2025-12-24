import { randomEnemyRange } from "../../utils/misc.utils";

type TBlood = {
  type: "ghost" | "boss";
  max: number;
  value: number;
  color: number;
};

type TEnemyConfig = {
  time: number; // deploy time by enterFrame time reached
  data: {
    x: number; // initial x position
    type: "follow" | "straight"; // movement type
    blood: {
      type: "ghost" | "boss"; // blood type
      max: number; // max blood value
      value: number; // initial blood value
      color: number; // color representation
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
export const enemyAfterConfig: TEnemyConfig[] = [
  ...randomEnemyRange("after", 0, 29999, 60).map(() => {
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

export const enemyBeforeConfig: TEnemyConfig[] = randomEnemyRange(
  "before",
  -7000,
  0,
  10
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

// deploy custom enemy config like this
// export const enemy{After|Before}Config: TEnemyConfig[] = [
//   { time: 10000, data: { x: 200, type: "straight", blood: practiceEnemy } },
//   { time: 13000, data: { x: 300, type: "straight", blood: practiceEnemy } },
//   { time: 15000, data: { x: 400, type: "follow", blood: practiceEnemy } },
//   { time: 16000, data: { x: 500, type: "straight", blood: smallEnemy } },
//   { time: 17000, data: { x: 200, type: "straight", blood: practiceEnemy } },
//   { time: 18000, data: { x: 300, type: "straight", blood: practiceEnemy } },
// ];
