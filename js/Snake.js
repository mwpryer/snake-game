// Paint rounded rectangle
CanvasRenderingContext2D.prototype.fillRoundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  this.fill();
};

export default class Snake {
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
    this.alive = true;
    this.vel = { x: 0, y: 0 };
    this.hasEaten = false;
  }

  // Randomize position and direction on grid
  initialize() {
    const { cells, initialLength } = this.options;

    // Construct head
    const x = Math.floor(Math.random() * cells);
    const y = Math.floor(Math.random() * cells);
    this.head = { x, y };

    // Determine direction for tail construction
    const axis = Math.random();
    const rand = Math.random();
    if (axis > 0.5) {
      this.dir = { x: rand > 0.5 ? 1 : -1, y: 0 };
    } else {
      this.dir = { x: 0, y: rand > 0.5 ? 1 : -1 };
    }

    // Construct tail
    this.tail = [];
    for (let i = initialLength - 1; i > 0; i--) {
      if (axis > 0.5) {
        // X-axis
        if (this.dir.x === 1) {
          // Right
          this.tail.push({ x: x - i, y });
        } else {
          // Left
          this.tail.push({ x: x + i, y });
        }
      } else {
        // Y-axis
        if (this.dir.y === 1) {
          // Down
          this.tail.push({ x, y: y - i });
        } else {
          // Up
          this.tail.push({ x, y: y + i });
        }
      }
    }

    // Recurse if any tail segment out of bounds
    for (const segment of this.tail) {
      if (
        segment.x < 0 ||
        segment.y < 0 ||
        segment.x > cells - 1 ||
        segment.y > cells - 1
      )
        return this.initialize();
    }
  }

  // Update position from velocity
  update() {
    // Update tail
    if (this.vel.x || this.vel.y) {
      // Shift tail segments
      for (let i = 0; i < this.tail.length - 1; i++) {
        this.tail[i] = { ...this.tail[i + 1] };
      }

      // Save food encounters for cascading effect
      this.tail[this.tail.length - 1] = { ...this.head, food: this.hasEaten };
      this.hasEaten = false;
    }

    // Update head
    this.head.x += this.vel.x;
    this.head.y += this.vel.y;

    // Check for head-tail collision
    for (const segment of this.tail) {
      if (segment.x === this.head.x && segment.y === this.head.y)
        this.alive = false;
    }

    // Handle snake moving into game boundaries
    const { cells, allowWrap } = this.options;
    const tCollision = this.head.y < 0;
    const rCollision = this.head.x > cells - 1;
    const bCollision = this.head.y > cells - 1;
    const lCollision = this.head.x < 0;
    if (allowWrap) {
      if (tCollision) this.head.y = cells - 1;
      if (rCollision) this.head.x = 0;
      if (bCollision) this.head.y = 0;
      if (lCollision) this.head.x = cells - 1;
    } else {
      if (tCollision || rCollision || bCollision || lCollision)
        this.alive = false;
    }
  }

  // Initialize or update velocity
  move(dir) {
    if (!dir) {
      // Initialize velocity using direction
      this.vel = this.dir;
      return;
    }

    // Restrict to single input each frame
    if (this.prev) {
      const moved = this.head.x !== this.prev.x || this.head.y !== this.prev.y;
      if (!moved) return;
    }

    switch (dir) {
      case "left":
        this.vel = { x: this.vel.x === 1 ? 1 : -1, y: 0 };
        break;
      case "up":
        this.vel = { x: 0, y: this.vel.y === 1 ? 1 : -1 };
        break;
      case "right":
        this.vel = { x: this.vel.x === -1 ? -1 : 1, y: 0 };
        break;
      case "down":
        this.vel = { x: 0, y: this.vel.y === -1 ? -1 : 1 };
    }

    // Save head position
    this.prev = { x: this.head.x, y: this.head.y };
  }

  // Handle eating food
  eat() {
    this.tail.push({ ...this.head, food: true });
    this.hasEaten = true;
  }

  // Paint snake
  paint() {
    const snakeHeadColour = "#e5e7eb";
    const snakeSegmentColour = "#e5e7eb";
    const snakeFoodColour = "#6ee7b7";
    const snakeRelSize = 0.8;
    const snakeFoodRelSize = 0.8;
    const snakeBorderRadius = 2;
    const { cellSize } = this.options;

    // Paint tail
    let size, offset;
    for (const segment of this.tail) {
      if (segment.food) {
        this.ctx.fillStyle = snakeFoodColour;
        size = cellSize * snakeFoodRelSize;
        offset = ((1 - snakeFoodRelSize) * cellSize) / 2;
      } else {
        this.ctx.fillStyle = snakeSegmentColour;
        size = cellSize * snakeRelSize;
        offset = ((1 - snakeRelSize) * cellSize) / 2;
      }

      const x = segment.x * cellSize + offset;
      const y = segment.y * cellSize + offset;
      this.ctx.fillRoundRect(x, y, size, size, snakeBorderRadius);
    }

    // Paint head
    this.ctx.fillStyle = snakeHeadColour;
    size = cellSize * snakeRelSize;
    offset = ((1 - snakeRelSize) * cellSize) / 2;
    const x = this.head.x * cellSize + offset;
    const y = this.head.y * cellSize + offset;
    this.ctx.fillRoundRect(x, y, size, size, snakeBorderRadius);
  }

  // Set game options
  setOptions(options) {
    this.options = options;
  }
}
