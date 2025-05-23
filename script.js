function Gameboard(size) {
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
}

function Player(name, marker, type) {
  return { name, marker, type };
}

function GameController(size, player1, player2) {
  const gameboard = Gameboard(size);
  const board = gameboard.getBoard();

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
    gameboard.markCell(action, activePlayer.marker);
    console.log(board);
    
    const winner = getWinner()
    const isTerminal = winner !== null || getEmptyCellsCount() === 0;
    let turnText, winText;

    if (isTerminal) {
      if (winner !== null) winText = `${winner.name} wins!`;
      else winText = "Tie!";
      console.log(winText);
    } else {
      turnText = `${getActivePlayer().name}'s turn.`;
      console.log(turnText);
    }

    return [turnText, winText];
  }

  console.log(board);
  console.log(`${player1.name}'s turn.`)

  return { board, getEmptyCellsCount, getActivePlayer, getWinner, playRound };
}

(function displayController() {
  const player1Div = document.querySelector(".player.blue");
  const player2Div = document.querySelector(".player.orange");
  const sizeDiv = document.querySelector(".play input");
  const form = document.querySelector("form");
  const inputs = form.querySelectorAll("input");
  const nameInputs = form.querySelectorAll('input[name="name"]')
  const markerInputs = form.querySelectorAll('input[name="marker"]');
  const turnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const winDiv = document.querySelector(".win");

  let player1, player2, size, game, board;

  const getPlayerFromDiv = playerDiv => {
    const name = playerDiv.querySelector('input[name="name"]').value;
    const marker = playerDiv.querySelector('input[name="marker"]').value;
    const type = playerDiv.querySelector('select[name="type"]').value;
    return Player(name, marker, type);
  }

  const createCells = size => {
    boardDiv.textContent = "";
    boardDiv.style.gridTemplate = `repeat(${size}, 1fr) / repeat(${size}, 1fr)`;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = i;
        cellButton.dataset.column = j;

        cellButton.style.fontSize = `${8 - size}rem`;
        if (game) cellButton.style.cursor = "pointer";

        cellButton.addEventListener("mouseenter", e => {
          if (board[i][j] !== "" || game.getWinner()) return;
          if (player1.marker === game.getActivePlayer().marker) {
            cellButton.classList.add("blue-hover");
          } else {
            cellButton.classList.add("orange-hover");
          }
        });
        cellButton.addEventListener("mouseleave", e => {
          cellButton.classList.remove("blue-hover");
          cellButton.classList.remove("orange-hover");
        });

        boardDiv.appendChild(cellButton);
      }
    }
  }

  const updateScreen = (cellButton, turnText, winText) => {
    const selectedRow = cellButton.dataset.row;
    const selectedColumn = cellButton.dataset.column;
    cellButton.textContent = board[+selectedRow][+selectedColumn];
    if (player1.marker === cellButton.textContent) {
      cellButton.classList.add("blue");
    } else {
      cellButton.classList.add("orange");
    }

    turnDiv.textContent = turnText;
    if (winText) {
      turnDiv.style.visibility = "hidden";
      winDiv.textContent = winText;
      boardDiv.querySelectorAll(".cell").forEach(cellButton => {
        cellButton.style.cursor = "auto";
      });
      form.removeAttribute("inert");
    }
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    
    inputs.forEach(input => {
      if (!input.value) {
        input.value = input.getAttribute("value");
      }
    });

    player1 = getPlayerFromDiv(player1Div);
    player2 = getPlayerFromDiv(player2Div);

    if (player1.name === player2.name) {
      const name1Input = player1Div.querySelector('input[name="name"]');
      name1Input.setCustomValidity("Player names must be different.");
      name1Input.reportValidity();
      return;
    }
    if (player1.marker === player2.marker) {
      const marker2Input = player2Div.querySelector('input[name="marker"]');
      marker2Input.setCustomValidity("Player markers must be different.");
      marker2Input.reportValidity();
      return;
    }

    size = +sizeDiv.value;
    game = GameController(size, player1, player2);
    board = game.board;

    form.setAttribute("inert", "");
    turnDiv.style.visibility = "visible";
    turnDiv.textContent = `${game.getActivePlayer().name}'s turn.`;
    winDiv.textContent = "";
    createCells(size);
  });

  nameInputs.forEach(input => {
    input.addEventListener("input", () => {
      nameInputs.forEach(input => {
        input.setCustomValidity("");
      });
    });
  });

  markerInputs.forEach(input => {
    input.addEventListener("input", () => {
      markerInputs.forEach(input => {
        input.setCustomValidity("");
      });
    });
  });

  boardDiv.addEventListener("click", e => {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;

    e.target.classList.remove("blue-hover");
    e.target.classList.remove("orange-hover");

    const [turnText, winText] = game.playRound([+selectedRow, +selectedColumn]);
    updateScreen(e.target, turnText, winText);
  });

  createCells(3);
})();