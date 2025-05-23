function Gameboard(size) {
  const board = [];

  // Initialize size x size board
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

  const getBoard = () => gameboard.getBoard();

  const getEmptyCellsCount = board => {
    return board
      .flat()
      .filter(cell => cell === "").length;
  }

  const getActivePlayer = board => {
    // Deduce player based on number of markers
    const totalCellsCount = board.length ** 2;
    return (totalCellsCount - getEmptyCellsCount(board)) % 2 === 0 ? player1 : player2; 
  }

  const getPossibleActions = board => {
    const actions = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if(board[i][j] === "") actions.push([i, j]);
      }
    }
    return actions;
  }

  const getWinner = board => {
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

  const isTerminal = board => getWinner(board) || getEmptyCellsCount(board) === 0;

  const playRound = (board, action) => {
    const [row, column] = action;
    // Ignore if action is illegal or game is over
    if (!getPossibleActions(board)
      .some(arr => arr[0] === row && arr[1] === column)
      || getWinner(board)
    ) return;

    const activePlayer = getActivePlayer(board);
    console.log(
      `Marking '${activePlayer.marker}' at row ${row}, column ${column}...`
    );
    gameboard.markCell(action, activePlayer.marker);
    console.log(board);
    
    const terminal = isTerminal(board);
    let turnText, winText;

    if (terminal) {
      if (typeof terminal === "object") winText = `${terminal.name} wins!`;
      else winText = "Tie!";
      console.log(winText);
    } else {
      turnText = `${getActivePlayer(board).name}'s turn.`;
      console.log(turnText);
    }

    return [turnText, winText];
  }

  const getRandomAction = actions => {
    return actions[Math.floor(Math.random() * actions.length)];
  }

  const playEasyComputerRound = board => {
    // Select random legal move
    const action = getRandomAction(getPossibleActions(board))
    return [action, ...playRound(board, action)];
  }

  const getUtility = board => {
    const winner = getWinner(board);
    // Tie
    if (!winner) return 0;
    if (player1.marker === winner.marker) return 1;
    else return -1;
  }

  const getResultingBoard = (board, action) => {
    const [i, j] = action;
    // Deep copy the board
    const newBoard = board.map(row => row.slice());
    newBoard[i][j] = getActivePlayer(board).marker;
    return newBoard;
  }

  const minimax = board => {
    // Returns the optimal action(s) for the current player on the board
    if (size === 3 && getEmptyCellsCount(board) === 9) {
      // Hard code trickiest first move in standard Tic Tac Toe
      return getRandomAction([[0, 0], [0, 2], [2, 0], [2, 2]]);  // Random corner
    }

    if (isTerminal(board)) return null;

    const maximizing = player1.marker === getActivePlayer(board).marker;
    let bestValue = maximizing ? -Infinity : Infinity;
    let bestActions = [];

    for (const action of getPossibleActions(board)) {
      const newBoard = getResultingBoard(board, action);
      let value;
      if (maximizing) {
        value = minValue(newBoard);
        if (value > bestValue) {
          bestValue = value;
          bestActions = [action];
        } else if (value === bestValue) {
          bestActions.push(action);
        }
      } else {
        value = maxValue(newBoard);
        if (value < bestValue) {
          bestValue = value;
          bestActions = [action];
        } else if (value === bestValue) {
          bestActions.push(action);
        }
      }
    }
    return bestActions;

    function maxValue(board, a = -Infinity, b = Infinity) {
      // Return maximum utility player 1 can guarantee from a board given optimal play
      if (isTerminal(board)) return getUtility(board);
      let v = -Infinity;
      for (const action of getPossibleActions(board)) {
        v = Math.max(v, minValue(getResultingBoard(board, action), a, b));
        a = Math.max(a, v);
        // Prune if player 1 can at least guarantee value of a
        if (a >= b) break;
      }
      return v;
    }

    function minValue(board, a = -Infinity, b = Infinity) {
      // Return minimum utility player 2 can guarantee from a board given optimal play
      if (isTerminal(board)) return getUtility(board);
      let v = Infinity;
      for (const action of getPossibleActions(board)) {
        v = Math.min(v, maxValue(getResultingBoard(board, action), a, b));
        b = Math.min(b, v);
        // Prune if player 2 can at least guarantee value of b
        if (a >= b) break;
      }
      return v;
    }
  }

  const playHardComputerRound = board => {
    let action;
    if (size === 3 && getEmptyCellsCount(board) === 9) {
      // Hard code trickiest first move in standard Tic Tac Toe
      action = getRandomAction([[0, 0], [0, 2], [2, 0], [2, 2]]);  // Random corner
    } else {
      // Choose best action randomly
      action = getRandomAction(minimax(board));
    }
    return [action, ...playRound(board, action)];
  }

  console.log(getBoard());
  console.log(`${player1.name}'s turn.`)

  return { 
    getBoard,
    getEmptyCellsCount,
    getActivePlayer,
    getWinner,
    playRound,
    playEasyComputerRound,
    playHardComputerRound,
  };
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

  function handleFormSubmit(e) {
    e.preventDefault();
    
    inputs.forEach(input => {
      // Replace empty inputs with default values
      if (!input.value) {
        input.value = input.getAttribute("value");
      }
    });

    player1 = getPlayerFromDiv(player1Div);
    player2 = getPlayerFromDiv(player2Div);

    // Prevent identical names or markers
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
    if (size > 3 && (player1.type === "ai-hard" || player2.type === "ai-hard")) {
      alert("AI - Hard is disabled for larger boards!");
      return;
    }

    game = GameController(size, player1, player2);
    board = game.getBoard();

    // Diable form
    form.setAttribute("inert", "");

    // Initialize turn div
    turnDiv.style.visibility = "visible";
    turnDiv.textContent = `${player1.name}'s turn.`;

    // Reset win div
    winDiv.textContent = "";
    winDiv.classList.remove("blue");
    winDiv.classList.remove("orange");

    createCells(size);
  }

  const handleFormErrorReset = inputs => {
    // Remove custom form errors on identical inputs when either changes
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        inputs.forEach(input => {
          input.setCustomValidity("");
        });
      });
    });
  }

  const addPlayerHover = cellButton => {
    // Add highlighting effect on hover for human players
    const row = cellButton.dataset.row;
    const column = cellButton.dataset.column;
    const activePlayer = game.getActivePlayer(board);

    if (
      board[+row][+column] !== ""
      || activePlayer.type !== "human"
      || game.getWinner(board)
    ) return;

    if (player1.marker === activePlayer.marker) {
      cellButton.classList.add("blue-hover");
    } else if (player2.marker === activePlayer.marker) {
      cellButton.classList.add("orange-hover");
    }
  }

  const removePlayerHover = cellButton => {
    cellButton.classList.remove("blue-hover");
    cellButton.classList.remove("orange-hover");
  }

  const createCells = size => {
    boardDiv.textContent = "";
    boardDiv.style.gridTemplate = `repeat(${size}, 1fr) / repeat(${size}, 1fr)`;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        // Create data attributes to identify cell
        cellButton.dataset.row = i;
        cellButton.dataset.column = j;

        // Adjust font size to fit board
        cellButton.style.fontSize = `${8 - size}rem`;
        if (game) cellButton.style.cursor = "pointer";

        // Add highlighting effect on hover
        cellButton.addEventListener("mouseover", () => {
          addPlayerHover(cellButton);
        });
        cellButton.addEventListener("mouseleave", () => {
          removePlayerHover(cellButton);
        });

        boardDiv.appendChild(cellButton);
      }
    }
  }

  const updateScreen = (action, turnText, winText) => {
    // Only update cell clicked
    const [row, column] = action;
    const cellButton = boardDiv.querySelector(
      `.cell[data-row="${row}"][data-column="${column}"]`
    );
    cellButton.textContent = board[row][column];
    if (player1.marker === cellButton.textContent) {
      cellButton.classList.add("blue");
    } else {
      cellButton.classList.add("orange");
    }

    // Update turn
    turnDiv.textContent = turnText;
    if (winText) {
      turnDiv.style.visibility = "hidden";

      // Display results
      winDiv.textContent = winText;
      if (winText.startsWith(player1.name)) {
        winDiv.classList.add("blue");
      } else if (winText.startsWith(player2.name)) {
        winDiv.classList.add("orange");
      }

      boardDiv.querySelectorAll(".cell").forEach(cellButton => {
        // Remove pointer cursor over board
        cellButton.style.cursor = "auto";
      });
      // Enable form
      form.removeAttribute("inert");
    }
  }

  function onBoardClick(e) {
    const selectedRow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.column;
    const action = [+selectedRow, +selectedColumn];

    switch (game.getActivePlayer(board).type) {
      case "human":
        updateScreen(action, ...game.playRound(board, action));
        removePlayerHover(e.target);
        break;
      case "ai-easy":
        updateScreen(...game.playEasyComputerRound(board));
        break;
      case "ai-hard":
        updateScreen(...game.playHardComputerRound(board));
        break;
    }
  }

  form.addEventListener("submit", handleFormSubmit);

  handleFormErrorReset(nameInputs);
  handleFormErrorReset(markerInputs);

  boardDiv.addEventListener("click", onBoardClick);

  // Display initial default board
  createCells(3);
})();