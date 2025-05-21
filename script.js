function Gameboard() {
  const size = 3;
  const board = [];

  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const markCell = (action, player) => {
    const [row, column] = action;
    if (board[row][column].getValue() === "") {
      board[row][column].mark(player);
    }
  }

  const printBoard = () => {
    console.log(board.map(row => row.map(cell => cell.getValue())));
  }

  return { getBoard, markCell, printBoard };
}

function Cell() {
  let value = "";

  const getValue = () => value;

  const mark = player => {
    value = player;
  }

  return { getValue, mark };
}

const game = Gameboard();