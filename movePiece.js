const WHITE_PAWN = 1;
const BLACK_PAWN = 2;
const WHITE_QUEEN = 3;
const BLACK_QUEEN = 4;
const TOP_ROW = 0;
const BOTTOM_ROW = 7;

module.exports = ({ game, destination, selectedPiece }) => {
  if ( selectedPiece.i === undefined || selectedPiece.j === undefined) return;
  const i = selectedPiece.i; // 5
  const j = selectedPiece.j; // 3
  const di = destination.i; // 3 
  const dj = destination.j; // 7 
  const distanceI = destination.i - selectedPiece.i; // -2
  const distanceJ = destination.j - selectedPiece.j; // 4
  const oneCellForwardI = i + Math.abs(distanceI) / distanceI; // 6
  const oneCellForwardJ = j + Math.abs(distanceJ) / distanceJ; // 5
  const destinationPiece = game.board[di][dj];
  const piece = game.board[i][j];

  // передвижение только на пустые клетки
  if (destinationPiece !== 0) return;

  // бить и ходить только по диагонале
  if (Math.abs(distanceI) !== Math.abs(distanceJ)) return;

  // белые не могут ходить вверх
  if (piece === WHITE_PAWN && di <= i) return;

  // черные не могут ходить вниз
  if (piece === BLACK_PAWN && di >= i) return;
  // можно передвигаться на 1, 2 клетки
  if (Math.abs(distanceI) > 2) return;

  if (Math.abs(distanceI) === 2) {
    // если происходит прыжок
    const middlePiece = game.board[oneCellForwardI][oneCellForwardJ];
    if (middlePiece === 0) return;
    if (middlePiece !== piece) {
      game.board[oneCellForwardI][oneCellForwardJ] = 0;
    } else {
      return;
    }
  }

  game.board[di][dj] = game.board[i][j];
  game.board[i][j] = 0;

  if (piece === WHITE_PAWN && di === BOTTOM_ROW) {
    game.board[di][dj] = WHITE_QUEEN;
  } else if (piece === BLACK_PAWN && di === TOP_ROW) {
    game.board[di][dj] = BLACK_QUEEN;
  }

  game.turn = game.turn === 'white' ? 'black' : 'white';
};