import { Grid } from './models/Grid';
import { Cell } from './models/Cell';
import { Food } from './models/Food';

export class SimulationEngine {
  private grid: Grid;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private tickCount: number = 0;
  private cellsDie: boolean;
  private initialEnergy: number;

  constructor(
    grid: Grid,
    private onUpdate: () => void,
    private onNoMovesAvailable?: () => void,
    cellsDie: boolean = false,
    initialEnergy: number = 3,
  ) {
    this.grid = grid;
    this.cellsDie = cellsDie;
    this.initialEnergy = initialEnergy;
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

    console.log(`Tick ${this.tickCount}: Found ${cells.length} cells`);

    // Capture cell positions before any movement
    const cellPositions = cells.map((cell) => ({ cell, position: { ...cell.position } }));

    // Shuffle to randomize order of movement
    this.shuffleArray(cellPositions);

    for (let i = 0; i < cellPositions.length; i++) {
      const { cell, position } = cellPositions[i];
      console.log(`  Processing cell ${i}: value=${cell.value} at (${position.x},${position.y})`);
      const moved = this.processCellMovement(cell, position);
      console.log(`    Result: ${moved ? 'MOVED' : 'no move'}`);
      if (moved) {
        anyMoved = true;
      } else if (this.cellsDie) {
        // Decrease energy if cell didn't eat
        const currentEntity = this.grid.getEntity(position.x, position.y);
        if (currentEntity === cell) {
          cell.decreaseEnergy();
          console.log(
            `    Cell energy decreased to ${cell.energy} at (${position.x},${position.y})`,
          );
          // Remove cell if energy reaches zero
          if (!cell.isAlive()) {
            console.log(`    Cell died at (${position.x},${position.y})`);
            this.grid.setEntity(position.x, position.y, null);
          }
        }
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
  private processCellMovement(cell: Cell, originalPosition: { x: number; y: number }): boolean {
    // Verify the cell is still at the position we expect (it might have been moved by another cell)
    const currentEntity = this.grid.getEntity(originalPosition.x, originalPosition.y);
    if (currentEntity !== cell) {
      // This cell has already been moved or consumed
      return false;
    }

    const adjacentPositions = this.grid.getAdjacentPositions(originalPosition);
    const validMoves: Food[] = [];

    // Find all adjacent food that this cell can consume
    for (const pos of adjacentPositions) {
      const entity = this.grid.getEntity(pos.x, pos.y);
      if (entity instanceof Food && cell.canConsume(entity.value)) {
        console.log(`      Found consumable food: value=${entity.value} at (${pos.x},${pos.y})`);
        validMoves.push(entity);
      }
    }

    if (validMoves.length === 0) {
      console.log(`      No valid moves found for cell value=${cell.value}`);
      return false;
    }

    // Randomly select one valid move
    const targetFood = validMoves[Math.floor(Math.random() * validMoves.length)];
    const oldPosition = { ...originalPosition };
    const newPosition = { ...targetFood.position };

    console.log(
      `      Moving from (${oldPosition.x},${oldPosition.y}) to (${newPosition.x},${
        newPosition.y
      }), eating food ${targetFood.value}, leaving food ${cell.getLeftBehindFoodValue()}`,
    );

    // Restore cell energy after eating
    cell.restoreEnergy(this.initialEnergy);

    // Create new food to leave behind
    const leftBehindFood = new Food(oldPosition, cell.getLeftBehindFoodValue(), cell.maxValue);

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
      this.tick();
      // Check if there are any cells left alive
      const remainingCells = this.grid.getAllCells();
      if (remainingCells.length === 0) {
        this.stop();
        if (this.onNoMovesAvailable) {
          this.onNoMovesAvailable();
        }
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
