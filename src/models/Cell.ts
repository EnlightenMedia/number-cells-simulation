import { Position } from './Food';

export class Cell {
  constructor(public position: Position, public value: number) {
    if (value < 0 || value > 9) {
      throw new Error('Cell value must be between 0 and 9');
    }
  }

  /**
   * Determines if this cell can consume the given food value
   * Cell consumes food if food value is 1 less than cell value
   * Special case: Cell with value 0 can consume food with value 9
   */
  canConsume(foodValue: number): boolean {
    if (this.value === 0) {
      return foodValue === 9;
    }
    return foodValue === this.value - 1;
  }

  /**
   * Gets the food value that will be left behind when this cell moves
   * Returns cell value + 1, with 9 wrapping to 0
   */
  getLeftBehindFoodValue(): number {
    return (this.value + 1) % 10;
  }
}
