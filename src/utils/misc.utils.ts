import { gateState } from "../configs/presets/gate.preset";
import { supplementState } from "../configs/presets/supplement.preset";

export const randomEnemyRange = (
  type: "before" | "after",
  min: number,
  max: number,
  count: number
): number[] => {
  const range = max - min;
  const step = range / (count + 1);
  const randomStep = Math.floor(Math.random() * count) + 1;
  const result: number[] = [];

  const gateSDeploy =
    type === "before" ? gateState.deploy.before : gateState.deploy.after;

  const supplementDeploy =
    type === "before"
      ? supplementState.deploy.before
      : supplementState.deploy.after;

  [...new Array(count).keys()].forEach((i) => {
    const toleranceRange = 500;
    let time = min + step * ((randomStep + i) % count);

    [...gateSDeploy, ...supplementDeploy].forEach((timePoint) => {
      if (Math.abs(Math.abs(timePoint) - Math.abs(time)) < toleranceRange) {
        time = timePoint + toleranceRange * 2 + Math.random() * toleranceRange;
      }
    });

    result.push(time);
  });
  return result.sort((a, b) => b - a);
};
