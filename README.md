# Number Cell Simulation

A modular TypeScript application that simulates cells consuming food on a grid.

## Features

- **Configurable Grid**: Set custom height, width, food count, and cell count
- **Interactive Controls**: Step through simulation manually or run continuously
- **Visual Display**: Clear grid visualization with color-coded entities
- **Cell Behavior**: Cells consume adjacent food following specific rules
- **Automatic Stopping**: Simulation stops when no more moves are available

## Rules

- **Food**: Displayed in green, contains a number from 0-9
- **Cells**: Displayed in red, contains a number from 0-9
- **Consumption**: A cell consumes food if the food's number is 1 less than the cell's number (cell with 0 consumes food with 9)
- **Movement**: When a cell consumes food, it moves to the food's position and leaves behind food with a value of (cell value + 1) % 10

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

1. Enter grid dimensions (height and width)
2. Specify the number of food items and cells
3. Click "Initialize" to create the grid
4. Use controls:
   - **Step**: Execute one simulation tick
   - **Start**: Begin continuous simulation
   - **Stop**: Pause continuous simulation
   - **Restart**: Reset grid with new random positions
5. Adjust delay (in milliseconds) to control simulation speed

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
