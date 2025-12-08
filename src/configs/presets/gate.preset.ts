import { TQuadrant } from "../constants/constants";

export const gateEntityConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "gate" };
}[] = [
  {
    time: 0,
    data: { quadrant: 1, count: -3, type: "gate" },
  },
  {
    time: 0,
    data: { quadrant: -1, count: 1, type: "gate" },
  },
  {
    time: 10000,
    data: { quadrant: 1, count: 1, type: "gate" },
  },
  {
    time: 10000,
    data: { quadrant: 1, count: 1, type: "gate" },
  },
  {
    time: 20000,
    data: { quadrant: 1, count: 1, type: "gate" },
  },
  {
    time: 20000,
    data: { quadrant: -1, count: -3, type: "gate" },
  },
];

export const gateEntityPresetConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "gate" };
}[] = [...new Array(1).keys()].map(() => {
  return {
    time: -8000 + Math.floor(Math.random() * 1000),
    data: {
      type: "gate",
      quadrant: Math.floor(-1 + Math.random() * 2) as TQuadrant,
      count: Math.floor(-10 + Math.random() * 20),
    },
  };
});
