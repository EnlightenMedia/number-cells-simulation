# Number Cell Simulation

A modular TypeScript application that simulates cells consuming food on a grid with an energy-based survival system.

## Features

- **Configurable Grid**: Set custom height, width, food count, and cell count
- **Customizable Max Value**: Configure the maximum value for both food and cells (1-99)
- **Energy System**: Cells have energy that depletes each tick and restores when eating
- **Survival Mode**: Toggle whether cells die when starved
- **Interactive Controls**: Step through simulation manually or run continuously
- **Visual Display**: Clear grid visualization with color-coded entities (green for food, red for cells)
- **Persistent Settings**: All configuration values are automatically saved to browser storage
- **Automatic Stopping**: Simulation continues until all cells die or are manually stopped

## Rules

### Food

- Displayed in **green**
- Contains a number from 0 to max value (configurable)
- Stationary entities that cells can consume

### Cells

- Displayed in **red**
- Contains a number from 0 to max value (configurable)
- Have an energy level that decreases each tick (when starvation mode is enabled)
- **Consumption Rule**: A cell can consume adjacent food if the food's value is exactly 1 less than the cell's value
  - Special case: A cell with value 0 can consume food with value equal to max value
- **Movement**: When a cell consumes food:
  1. The cell moves to the food's position
  2. The cell's energy is restored to the initial value
  3. Food is left behind at the cell's old position with value = (cell value + 1) modulo (max value + 1)

### Energy System

- Each cell starts with a configurable energy level (default: 3)
- When "Cells Die if Starved" is enabled:
  - Cells that don't eat lose 1 energy per tick
  - Cells die when energy reaches 0
  - Eating restores energy to the initial value
  - Simulation automatically stops when all cells have died
- When disabled, cells persist indefinitely even if they can't move, and the simulation runs continuously

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Usage

### Configuration Options

- **Height** (1-50): Number of rows in the grid
- **Width** (1-50): Number of columns in the grid
- **Food Count** (0+): Number of food items to place on the grid
- **Cell Count** (0+): Number of cells to place on the grid
- **Max Value** (1-99): Maximum value for both food and cells
- **Cell Energy** (1-100): Initial energy level for cells
- **Cells Die if Starved**: Toggle whether cells lose energy and die when not eating
- **Delay** (10+ ms): Time between simulation ticks when running continuously

### Steps to Run

1. Configure your desired parameters using the input fields
2. Click **Initialize** to create the grid with random placement (ensures no overlapping food and cells)
3. Use the simulation controls:
   - **Step**: Execute one simulation tick manually
   - **Start**: Begin continuous simulation at the specified delay (runs until all cells die or manually stopped)
   - **Stop**: Pause the continuous simulation
   - **Restart**: Regenerate the grid with new random positions using current settings
4. Monitor the tick counter and status messages for simulation state

### Tips

- Start with default values to understand the basic behavior
- Increase energy to give cells more survival time before they starve
- Adjust max value to create different consumption patterns and complexity
- Lower delay for faster simulations, increase for easier observation
- Use Step mode to observe individual cell behaviors and understand the mechanics
- The simulation continues running even if cells can't move, allowing the energy system to play out
- All settings are automatically saved to your browser and persist across page refreshes

## Project Structure

```
src/
├── models/
│   ├── Cell.ts         # Cell entity and logic
│   ├── Food.ts         # Food entity
│   └── Grid.ts         # Grid management
├── SimulationEngine.ts # Simulation tick logic
├── UIController.ts     # UI management and rendering
├── main.ts            # Application entry point
└── index.html         # HTML template with embedded CSS
```

## Acknowledgements

This simulation was inspired by [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life), a cellular automaton devised by mathematician John Horton Conway in 1970. While Conway's Game of Life uses simple binary rules for cell survival and death, Number Cell Simulation extends these concepts with numeric values, energy systems, and consumption mechanics to create a more complex emergent behavior system.
