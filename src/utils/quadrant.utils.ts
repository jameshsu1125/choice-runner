import { TQuadrant } from "../configs/constants/constants";

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
