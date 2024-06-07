export default class Food {
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
  }

  // Randomize position of food respecting snakes position
  randomize(snake) {
    const { cells } = this.options;

    const x = Math.floor(Math.random() * cells);
    const y = Math.floor(Math.random() * cells);

    // Recurse if food placed on any segment of snake
    const segments = [snake.head, ...snake.tail];
    for (const segment of segments) {
      if (segment.x === x && segment.y === y) return this.randomize(snake);
    }

    this.pos = { x, y };
  }

  // Paint food
  paint() {
    const foodColour = "#ef4444";
    const foodRelSize = 0.6;
    const { cellSize } = this.options;

    this.ctx.fillStyle = foodColour;
    const x = this.pos.x * cellSize + cellSize / 2;
    const y = this.pos.y * cellSize + cellSize / 2;
    const radius = (cellSize * foodRelSize) / 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  // Remove food from view
  remove() {
    this.pos = { x: -1, y: -1 };
  }

  // Set game options
  setOptions(options) {
    this.options = options;
  }
}
