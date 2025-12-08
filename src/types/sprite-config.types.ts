export interface SpriteFrameConfig {
  frameWidth: number;
  frameHeight: number;
}

export interface SpriteConfig {
  player: SpriteFrameConfig;
  enemy: SpriteFrameConfig;
  enemyBoss: SpriteFrameConfig;
}