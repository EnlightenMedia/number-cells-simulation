import { Grid } from './models/Grid';
import { SimulationEngine } from './SimulationEngine';
import { Cell } from './models/Cell';
import { Food } from './models/Food';

export class UIController {
  private grid: Grid | null = null;
  private engine: SimulationEngine | null = null;

  // Input elements
  private heightInput: HTMLInputElement;
  private widthInput: HTMLInputElement;
  private foodInput: HTMLInputElement;
  private cellsInput: HTMLInputElement;
  private delayInput: HTMLInputElement;

  // Button elements
  private initButton: HTMLButtonElement;
  private stepButton: HTMLButtonElement;
  private startButton: HTMLButtonElement;
  private stopButton: HTMLButtonElement;
  private restartButton: HTMLButtonElement;

  // Display elements
  private gridContainer: HTMLElement;
  private tickCounter: HTMLElement;
  private statusMessage: HTMLElement;

  constructor() {
    // Get input elements
    this.heightInput = document.getElementById('height') as HTMLInputElement;
    this.widthInput = document.getElementById('width') as HTMLInputElement;
    this.foodInput = document.getElementById('food') as HTMLInputElement;
    this.cellsInput = document.getElementById('cells') as HTMLInputElement;
    this.delayInput = document.getElementById('delay') as HTMLInputElement;

    // Get button elements
    this.initButton = document.getElementById('init-btn') as HTMLButtonElement;
    this.stepButton = document.getElementById('step-btn') as HTMLButtonElement;
    this.startButton = document.getElementById('start-btn') as HTMLButtonElement;
    this.stopButton = document.getElementById('stop-btn') as HTMLButtonElement;
    this.restartButton = document.getElementById('restart-btn') as HTMLButtonElement;

    // Get display elements
    this.gridContainer = document.getElementById('grid-container') as HTMLElement;
    this.tickCounter = document.getElementById('tick-counter') as HTMLElement;
    this.statusMessage = document.getElementById('status-message') as HTMLElement;

    this.setupEventListeners();
    this.updateControlStates();
  }

  private setupEventListeners(): void {
    this.initButton.addEventListener('click', () => this.initializeGrid());
    this.stepButton.addEventListener('click', () => this.stepSimulation());
    this.startButton.addEventListener('click', () => this.startSimulation());
    this.stopButton.addEventListener('click', () => this.stopSimulation());
    this.restartButton.addEventListener('click', () => this.restartSimulation());
  }

  private initializeGrid(): void {
    const height = parseInt(this.heightInput.value);
    const width = parseInt(this.widthInput.value);
    const foodCount = parseInt(this.foodInput.value);
    const cellCount = parseInt(this.cellsInput.value);

    // Validation
    if (isNaN(height) || height < 1 || height > 50) {
      this.showStatus('Height must be between 1 and 50', 'error');
      return;
    }
    if (isNaN(width) || width < 1 || width > 50) {
      this.showStatus('Width must be between 1 and 50', 'error');
      return;
    }
    if (isNaN(foodCount) || foodCount < 0) {
      this.showStatus('Food count must be a non-negative number', 'error');
      return;
    }
    if (isNaN(cellCount) || cellCount < 0) {
      this.showStatus('Cell count must be a non-negative number', 'error');
      return;
    }
    if (foodCount + cellCount > height * width) {
      this.showStatus('Too many entities for grid size', 'error');
      return;
    }

    try {
      // Create new grid
      this.grid = new Grid(width, height);
      this.grid.initialize(foodCount, cellCount);

      // Create new engine
      if (this.engine) {
        this.engine.stop();
      }
      this.engine = new SimulationEngine(
        this.grid,
        () => this.render(),
        () => this.handleNoMovesAvailable(),
      );

      this.render();
      this.updateControlStates();
      this.showStatus('Grid initialized successfully', 'success');
    } catch (error) {
      this.showStatus(`Error: ${(error as Error).message}`, 'error');
    }
  }

  private stepSimulation(): void {
    if (!this.engine) {
      this.showStatus('Please initialize the grid first', 'error');
      return;
    }

    const moved = this.engine.tick();
    if (!moved) {
      this.showStatus('No more moves available', 'info');
    }
  }

  private startSimulation(): void {
    if (!this.engine) {
      this.showStatus('Please initialize the grid first', 'error');
      return;
    }

    const delay = parseInt(this.delayInput.value);
    if (isNaN(delay) || delay < 10) {
      this.showStatus('Delay must be at least 10ms', 'error');
      return;
    }

    this.engine.start(delay);
    this.updateControlStates();
    this.showStatus('Simulation started', 'success');
  }

  private stopSimulation(): void {
    if (!this.engine) {
      return;
    }

    this.engine.stop();
    this.updateControlStates();
    this.showStatus('Simulation stopped', 'info');
  }

  private restartSimulation(): void {
    if (!this.engine || !this.grid) {
      this.showStatus('Please initialize the grid first', 'error');
      return;
    }

    this.engine.stop();
    const foodCount = parseInt(this.foodInput.value);
    const cellCount = parseInt(this.cellsInput.value);

    this.grid.initialize(foodCount, cellCount);
    this.engine.reset();
    this.engine.setGrid(this.grid);
    this.render();
    this.updateControlStates();
    this.showStatus('Grid restarted', 'success');
  }

  private render(): void {
    if (!this.grid) {
      return;
    }

    // Clear grid container
    this.gridContainer.innerHTML = '';

    // Set grid CSS properties
    this.gridContainer.style.gridTemplateColumns = `repeat(${this.grid.width}, 1fr)`;
    this.gridContainer.style.gridTemplateRows = `repeat(${this.grid.height}, 1fr)`;

    // Render each cell
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const entity = this.grid.getEntity(x, y);
        const cellDiv = document.createElement('div');
        cellDiv.className = 'grid-cell';

        if (entity instanceof Cell) {
          cellDiv.classList.add('cell');
          cellDiv.textContent = entity.value.toString();
        } else if (entity instanceof Food) {
          cellDiv.classList.add('food');
          cellDiv.textContent = entity.value.toString();
        } else {
          cellDiv.classList.add('empty');
        }

        this.gridContainer.appendChild(cellDiv);
      }
    }

    // Update tick counter
    if (this.engine) {
      this.tickCounter.textContent = `Tick: ${this.engine.getTickCount()}`;
    }
  }

  private updateControlStates(): void {
    const hasGrid = this.grid !== null;
    const isRunning = this.engine?.isSimulationRunning() || false;

    this.stepButton.disabled = !hasGrid || isRunning;
    this.startButton.disabled = !hasGrid || isRunning;
    this.stopButton.disabled = !hasGrid || !isRunning;
    this.restartButton.disabled = !hasGrid;
  }

  private handleNoMovesAvailable(): void {
    this.updateControlStates();
    this.showStatus('Simulation stopped - No more moves available', 'info');
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message ${type}`;

    // Auto-clear after 5 seconds
    setTimeout(() => {
      if (this.statusMessage.textContent === message) {
        this.statusMessage.textContent = '';
        this.statusMessage.className = 'status-message';
      }
    }, 5000);
  }
}
