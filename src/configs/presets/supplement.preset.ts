import { randomRange } from "../../utils/misc.utils";
import { TQuadrant } from "../constants/constants";

export const supplementEntityConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "ARMY" | "GUN" };
}[] = randomRange(0, 25000, 6).map(() => {
  return {
    time: 0 + Math.floor(Math.random() * 25000),
    data: {
      type: Math.random() > 0.5 ? "ARMY" : "GUN",
      quadrant: Math.floor(-1 + Math.random() * 2) as TQuadrant,
      count: Math.floor(1 + Math.random() * 10),
    },
  };
});

// [
//   {
//     time: 5000,
//     data: { quadrant: 0, count: 10, type: "ARMY" },
//   },
//   {
//     time: 15000,
//     data: { quadrant: 1, count: 15, type: "ARMY" },
//   },
//   {
//     time: 25000,
//     data: { quadrant: -1, count: 20, type: "ARMY" },
//   },
// ];

export const supplementEntityPresetConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "ARMY" | "GUN" };
}[] = randomRange(-9000, 0, 2).map((time) => {
  return {
    time,
    data: {
      type: Math.random() > 0.5 ? "ARMY" : "GUN",
      quadrant: Math.floor(-1 + Math.random() * 2) as TQuadrant,
      count: Math.floor(1 + Math.random() * 10),
    },
  };
});

// [
//   { time: -5000, data: { quadrant: -1, count: 4, type: "ARMY" } },
//   { time: -5000, data: { quadrant: 1, count: 3, type: "GUN" } },
// ];
