import { TQuadrant } from "../constants/constants";

export const gateEntityConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number }[];
}[] = [
  {
    time: 0,
    data: [
      { quadrant: 1, count: -3 },
      { quadrant: -1, count: 1 },
    ],
  },
  {
    time: 10000,
    data: [
      { quadrant: 1, count: 1 },
      { quadrant: -1, count: -3 },
    ],
  },
  {
    time: 20000,
    data: [
      { quadrant: 1, count: 1 },
      { quadrant: -1, count: -3 },
    ],
  },
];

export const gateEntityPresetConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number };
}[] = [];
