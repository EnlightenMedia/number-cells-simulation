import { Position } from './Food';

export class Cell {
  public energy: number;

  constructor(
    public position: Position,
    public value: number,
    public maxValue: number = 9,
    initialEnergy: number = 3,
  ) {
    if (value < 0 || value > maxValue) {
      throw new Error(`Cell value must be between 0 and ${maxValue}`);
    }
    this.energy = initialEnergy;
  }

  /**
   * Determines if this cell can consume the given food value
   * Cell consumes food if food value is 1 less than cell value
   * Special case: Cell with value 0 can consume food with value maxValue
   */
  canConsume(foodValue: number): boolean {
    if (this.value === 0) {
      return foodValue === this.maxValue;
    }
    return foodValue === this.value - 1;
  }

  /**
   * Gets the food value that will be left behind when this cell moves
   * Returns cell value + 1, with maxValue wrapping to 0
   */
  getLeftBehindFoodValue(): number {
    return (this.value + 1) % (this.maxValue + 1);
  }

  /**
   * Decreases cell energy by 1
   */
  decreaseEnergy(): void {
    this.energy = Math.max(0, this.energy - 1);
  }

  /**
   * Restores cell energy to initial value when eating
   */
  restoreEnergy(initialEnergy: number): void {
    this.energy = initialEnergy;
  }

  /**
   * Checks if cell is still alive
   */
  isAlive(): boolean {
    return this.energy > 0;
  }
}
