import { TQuadrant } from "../constants/constants";

export const supplementEntityConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "ARMY" | "GUN" };
}[] = [
  {
    time: 5000,
    data: { quadrant: 0, count: 10, type: "ARMY" },
  },
  {
    time: 15000,
    data: { quadrant: 1, count: 15, type: "ARMY" },
  },
  {
    time: 25000,
    data: { quadrant: -1, count: 20, type: "ARMY" },
  },
];

export const supplementEntityPresetConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "ARMY" | "GUN" };
}[] = [
  { time: -5000, data: { quadrant: -1, count: 4, type: "ARMY" } },
  { time: -5000, data: { quadrant: 1, count: 3, type: "GUN" } },
];
