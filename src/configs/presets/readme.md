# entity preset config

## [enterframe](https://www.npmjs.com/package/lesca-enterframe)

```
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
```
