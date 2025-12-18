import { randomQuadrant } from "../../utils/quadrant.utils";
import { TQuadrant } from "../constants/constants";

// config need to split before and after game start for stage deploy.
export const supplementState = {
  count: {
    before: { min: 1, max: 4 }, // practice time should be easier
    after: { min: 5, max: 15 },
  },
  deploy: {
    before: [-5000],
    after: [5000, 15000, 25000],
  },
};

export const supplementAfterConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "ARMY" | "GUN" };
}[] = supplementState.deploy.after
  .map((time, index) => {
    const quadrant = randomQuadrant();
    return [...new Array(2).keys()].map((i) => ({
      time,
      data: {
        type: "ARMY" as const,
        quadrant: quadrant[i] || (0 as TQuadrant),
        count:
          Math.floor(
            supplementState.count.after.min +
              Math.random() *
                (supplementState.count.after.max -
                  supplementState.count.after.min)
          ) *
          (index + 1),
      },
    }));
  })
  .flat();

export const supplementBeforeConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "ARMY" | "GUN" };
}[] = supplementState.deploy.before
  .map((time) => {
    const quadrant = randomQuadrant();
    return [...new Array(2).keys()].map((i) => ({
      time,
      data: {
        type: (i === 0 ? "ARMY" : "GUN") as "ARMY" | "GUN",
        quadrant: quadrant[i] || (0 as TQuadrant),
        count: Math.floor(
          supplementState.count.before.min +
            Math.random() *
              (supplementState.count.before.max -
                supplementState.count.before.min)
        ),
      },
    }));
  })
  .flat();

// deploy custom supplement config like this
// export const supplement{After|Before}Config = [
//   { time: 8000, data: { quadrant: 0, count: 5, type: "ARMY" } },
//   { time: 12000, data: { quadrant: 1, count: 3, type: "GUN" } },
//   { time: 18000, data: { quadrant: 2, count: 7, type: "ARMY" } },
// ];
