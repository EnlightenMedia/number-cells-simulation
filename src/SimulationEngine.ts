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
  private allowRandomMove: boolean;
  private cannibalMode: boolean;

  constructor(
    grid: Grid,
    private onUpdate: () => void,
    private onNoMovesAvailable?: () => void,
    cellsDie: boolean = false,
    initialEnergy: number = 3,
    allowRandomMove: boolean = false,
    cannibalMode: boolean = false,
  ) {
    this.grid = grid;
    this.cellsDie = cellsDie;
    this.initialEnergy = initialEnergy;
    this.allowRandomMove = allowRandomMove;
    this.cannibalMode = cannibalMode;
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

    // Capture cell positions before any movement and create a set to track consumed cells
    const cellPositions = cells.map((cell) => ({ cell, position: { ...cell.position } }));
    const consumedCells = new Set<Cell>();

    // Shuffle to randomize order of movement
    this.shuffleArray(cellPositions);

    for (let i = 0; i < cellPositions.length; i++) {
      const { cell, position } = cellPositions[i];

      // Skip if this cell has been consumed by another cell in this tick
      if (consumedCells.has(cell)) {
        continue;
      }
      const { moved, consumedCell } = this.processCellMovement(cell, position);

      // Track the consumed cell so it can't act this tick
      if (consumedCell) {
        consumedCells.add(consumedCell);
      }

      if (moved) {
        anyMoved = true;
      } else {
        // Try random movement if allowed and cell can't eat
        let movedRandomly = false;
        if (this.allowRandomMove && cell.isAlive()) {
          movedRandomly = this.processRandomMovement(cell, position);
          if (movedRandomly) {
            anyMoved = true;
          }
        }

        // Decrease energy if cell didn't eat (regardless of whether it moved randomly)
        if (this.cellsDie && !moved) {
          cell.decreaseEnergy();
          // Remove cell if energy reaches zero
          if (!cell.isAlive()) {
            this.grid.setEntity(cell.position.x, cell.position.y, null);
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
   * Returns object with moved status and consumed cell (if any)
   */
  private processCellMovement(
    cell: Cell,
    originalPosition: { x: number; y: number },
  ): { moved: boolean; consumedCell: Cell | null } {
    // Verify the cell is still at the position we expect (it might have been moved by another cell)
    const currentEntity = this.grid.getEntity(originalPosition.x, originalPosition.y);
    if (currentEntity !== cell) {
      // This cell has already been moved or consumed
      return { moved: false, consumedCell: null };
    }

    // In cannibal mode, also verify this cell still exists somewhere on the grid
    // (it might have been consumed by another cell)
    if (this.cannibalMode) {
      const allCurrentCells = this.grid.getAllCells();
      if (!allCurrentCells.includes(cell)) {
        return { moved: false, consumedCell: null };
      }
    }

    const adjacentPositions = this.grid.getAdjacentPositions(originalPosition);
    const validMoves: Array<{ entity: Food | Cell; position: { x: number; y: number } }> = [];

    // Find all adjacent food/cells that this cell can consume
    for (const pos of adjacentPositions) {
      const entity = this.grid.getEntity(pos.x, pos.y);
      if (entity instanceof Food && cell.canConsume(entity.value)) {
        validMoves.push({ entity, position: pos });
      } else if (
        this.cannibalMode &&
        entity instanceof Cell &&
        entity !== cell &&
        cell.canConsume(entity.value)
      ) {
        validMoves.push({ entity, position: pos });
      }
    }

    if (validMoves.length === 0) {
      return { moved: false, consumedCell: null };
    }

    // Randomly select one valid move
    const target = validMoves[Math.floor(Math.random() * validMoves.length)];
    const oldPosition = { ...originalPosition };
    const newPosition = { ...target.position };
    const leftBehindValue = cell.getLeftBehindFoodValue();

    // Restore cell energy after eating
    cell.restoreEnergy(this.initialEnergy);

    // Move cell to target position
    this.grid.setEntity(newPosition.x, newPosition.y, cell);

    // Create new entity to leave behind (cell in cannibal mode, food otherwise)
    if (this.cannibalMode) {
      const leftBehindCell = new Cell(
        oldPosition,
        leftBehindValue,
        cell.maxValue,
        this.initialEnergy,
      );
      this.grid.setEntity(oldPosition.x, oldPosition.y, leftBehindCell);
    } else {
      const leftBehindFood = new Food(oldPosition, leftBehindValue, cell.maxValue);
      this.grid.setEntity(oldPosition.x, oldPosition.y, leftBehindFood);
    }

    // Return the consumed cell if it was a cell (for tracking)
    const consumedCell = target.entity instanceof Cell ? target.entity : null;
    return { moved: true, consumedCell };
  }

  /**
   * Processes random movement for a cell that can't eat
   * Returns true if the cell moved, false otherwise
   */
  private processRandomMovement(cell: Cell, originalPosition: { x: number; y: number }): boolean {
    // Verify the cell is still at the position we expect
    const currentEntity = this.grid.getEntity(originalPosition.x, originalPosition.y);
    if (currentEntity !== cell) {
      return false;
    }

    const adjacentPositions = this.grid.getAdjacentPositions(originalPosition);
    const validPositions: { x: number; y: number; hasFood: boolean; food?: Food }[] = [];

    // Find all adjacent empty positions or positions with food (but not consumable food/cells)
    for (const pos of adjacentPositions) {
      const entity = this.grid.getEntity(pos.x, pos.y);
      if (entity === null) {
        validPositions.push({ x: pos.x, y: pos.y, hasFood: false });
      } else if (entity instanceof Food && !cell.canConsume(entity.value)) {
        // Only allow swapping with food that can't be eaten
        validPositions.push({ x: pos.x, y: pos.y, hasFood: true, food: entity });
      }
      // In cannibal mode, don't allow random swapping with cells
    }

    if (validPositions.length === 0) {
      return false;
    }

    // Randomly select one valid position
    const target = validPositions[Math.floor(Math.random() * validPositions.length)];

    // Move cell to target position
    this.grid.setEntity(target.x, target.y, cell);

    // If there was food at target, move it to original position
    if (target.hasFood && target.food) {
      this.grid.setEntity(originalPosition.x, originalPosition.y, target.food);
    } else {
      // Set original position to empty
      this.grid.setEntity(originalPosition.x, originalPosition.y, null);
    }

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
