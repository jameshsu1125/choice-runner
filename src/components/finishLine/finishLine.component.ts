import { getDepthByOptions } from "../../managers/layout/depth.manager";
import {
  BitmapMask,
  Container,
  Graphics,
  Image,
  Scene,
} from "../../configs/constants/constants";
import { Easing } from "../../configs/constants/layout.constants";
import { finishLinePreset } from "../../configs/presets/layout.preset";
import {
  getDisplayPositionByBorderAlign as getAlign,
  getDisplaySizeByWidthPercentage as getSize,
} from "../../utils/layout.utils";

export class FinishComponent extends Container {
  private isDestroyed = false;
  private startTime = 0;

  private finishLine?: Image;

  public roadGraphics: Graphics = this.scene.make.graphics();
  public bitmapMask = new BitmapMask(this.scene, this.roadGraphics);

  private roadPoints = [
    { x: 165, y: 0 },
    { x: 238, y: 0 },
    { x: 470, y: this.scene.scale.height },
    { x: -65, y: this.scene.scale.height },
  ];

  private onGameVictory: () => void;

  constructor(scene: Scene, onGameVictory: () => void) {
    super(scene, 0, 0);
    this.createMask();
    this.onGameVictory = onGameVictory;
    this.setDepth(getDepthByOptions("finishLine"));
  }

  private createMask(): void {
    this.roadGraphics.fillStyle(0xff0000, 0.5);
    this.roadGraphics.beginPath();

    this.roadGraphics.moveTo(this.roadPoints[0].x, this.roadPoints[0].y);

    this.roadPoints.forEach((point) => {
      this.roadGraphics.lineTo(point.x, point.y);
    });
    this.roadGraphics.fillPath();
  }

  private createLine(): void {
    const { ratio } = finishLinePreset;

    this.finishLine = this.scene.add.image(0, -900, "finish-line");
    const { width, height } = getSize(this.finishLine, ratio);
    this.finishLine.setDisplaySize(width, height);
    this.finishLine.setPosition(
      0,
      getAlign(this.finishLine, this.scene, "TOP") -
        this.finishLine.displayHeight
    );
    this.finishLine.setMask(this.bitmapMask);
    this.add(this.finishLine);
  }

  private setPositionByPercentage(percent: number): void {
    if (!this.finishLine) return;

    const { missOffsetY } = finishLinePreset;

    const currentPercent = Easing(percent);
    const scale = 0.03 + ((0.64 - 0.12) / (0.51 - 0.001)) * currentPercent;

    this.finishLine.setScale(scale, scale);

    const x = 0;
    const predictY =
      -55 +
      getAlign(this.finishLine, this.scene, "TOP") -
      Math.abs(this.finishLine.displayHeight) +
      Math.abs(this.scene.scale.height) * currentPercent;
    const y = currentPercent > 0 ? predictY : -this.scene.scale.height;

    this.finishLine.setPosition(x, y);
    this.setVisibility(currentPercent > 0 && y > -this.scene.scale.height / 2);

    if (this.finishLine.y > this.scene.scale.height * 0.5 - missOffsetY) {
      this.onGameVictory();
    }
  }

  private setVisibility(value: boolean) {
    this.finishLine?.setVisible(value);
  }

  public update(time: number): void {
    if (!this.finishLine || this.isDestroyed) return;

    const { timeOffset, duration } = finishLinePreset;

    const percent = Math.abs((time - this.startTime + timeOffset) / duration);

    this.setPositionByPercentage(percent);
  }

  public fire(time: number) {
    this.startTime = time;
    this.createLine();
  }

  public adjustSpeedChange(
    currentTime: number,
    oldDuration: number,
    newDuration: number
  ): void {
    const { timeOffset } = finishLinePreset;

    // Calculate current position percentage with old duration
    const currentPercent = Math.abs(
      (currentTime - this.startTime + timeOffset) / oldDuration
    );

    // Calculate new startTime to maintain the same percentage with new duration
    this.startTime = currentTime + timeOffset - currentPercent * newDuration;
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.finishLine) {
      this.finishLine.destroy();
      this.finishLine.setVisible(false);
    }

    this.roadGraphics.destroy();
    this.bitmapMask.destroy();
    super.destroy(true);
  }
}
