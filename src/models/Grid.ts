import { Cell } from './Cell';
import { Food, Position } from './Food';

export type GridEntity = Cell | Food | null;

export class Grid {
  private grid: GridEntity[][];

  constructor(public width: number, public height: number) {
    this.grid = Array(height)
      .fill(null)
      .map(() => Array(width).fill(null));
  }

  /**
   * Initializes the grid with random food and cells
   */
  initialize(foodCount: number, cellCount: number, maxValue: number = 9, energy: number = 3): void {
    if (foodCount + cellCount > this.width * this.height) {
      throw new Error('Too many entities for grid size');
    }

    // Clear grid
    this.grid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(null));

    const availablePositions: Position[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        availablePositions.push({ x, y });
      }
    }

    // Shuffle positions
    this.shuffleArray(availablePositions);

    // Place food
    for (let i = 0; i < foodCount; i++) {
      const pos = availablePositions[i];
      // Verify position is empty before placing
      if (this.grid[pos.y][pos.x] !== null) {
        throw new Error(`Position (${pos.x}, ${pos.y}) is already occupied when placing food`);
      }
      const value = Math.floor(Math.random() * (maxValue + 1));
      this.grid[pos.y][pos.x] = new Food(pos, value, maxValue);
    }

    // Place cells
    for (let i = 0; i < cellCount; i++) {
      const pos = availablePositions[foodCount + i];
      // Verify position is empty before placing
      if (this.grid[pos.y][pos.x] !== null) {
        throw new Error(`Position (${pos.x}, ${pos.y}) is already occupied when placing cell`);
      }
      const value = Math.floor(Math.random() * (maxValue + 1));
      this.grid[pos.y][pos.x] = new Cell(pos, value, maxValue, energy);
    }
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getEntity(x: number, y: number): GridEntity {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.grid[y][x];
  }

  setEntity(x: number, y: number, entity: GridEntity): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    if (entity) {
      entity.position = { x, y };
    }
    this.grid[y][x] = entity;
  }

  /**
   * Gets adjacent positions (up, down, left, right)
   */
  getAdjacentPositions(pos: Position): Position[] {
    const adjacent: Position[] = [
      { x: pos.x, y: pos.y - 1 }, // up
      { x: pos.x + 1, y: pos.y }, // right
      { x: pos.x, y: pos.y + 1 }, // down
      { x: pos.x - 1, y: pos.y }, // left
    ];

    return adjacent.filter((p) => p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height);
  }

  /**
   * Gets all cells in the grid
   */
  getAllCells(): Cell[] {
    const cells: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const entity = this.grid[y][x];
        if (entity instanceof Cell) {
          cells.push(entity);
        }
      }
    }
    return cells;
  }

  /**
   * Gets all food in the grid
   */
  getAllFood(): Food[] {
    const food: Food[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const entity = this.grid[y][x];
        if (entity instanceof Food) {
          food.push(entity);
        }
      }
    }
    return food;
  }

  /**
   * Creates a copy of the current grid state
   */
  clone(): Grid {
    const newGrid = new Grid(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const entity = this.grid[y][x];
        if (entity instanceof Cell) {
          const clonedCell = new Cell({ x, y }, entity.value, entity.maxValue, entity.energy);
          clonedCell.energy = entity.energy;
          newGrid.grid[y][x] = clonedCell;
        } else if (entity instanceof Food) {
          newGrid.grid[y][x] = new Food({ x, y }, entity.value, entity.maxValue);
        }
      }
    }
    return newGrid;
  }
}
