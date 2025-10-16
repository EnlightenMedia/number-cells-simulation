export interface Position {
  x: number;
  y: number;
}

export class Food {
  constructor(public position: Position, public value: number, public maxValue: number = 9) {
    if (value < 0 || value > maxValue) {
      throw new Error(`Food value must be between 0 and ${maxValue}`);
    }
  }
}
