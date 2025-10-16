export interface Position {
  x: number;
  y: number;
}

export class Food {
  constructor(public position: Position, public value: number) {
    if (value < 0 || value > 9) {
      throw new Error('Food value must be between 0 and 9');
    }
  }
}
