import { randomQuadrant } from "../../utils/quadrant.utils";
import { TQuadrant } from "../constants/constants";

// config need to split before and after game start for stage deploy.
export const gateState = {
  count: {
    before: { min: -2, max: 2 }, // practice time should be easier
    after: { min: -10, max: 10 },
  },
  deploy: {
    before: [], // no gate before game start
    after: [0, 10000, 20000],
  },
};

export const gateAfterConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "gate" };
}[] = gateState.deploy.after
  .map((time, index) => {
    const quadrant = randomQuadrant();
    return [...new Array(2).keys()].map((i) => ({
      time: time + i,
      data: {
        type: "gate" as const,
        quadrant: quadrant[i] || (0 as TQuadrant),
        count: Math.floor(
          gateState.count.after.min * (index + 1) +
            Math.random() *
              (gateState.count.after.max - gateState.count.after.min)
        ),
      },
    }));
  })
  .flat();

export const gateBeforeConfig: {
  time: number;
  data: { quadrant: TQuadrant; count: number; type: "gate" };
}[] = gateState.deploy.before
  .map((time) => {
    const quadrant = randomQuadrant();
    return [...new Array(2).keys()].map((index) => ({
      time,
      data: {
        type: "gate" as const,
        quadrant: quadrant[index] || (0 as TQuadrant),
        count: Math.floor(
          gateState.count.before.min +
            Math.random() *
              (gateState.count.before.max - gateState.count.before.min)
        ),
      },
    }));
  })
  .flat();

// deploy custom gate config like this
// export const gate{After|Before}Config = [
//   { time: 5000, data: { quadrant: 0, count: 3, type: "gate" } },
//   { time: 15000, data: { quadrant: 1, count: 5, type: "gate" } },
//   { time: 25000, data: { quadrant: 2, count: 7, type: "gate" } },
// ];
