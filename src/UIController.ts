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
  private maxValueInput: HTMLInputElement;
  private energyInput: HTMLInputElement;
  private cellsDieInput: HTMLInputElement;
  private allowRandomMoveInput: HTMLInputElement;
  private cannibalModeInput: HTMLInputElement;
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
  private foodCounter: HTMLElement;
  private cellCounter: HTMLElement;
  private statusMessage: HTMLElement;

  constructor() {
    // Get input elements
    this.heightInput = document.getElementById('height') as HTMLInputElement;
    this.widthInput = document.getElementById('width') as HTMLInputElement;
    this.foodInput = document.getElementById('food') as HTMLInputElement;
    this.cellsInput = document.getElementById('cells') as HTMLInputElement;
    this.maxValueInput = document.getElementById('maxValue') as HTMLInputElement;
    this.energyInput = document.getElementById('energy') as HTMLInputElement;
    this.cellsDieInput = document.getElementById('cellsDie') as HTMLInputElement;
    this.allowRandomMoveInput = document.getElementById('allowRandomMove') as HTMLInputElement;
    this.cannibalModeInput = document.getElementById('cannibalMode') as HTMLInputElement;
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
    this.foodCounter = document.getElementById('food-counter') as HTMLElement;
    this.cellCounter = document.getElementById('cell-counter') as HTMLElement;
    this.statusMessage = document.getElementById('status-message') as HTMLElement;

    this.loadSavedValues();
    this.setupEventListeners();
    this.setupInputSaveListeners();
    // Set initial food input state based on cannibal mode
    this.foodInput.disabled = this.cannibalModeInput.checked;
    if (this.cannibalModeInput.checked) {
      this.foodInput.value = '0';
    }
    this.updateControlStates();
  }

  private loadSavedValues(): void {
    const savedHeight = localStorage.getItem('number-cell-height');
    const savedWidth = localStorage.getItem('number-cell-width');
    const savedFood = localStorage.getItem('number-cell-food');
    const savedCells = localStorage.getItem('number-cell-cells');
    const savedMaxValue = localStorage.getItem('number-cell-maxValue');
    const savedEnergy = localStorage.getItem('number-cell-energy');
    const savedCellsDie = localStorage.getItem('number-cell-cellsDie');
    const savedAllowRandomMove = localStorage.getItem('number-cell-allowRandomMove');
    const savedCannibalMode = localStorage.getItem('number-cell-cannibalMode');
    const savedDelay = localStorage.getItem('number-cell-delay');

    if (savedHeight) this.heightInput.value = savedHeight;
    if (savedWidth) this.widthInput.value = savedWidth;
    if (savedFood) this.foodInput.value = savedFood;
    if (savedCells) this.cellsInput.value = savedCells;
    if (savedMaxValue) this.maxValueInput.value = savedMaxValue;
    if (savedEnergy) this.energyInput.value = savedEnergy;
    if (savedCellsDie !== null) this.cellsDieInput.checked = savedCellsDie === 'true';
    if (savedAllowRandomMove !== null)
      this.allowRandomMoveInput.checked = savedAllowRandomMove === 'true';
    if (savedCannibalMode !== null) this.cannibalModeInput.checked = savedCannibalMode === 'true';
    if (savedDelay) this.delayInput.value = savedDelay;

    // Set initial food input state based on cannibal mode
    this.foodInput.disabled = this.cannibalModeInput.checked;
    if (this.cannibalModeInput.checked) {
      this.foodInput.value = '0';
    }
  }

  private setupEventListeners(): void {
    this.initButton.addEventListener('click', () => this.initializeGrid());
    this.stepButton.addEventListener('click', () => this.stepSimulation());
    this.startButton.addEventListener('click', () => this.startSimulation());
    this.stopButton.addEventListener('click', () => this.stopSimulation());
    this.restartButton.addEventListener('click', () => this.restartSimulation());
  }

  private setupInputSaveListeners(): void {
    this.heightInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-height', this.heightInput.value);
    });
    this.widthInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-width', this.widthInput.value);
    });
    this.foodInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-food', this.foodInput.value);
    });
    this.cellsInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-cells', this.cellsInput.value);
    });
    this.maxValueInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-maxValue', this.maxValueInput.value);
    });
    this.energyInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-energy', this.energyInput.value);
    });
    this.cellsDieInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-cellsDie', this.cellsDieInput.checked.toString());
    });
    this.allowRandomMoveInput.addEventListener('change', () => {
      localStorage.setItem(
        'number-cell-allowRandomMove',
        this.allowRandomMoveInput.checked.toString(),
      );
    });
    this.cannibalModeInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-cannibalMode', this.cannibalModeInput.checked.toString());
      // Disable food input in cannibal mode
      this.foodInput.disabled = this.cannibalModeInput.checked;
      if (this.cannibalModeInput.checked) {
        this.foodInput.value = '0';
      }
    });
    this.delayInput.addEventListener('change', () => {
      localStorage.setItem('number-cell-delay', this.delayInput.value);
    });
  }

  private initializeGrid(): void {
    const height = parseInt(this.heightInput.value);
    const width = parseInt(this.widthInput.value);
    const foodCount = this.cannibalModeInput.checked ? 0 : parseInt(this.foodInput.value);
    const cellCount = parseInt(this.cellsInput.value);
    const maxValue = parseInt(this.maxValueInput.value);
    const energy = parseInt(this.energyInput.value);

    // Validation
    if (isNaN(height) || height < 1 || height > 100) {
      this.showStatus('Height must be between 1 and 100', 'error');
      return;
    }
    if (isNaN(width) || width < 1 || width > 100) {
      this.showStatus('Width must be between 1 and 100', 'error');
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
    if (isNaN(maxValue) || maxValue < 1 || maxValue > 99) {
      this.showStatus('Max value must be between 1 and 99', 'error');
      return;
    }
    if (isNaN(energy) || energy < 1 || energy > 100) {
      this.showStatus('Energy must be between 1 and 100', 'error');
      return;
    }
    if (foodCount + cellCount > height * width) {
      this.showStatus('Too many entities for grid size', 'error');
      return;
    }

    try {
      // Create new grid
      this.grid = new Grid(width, height);
      this.grid.initialize(foodCount, cellCount, maxValue, energy);

      // Create new engine
      if (this.engine) {
        this.engine.stop();
      }
      this.engine = new SimulationEngine(
        this.grid,
        () => this.render(),
        () => this.handleNoMovesAvailable(),
        this.cellsDieInput.checked,
        energy,
        this.allowRandomMoveInput.checked,
        this.cannibalModeInput.checked,
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
    const foodCount = this.cannibalModeInput.checked ? 0 : parseInt(this.foodInput.value);
    const cellCount = parseInt(this.cellsInput.value);
    const maxValue = parseInt(this.maxValueInput.value);
    const energy = parseInt(this.energyInput.value);

    // Validate
    if (foodCount + cellCount > this.grid.width * this.grid.height) {
      this.showStatus('Too many entities for current grid size', 'error');
      return;
    }

    // Reinitialize the existing grid with new entities
    this.grid.initialize(foodCount, cellCount, maxValue, energy);

    // Create new engine with updated settings
    this.engine = new SimulationEngine(
      this.grid,
      () => this.render(),
      () => this.handleNoMovesAvailable(),
      this.cellsDieInput.checked,
      energy,
      this.allowRandomMoveInput.checked,
      this.cannibalModeInput.checked,
    );

    this.render();
    this.updateControlStates();
    this.showStatus('Simulation reset with current settings', 'success');
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
          // Don't render food in cannibal mode (there shouldn't be any, but just in case)
          if (!this.cannibalModeInput.checked) {
            cellDiv.classList.add('food');
            cellDiv.textContent = entity.value.toString();
          } else {
            cellDiv.classList.add('empty');
          }
        } else {
          cellDiv.classList.add('empty');
        }

        this.gridContainer.appendChild(cellDiv);
      }
    }

    // Update tick counter and entity counts
    if (this.engine) {
      this.tickCounter.textContent = `Tick: ${this.engine.getTickCount()}`;

      // Count food and cells
      const foodCount = this.grid.getAllFood().length;
      const cellCount = this.grid.getAllCells().length;

      this.foodCounter.textContent = `Food: ${foodCount}`;
      this.cellCounter.textContent = `Cells: ${cellCount}`;
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
    this.showStatus('Simulation stopped - No cells remaining', 'info');
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
