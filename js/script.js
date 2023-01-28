import Game from "./Game.js";

// DOM elements
const gameEl = document.getElementById("game");
const canvas = document.getElementById("canvas");
const newGameBtn = document.getElementById("new-game-btn");
const pauseGameBtn = document.getElementById("pause-game-btn");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const optionsBtn = document.getElementById("options-btn");
const optionsMdlEl = document.getElementById("options-mdl");
const optionsMdlNumCellsTf = document.getElementById("num-cells-tf");
const optionsMdlFramerateTf = document.getElementById("framerate-tf");
const optionsMdlInitialLengthTf = document.getElementById("initial-length-tf");
const optionsMdlBoundariesCb = document.getElementById("boundaries-cb");
const optionsMdlConfirmBtn = document.getElementById("options-mdl-confirm-btn");
const optionsMdlCancelBtn = document.getElementById("options-mdl-cancel-btn");
const playMdlEl = document.getElementById("play-mdl");
const playMdlBtn = document.getElementById("play-mdl-btn");
const gameoverMdlEl = document.getElementById("gameover-mdl");
const gameoverMdlBtn = document.getElementById("gameover-mdl-btn");
const backdropEl = document.getElementById("backdrop");

// Constraints
const MAX_DIMENSIONS = 600;
const [cellsMin, cellsMax] = [2, 50];
const [framerateMin, framerateMax] = [1, 30];
const [initialLengthMin, initialLengthMax] = [1, cellsMax];
optionsMdlNumCellsTf.min = cellsMin;
optionsMdlNumCellsTf.max = cellsMax;
optionsMdlFramerateTf.min = framerateMin;
optionsMdlFramerateTf.max = framerateMax;
optionsMdlInitialLengthTf.min = initialLengthMin;
optionsMdlInitialLengthTf.max = initialLengthMax;

// Game instance
const options = {
  cells: 12,
  framerate: 5,
  initialLength: 3,
  allowWrap: false,
  foodPoints: 50,
};
const game = new Game(canvas.getContext("2d"), options);

// Start/resume game
function play() {
  playMdlEl.style.display = "none";
  optionsMdlEl.style.display = "none";
  backdropEl.style.display = "none";
  playIcon.style.display = "none";
  pauseIcon.style.display = "block";
  game.play();
}

// Pause game
function pause() {
  playMdlEl.style.display = "block";
  backdropEl.style.display = "block";
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
  game.pause();
}

// Play button handler
function handlePlay() {
  if (game.isGameover) {
    optionsMdlEl.style.display = "none";
  } else {
    play();
  }
}

// New game button handler
function handleNewGame() {
  initialize();
}

// Pause game button handler
function handlePauseGame() {
  if (game.isActive) {
    pause();
  } else {
    if (game.isGameover) return;
    play();
  }
}

// Options button handler
function handleOpenOptions() {
  // Close modal if already open
  if (optionsMdlEl.style.display === "block") {
    optionsMdlEl.style.display = "none";
    return;
  }

  pause();

  // Populate modal fields with game options and show
  const { cells, framerate, initialLength, allowWrap } = game.getOptions();
  optionsMdlNumCellsTf.value = cells;
  optionsMdlFramerateTf.value = framerate;
  optionsMdlInitialLengthTf.value = initialLength;
  optionsMdlBoundariesCb.checked = allowWrap;
  optionsMdlEl.style.display = "block";
}

// Options confirm button handler
function handleSetOptions() {
  const options = game.getOptions();
  const { cells, framerate, initialLength } = options;

  // Validate inputs
  let newCells = parseInt(optionsMdlNumCellsTf.value) || cells;
  if (newCells > cellsMax) newCells = cellsMax;
  if (newCells < cellsMin) newCells = cellsMin;

  let newFramerate = parseInt(optionsMdlFramerateTf.value) || framerate;
  if (newFramerate > framerateMax) newFramerate = framerateMax;
  if (newFramerate < framerateMin) newFramerate = framerateMin;

  let newInitialLength = parseInt(optionsMdlInitialLengthTf.value) || initialLength;
  if (newInitialLength > newCells) newInitialLength = newCells;
  if (newInitialLength < initialLengthMin) newInitialLength = initialLengthMin;

  const allowWrap = optionsMdlBoundariesCb.checked;

  // Set options and close modal
  game.setOptions({
    ...options,
    cells: newCells,
    framerate: newFramerate,
    initialLength: newInitialLength,
    allowWrap,
  });
  // Prepare new game if one not in progress
  if (!game.isStarted) initialize();
  optionsMdlEl.style.display = "none";
}

// Options cancel button handler
function handleCloseOptions() {
  optionsMdlEl.style.display = "none";
}

// Game focus handler
function handleGameFocus(e) {
  if (e.target.closest("#game")) {
    game.focus = true;
  } else {
    game.focus = false;
    if (game.isActive) pause();
  }
}

// Window resize handler
function handleResize() {
  let windowWidth = window.innerWidth;
  return () => {
    // Check for actual resize to account for mobile anomalies
    if (window.innerWidth != windowWidth) initialize();
  };
}

// Events
document.addEventListener("click", handleGameFocus);
document.addEventListener("touchstart", handleGameFocus);
newGameBtn.addEventListener("click", handleNewGame);
pauseGameBtn.addEventListener("click", handlePauseGame);
optionsBtn.addEventListener("click", handleOpenOptions);
optionsMdlConfirmBtn.addEventListener("click", handleSetOptions);
optionsMdlCancelBtn.addEventListener("click", handleCloseOptions);
playMdlBtn.addEventListener("click", handlePlay);
gameoverMdlBtn.addEventListener("click", handleNewGame);
window.addEventListener("resize", handleResize());

// Initialization, resize canvas according to screen size and prepare game
function initialize() {
  const width = gameEl.parentElement.offsetWidth < MAX_DIMENSIONS ? gameEl.parentElement.offsetWidth : MAX_DIMENSIONS;
  const options = game.getOptions();
  const { cells } = options;

  const cellSize = Math.floor(width / cells);
  game.setOptions({ ...options, cellSize });

  const newDimensions = cells * cellSize;
  canvas.width = canvas.height = newDimensions;

  optionsMdlEl.style.display = "none";
  playMdlEl.style.display = "block";
  backdropEl.style.display = "block";
  gameoverMdlEl.style.display = "none";
  pauseGameBtn.disabled = false;
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";

  game.initialize();
}
initialize();
