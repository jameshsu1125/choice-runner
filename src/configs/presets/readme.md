# entity preset config

## [enterframe](https://www.npmjs.com/package/lesca-enterframe)

```sh
A simple function to record time for animation.
Because the delta provided by Phaser is not accurate, it causes entities to walk backwards.
```

## entity config

### **`time` (required): The Entity will fire a new component when the accumulated enterframe delta time reaches this configured time value. If the value equals 0, the component fires when the game starts. If the value is less than 0, the component deploy before the game starts.**

1. [enemy](./enemy.preset.ts)

```ts
type TEnemyConfig = {
  time: number; // deploy time by enterFrame time reached
  data: {
    x: number; // initial x position
    type: "follow" | "straight"; // movement type
    blood: {
      type: "ghost" | "boss"; // blood type
      max: number; // max blood value
      value: number; // initial blood value
      color: number; // color representation
    };
  };
};

// deploy custom enemy config like this
// export const enemy{After|Before}Config: TEnemyConfig[] = [
//   { time: 10000, data: { x: 200, type: "straight", blood: practiceEnemy } },
//   { time: 13000, data: { x: 300, type: "straight", blood: practiceEnemy } },
//   { time: 15000, data: { x: 400, type: "follow", blood: practiceEnemy } },
//   { time: 16000, data: { x: 500, type: "straight", blood: smallEnemy } },
//   { time: 17000, data: { x: 200, type: "straight", blood: practiceEnemy } },
//   { time: 18000, data: { x: 300, type: "straight", blood: practiceEnemy } },
// ];
```

2. [gate](./gate.preset.ts)

```ts
type TGateConfig = {
  time: number; // deploy time by enterFrame time reached
  data: {
    quadrant: TQuadrant; // -1 | 0 | 1
    count: number; // number of gate count
    type: "gate"; // as const
  };
};

// deploy custom gate config like this
// export const gate{After|Before}Config = [
//   { time: 5000, data: { quadrant: 0, count: 3, type: "gate" } },
//   { time: 15000, data: { quadrant: 1, count: 5, type: "gate" } },
//   { time: 25000, data: { quadrant: 2, count: 7, type: "gate" } },
// ];
```

3. [supplement](./supplement.preset.ts)

```ts
type TSupplement = {
  time: number; // deploy time by enterFrame time reached
  data: {
    quadrant: TQuadrant; // -1 | 0 | 1
    count: number; // number of supplement count
    type: "ARMY" | "GUN"; // as const
  };
};

// deploy custom supplement config like this
// export const supplement{After|Before}Config = [
//   { time: 8000, data: { quadrant: 0, count: 5, type: "ARMY" } },
//   { time: 12000, data: { quadrant: 1, count: 3, type: "GUN" } },
//   { time: 18000, data: { quadrant: 2, count: 7, type: "ARMY" } },
// ];
```
