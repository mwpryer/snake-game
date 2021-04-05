import Snake from "./Snake.js";
import Food from "./Food.js";

// DOM elements
const scoreLbl = document.getElementById("score-lbl");
const highscoreLbl = document.getElementById("highscore-lbl");
const gameoverMdlEl = document.getElementById("gameover-mdl");
const gameoverMdlScoreLbl = document.getElementById("gameover-mdl-score-lbl");
const backdropEl = document.getElementById("backdrop");

export default class Game {
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
    this.score = 0;
    this.highscore = 0;
    this.started = false;
    this.active = false;

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  // Initialize game state and UI
  initialize() {
    this.currOptions = { ...this.options };
    this.score = 0;
    this.started = false;
    this.active = false;
    this.snake = new Snake(this.ctx, this.currOptions);
    this.snake.initialize();
    this.food = new Food(this.ctx, this.currOptions);
    this.food.randomize(this.snake);
    this.paint();

    scoreLbl.textContent = 0;
    document.addEventListener("keydown", this.handleKeydown);
    document.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
  }

  // Determine game state and paint frame
  game() {
    // Update snake
    this.snake.update();

    const { x: snakeX, y: snakeY } = this.snake.head;
    const { x: foodX, y: foodY } = this.food.pos;
    // Check if snake going over food
    if (snakeX === foodX && snakeY === foodY) {
      // Increase snake length and score
      this.snake.eat();
      this.score += this.options.foodPoints;
      scoreLbl.textContent = this.score;

      // Check game has available slot before trying to create food
      if (this.hasFreeSlot()) {
        this.food.randomize(this.snake);
      } else {
        // No free slot, remove food and wait for gameover
        this.food.remove();
      }
    }

    // Check if snake alive
    if (!this.snake.alive) {
      this.gameover();
    } else {
      this.paint();
    }
  }

  // Cleanup and show modal
  gameover() {
    clearInterval(this.intervalId);
    this.started = false;
    this.active = false;
    document.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchmove", this.handleTouchMove);

    // Update highscore
    if (this.score > this.highscore) {
      this.highscore = this.score;
      highscoreLbl.textContent = this.highscore;
    }

    // Show gameover modal
    gameoverMdlScoreLbl.textContent = this.score;
    gameoverMdlEl.style.display = "block";
    backdropEl.style.display = "block";
  }

  // Loop game
  gameLoop() {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(
      () => this.game(),
      1000 / this.currOptions.framerate
    );
  }

  // Start/resume game
  play() {
    if (this.active) return;

    if (!this.started) {
      // First time playing, initialize snake velocity
      this.snake.move();
      this.started = true;
    }

    this.gameLoop();
    this.active = true;
  }

  // Pause game
  pause() {
    if (!this.active) return;

    clearInterval(this.intervalId);
    this.active = false;
  }

  // Paint game board
  paintBoard() {
    const gridColour1 = "#374151";
    const gridColour2 = "#3e495c";
    const { cells, cellSize } = this.currOptions;

    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        this.ctx.fillStyle = (i + j) % 2 === 0 ? gridColour1 : gridColour2;
        this.ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  // Paint all game entities
  paint() {
    this.paintBoard();
    this.snake.paint();
    this.food.paint();
  }

  // Get grid representation of game
  getGrid() {
    const { cells } = this.currOptions;
    const grid = Array(cells)
      .fill()
      .map(() => Array(cells).fill(0));

    const segments = [this.snake.head, ...this.snake.tail];
    for (const segment of segments) {
      grid[segment.y][segment.x] = 1;
    }

    return grid;
  }

  // Determine if game grid has available space
  hasFreeSlot() {
    const grid = this.getGrid();

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid.length; j++) {
        // Check for available slot
        if (!grid[i][j]) return true;
      }
    }

    // No available slot
    return false;
  }

  // Handle game keypress
  handleKeydown(e) {
    // Ignore input when game is not in focus or actively running
    if (!this.focus || !this.active) return;

    // Stop page scrolling
    if ([9, 32, 37, 38, 39, 40].includes(e.keyCode)) e.preventDefault();

    switch (e.keyCode) {
      case 37:
      case 65:
        this.snake.move("left");
        break;
      case 38:
      case 87:
        this.snake.move("up");
        break;
      case 39:
      case 68:
        this.snake.move("right");
        break;
      case 40:
      case 83:
        this.snake.move("down");
    }
  }

  // Handle mobile touch (for potential swipe)
  handleTouchStart(e) {
    const initTouch = e.touches[0];
    this.touch = { x0: initTouch.clientX, y0: initTouch.clientY };
  }

  // Handle mobile swipe
  handleTouchMove(e) {
    // Ignore input when game is not in focus or actively running
    if (!this.focus || !this.active) return;

    // Stop page scrolling
    e.preventDefault();

    if (!this.touch) return;

    const { x0, y0 } = this.touch;
    const x1 = e.touches[0].clientX;
    const y1 = e.touches[0].clientY;
    const xDiff = x0 - x1;
    const yDiff = y0 - y1;

    // Compare for most significant difference
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        this.snake.move("left");
      } else {
        this.snake.move("right");
      }
    } else {
      if (yDiff > 0) {
        this.snake.move("up");
      } else {
        this.snake.move("down");
      }
    }

    this.touch = null;
  }

  // Get game options
  getOptions() {
    return this.options;
  }

  // Set game options
  setOptions(options) {
    this.options = options;
  }
}
