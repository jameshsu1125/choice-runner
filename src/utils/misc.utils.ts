import { TQuadrant } from "../configs/constants/constants";

export const randomRange = (
  min: number,
  max: number,
  count: number
): number[] => {
  const range = max - min;
  const step = range / (count + 1);
  const randomStep = Math.floor(Math.random() * count) + 1;
  const result: number[] = [];

  [...new Array(count).keys()].forEach((i) => {
    result.push(min + step * ((randomStep + i) % count));
  });

  return result.sort((a, b) => b - a);
};

export const randomQuadrant = (count: number = 2) => {
  const quadrants: TQuadrant[] = [];
  while (quadrants.length < count) {
    const quadrant = Math.floor(-1 + Math.random() * 3) as TQuadrant;
    if (!quadrants.includes(quadrant)) {
      quadrants.push(quadrant);
    }
  }
  return quadrants;
};
