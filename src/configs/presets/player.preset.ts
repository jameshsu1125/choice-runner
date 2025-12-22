export const playerFormation = [
  { x: 0, y: 0, depth: 3 },
  { x: 0.5, y: -0.5, depth: 2 },
  { x: -0.5, y: -0.5, depth: 2 },
  { x: -1, y: 0, depth: 3 },
  { x: -0.5, y: 0.5, depth: 4 },
  { x: 1, y: 0, depth: 3 },
  { x: 0.5, y: 0.5, depth: 4 },
  { x: 0, y: -1, depth: 1 },
  { x: 0, y: 1, depth: 4 },
  { x: 1.5, y: -0.5, depth: 2 },
  { x: -1.5, y: 0.5, depth: 4 },
  { x: -1.5, y: -0.5, depth: 2 },
  { x: 1.5, y: 0.5, depth: 4 },
  { x: -1, y: -1, depth: 1 },
  { x: 1, y: 1, depth: 5 },
  { x: -1, y: 1, depth: 5 },
  { x: 1, y: -1, depth: 1 },
  { x: 2, y: 0, depth: 3 },
  { x: -2, y: 0, depth: 3 },
  // circle formation for more than 18 players
  ...[...new Array(18).keys()].map((angle) => {
    const rad = 0 - (angle / 18) * Math.PI * 2;
    const radius = 3;
    const y = Math.sin(rad) * radius;
    return {
      x: Math.cos(rad) * radius,
      y,
      depth: 3 + Math.round(y / 0.5),
    };
  }),
];
