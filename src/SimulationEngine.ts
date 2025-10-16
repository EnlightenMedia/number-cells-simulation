import { Grid } from './models/Grid';
import { Cell } from './models/Cell';
import { Food } from './models/Food';

export class SimulationEngine {
  private grid: Grid;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private tickCount: number = 0;

  constructor(grid: Grid, private onUpdate: () => void) {
    this.grid = grid;
  }

  setGrid(grid: Grid): void {
    this.grid = grid;
    this.tickCount = 0;
  }

  getGrid(): Grid {
    return this.grid;
  }

  getTickCount(): number {
    return this.tickCount;
  }

  /**
   * Executes a single simulation tick
   * Returns true if any cell moved, false otherwise
   */
  tick(): boolean {
    const cells = this.grid.getAllCells();
    let anyMoved = false;

    // Shuffle cells to randomize order of movement
    this.shuffleArray(cells);

    for (const cell of cells) {
      if (this.processCellMovement(cell)) {
        anyMoved = true;
      }
    }

    this.tickCount++;
    this.onUpdate();
    return anyMoved;
  }

  /**
   * Processes movement for a single cell
   * Returns true if the cell moved, false otherwise
   */
  private processCellMovement(cell: Cell): boolean {
    const adjacentPositions = this.grid.getAdjacentPositions(cell.position);
    const validMoves: Food[] = [];

    // Find all adjacent food that this cell can consume
    for (const pos of adjacentPositions) {
      const entity = this.grid.getEntity(pos.x, pos.y);
      if (entity instanceof Food && cell.canConsume(entity.value)) {
        validMoves.push(entity);
      }
    }

    if (validMoves.length === 0) {
      return false;
    }

    // Randomly select one valid move
    const targetFood = validMoves[Math.floor(Math.random() * validMoves.length)];
    const oldPosition = { ...cell.position };
    const newPosition = { ...targetFood.position };

    // Create new food to leave behind
    const leftBehindFood = new Food(oldPosition, cell.getLeftBehindFoodValue());

    // Move cell to food position
    this.grid.setEntity(newPosition.x, newPosition.y, cell);

    // Place new food where cell was
    this.grid.setEntity(oldPosition.x, oldPosition.y, leftBehindFood);

    return true;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Starts continuous simulation
   */
  start(delayMs: number): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.intervalId = window.setInterval(() => {
      const anyMoved = this.tick();
      if (!anyMoved) {
        this.stop();
      }
    }, delayMs);
  }

  /**
   * Stops continuous simulation
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isSimulationRunning(): boolean {
    return this.isRunning;
  }

  reset(): void {
    this.stop();
    this.tickCount = 0;
  }
}
