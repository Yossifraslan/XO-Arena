const X_CLASS = "x";
const CIRCLE_CLASS = "circle";
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const coverPage = document.getElementById("coverPage");
const gameContainer = document.getElementById("gameContainer");
const multiplayerBtn = document.getElementById("multiplayerBtn");
const aiBtn = document.getElementById("aiBtn");
const difficultyPage = document.getElementById("difficultyPage");
const difficultyButtons = document.querySelectorAll("[data-difficulty]");
const backToMenuBtn = document.getElementById("backToMenu");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");

const cellElements = document.querySelectorAll("[data-cell]");
const turnX = document.getElementById("turnX");
const turnO = document.getElementById("turnO");
const board = document.getElementById("board");
const winningMessageElement = document.getElementById("winningMessage");
const restartButton = document.getElementById("restartButton");
const menuButton = document.getElementById("menuButton");
const winningMessageTextElement = document.querySelector(
  "[data-winning-message-text]"
);

let circleTurn;
let gameMode = null;
let difficulty = null;
let scoreX = 0;
let scoreO = 0;
let aiThinking = false;

multiplayerBtn.addEventListener("click", () => {
  resetScores();
  gameMode = "multiplayer";
  coverPage.style.display = "none";
  gameContainer.style.display = "flex";
  startGame();
});

aiBtn.addEventListener("click", () => {
  resetScores();
  gameMode = "ai";
  coverPage.style.display = "none";
  difficultyPage.style.display = "grid";
});

backToMenuBtn.addEventListener("click", () => {
  gameContainer.style.display = "none";
  difficultyPage.style.display = "none";
  coverPage.style.display = "grid";

  gameMode = null;
  difficulty = null;

  winningMessageElement.classList.remove("show");
});

menuButton.addEventListener("click", () => {
  winningMessageElement.classList.remove("show");

  gameContainer.style.display = "none";
  difficultyPage.style.display = "none";
  coverPage.style.display = "grid";

  gameMode = null;
  difficulty = null;
});

difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    resetScores();
    difficulty = btn.dataset.difficulty;
    difficultyPage.style.display = "none";
    gameContainer.style.display = "flex";
    startGame();
  });
});

restartButton.addEventListener("click", startGame);

function startGame() {
  circleTurn = false;

  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(CIRCLE_CLASS);
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  });
  winningMessageElement.classList.remove("show");

  setBoardHoverClass();
  updateTurnIndicator();
}

function handleClick(e) {
  if (gameMode === "ai" && circleTurn) return;

  const cell = e.target;
  const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;
  placeMark(cell, currentClass);
  if (checkWin(currentClass)) {
    endGame(false);
  } else if (isDraw()) {
    endGame(true);
  } else {
    swapTurns();
  }
  if (gameMode === "ai" && circleTurn) {
    board.style.pointerEvents = "none";

    setTimeout(() => {
      aiMove();
      board.style.pointerEvents = "auto";
    }, 400);
  }
}

function isDraw() {
  return [...cellElements].every((cell) => {
    return (
      cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    );
  });
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
}

function swapTurns() {
  circleTurn = !circleTurn;
  updateTurnIndicator();
  setBoardHoverClass();
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(CIRCLE_CLASS);
  if (circleTurn) {
    board.classList.add(CIRCLE_CLASS);
  } else {
    board.classList.add(X_CLASS);
  }
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}

function updateTurnIndicator() {
  turnX.classList.remove("active");
  turnO.classList.remove("active");

  if (circleTurn) {
    turnO.classList.add("active");
  } else {
    turnX.classList.add("active");
  }
}

function aiMove() {
  let cell;

  if (difficulty === "easy") {
    cell = getRandomCell();
  } else if (difficulty === "medium") {
    cell = getMediumMove();
  } else {
    cell = getBestMove();
  }

  if (!cell) return;

  placeMark(cell, CIRCLE_CLASS);

  if (checkWin(CIRCLE_CLASS)) {
    endGame(false);
    return;
  }

  if (isDraw()) {
    endGame(true);
    return;
  }

  swapTurns();
}

function getRandomCell() {
  const availableCells = [...cellElements].filter(
    (cell) =>
      !cell.classList.contains(X_CLASS) &&
      !cell.classList.contains(CIRCLE_CLASS)
  );
  return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function getMediumMove() {
  return (
    findWinningMove(CIRCLE_CLASS) || findWinningMove(X_CLASS) || getRandomCell()
  );
}

function findWinningMove(playerClass) {
  for (let combination of WINNING_COMBINATIONS) {
    const cells = combination.map((index) => cellElements[index]);
    const marks = cells.map((cell) => cell.classList.contains(playerClass));

    if (marks.filter(Boolean).length === 2) {
      const emptyCell = cells.find(
        (cell) =>
          !cell.classList.contains(X_CLASS) &&
          !cell.classList.contains(CIRCLE_CLASS)
      );
      if (emptyCell) return emptyCell;
    }
  }
  return null;
}

function getBoardState() {
  return [...cellElements].map((cell) =>
    cell.classList.contains(X_CLASS)
      ? "X"
      : cell.classList.contains(CIRCLE_CLASS)
      ? "O"
      : null
  );
}

function getBestMove() {
  const boardState = getBoardState();
  let bestScore = -Infinity;
  let move;

  boardState.forEach((cell, index) => {
    if (cell === null) {
      boardState[index] = "O";
      let score = minimax(boardState, 0, false);
      boardState[index] = null;

      if (score > bestScore) {
        bestScore = score;
        move = cellElements[index];
      }
    }
  });

  return move;
}

function minimax(board, depth, isMaximizing) {
  if (checkWinnerForAI(board, "O")) return 10 - depth;
  if (checkWinnerForAI(board, "X")) return depth - 10;
  if (!board.includes(null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    board.forEach((cell, i) => {
      if (cell === null) {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((cell, i) => {
      if (cell === null) {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    });
    return best;
  }
}

function checkWinnerForAI(board, player) {
  return WINNING_COMBINATIONS.some((combo) =>
    combo.every((index) => board[index] === player)
  );
}

function endGame(draw) {
  if (!draw) {
    if (circleTurn) {
      scoreO++;
      scoreOEl.innerText = scoreO;
    } else {
      scoreX++;
      scoreXEl.innerText = scoreX;
    }
  }

  winningMessageTextElement.innerText = draw
    ? "Draw!"
    : `${circleTurn ? "O's" : "X's"} Wins!`;

  winningMessageElement.classList.add("show");
}

function resetScores() {
  // RESET the GLOBAL score variables
  scoreX = 0;
  scoreO = 0;

  // UPDATE the score display on UI
  scoreXEl.textContent = scoreX;
  scoreOEl.textContent = scoreO;
}
