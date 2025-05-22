const Gameboard = (function() {
  const size = 3;
  const board = [];

  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
      board[i].push("");
    }
  }

  const getBoard = () => board;

  const markCell = (action, player) => {
    const [row, column] = action;
    if (board[row][column] === "") {
      board[row][column] = player;
    }
  }

  return { getBoard, markCell };
})();

function Player(name, marker, type) {
  return { name, marker, type };
}

function GameController(player1, player2) {
  const board = Gameboard.getBoard();

  const getEmptyCellsCount = () => {
    return board
      .flat()
      .filter(cell => cell === "").length;
  }

  const getActivePlayer = () => {
    const totalCellsCount = board.length ** 2;
    return (totalCellsCount - getEmptyCellsCount()) % 2 === 0 ? player1 : player2; 
  }

  const getPossibleActions = () => {
    const actions = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if(board[i][j] === "") actions.push([i, j]);
      }
    }
    return actions;
  }

  const getWinner = () => {
    const X = player1.marker;
    const O = player2.marker;

    // Check rows
    for (const row of board) {
      if (row.every(cell => cell === X)) return player1;
      else if (row.every(cell => cell === O)) return player2;
    }

    // Check columns
    for (let i = 0; i < board.length; i++) {
      if (board.every(row => row[i] === X)) return player1;
      else if (board.every(row => row[i] === O)) return player2;
    }

    // Check diagonals
    const diagonal1 = [];
    const diagonal2 = [];
    for (let i = 0; i < board.length; i++) {
      diagonal1.push(board[i][i]);
      diagonal2.push(board[i][board.length - 1 - i]);
    }
    for (const diagonal of [diagonal1, diagonal2]) {
      if (diagonal.every(cell => cell === X)) return player1;
      else if (diagonal.every(cell => cell === O)) return player2;
    }

    // No winner: game in progress or tie
    return null;
  }

  const playRound = (action) => {
    const [row, column] = action;
    // Ignore if action is illegal or game is over
    if (!getPossibleActions()
      .some(arr => arr[0] === row && arr[1] === column)
      || getWinner()
    ) return;

    const activePlayer = getActivePlayer();
    console.log(
      `Marking '${activePlayer.marker}' at row ${row}, column ${column}...`
    );
    Gameboard.markCell(action, activePlayer.marker);
    console.log(board);
    
    const winner = getWinner()
    const isTerminal = winner !== null || getEmptyCellsCount() === 0;

    if (isTerminal) {
      if (winner !== null) {
        console.log(`${winner.name} wins!`);
      } else {
        console.log("Tie!");
      }
    } else {
      console.log(`${getActivePlayer().name}'s turn.`)
    }
  }

  console.log(board);
  console.log(`${player1.name}'s turn.`)

  return { board, getActivePlayer, playRound };
}

(function displayController() {
  const player1 = Player("Player 1", "X", "Human");
  const player2 = Player("Player 2", "O", "Human");
  const game = GameController(player1, player2);
  const board = game.board;
  const boardDiv = document.querySelector(".board");

  const createCells = () => {
    boardDiv.textContent = "";

    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = i;
        cellButton.dataset.column = j;
        cellButton.textContent = cell;
        boardDiv.appendChild(cellButton);
      });
    });
  }

  const updateScreen = (cellButton) => {
    const selectedRow = cellButton.dataset.row;
    const selectedColumn = cellButton.dataset.column;
    cellButton.textContent = board[+selectedRow][+selectedColumn];
    if (player1.marker === cellButton.textContent) {
      cellButton.style.color = "var(--blue)";
    } else {
      cellButton.style.color = "var(--orange)";
    }
  }

  boardDiv.addEventListener("click", (e) => {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;

    game.playRound([+selectedRow, +selectedColumn]);
    updateScreen(e.target);
  });

  createCells();
})();