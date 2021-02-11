import React, { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import classNames from 'classnames';

import '../Game.css';

const colorMap = {
  0: 'empty',
  1: 'white',
  2: 'black',
  3: 'white',
  4: 'black',
};

export default function Game({ leaveGame, movePiece, game, color,}) {
  const [selectedPiece, setSelectedPiece] = useState({});

  useEffect(() => {
    return () => leaveGame();
  }, []);

  const selectPiece = (i, j) => {
    if (game.turn !== color) return;
    if (colorMap[game.board[i][j]] !== color) return;
    setSelectedPiece({ i, j });
  };

  const dropSelectedPiece = (i, j) => {
    if (game.turn !== color) return;
    if (game.board[i][j] !== 0) return;
    if ((i + j) % 2 === 1) return;
    movePiece({
      selectedPiece,
      destination: {
        i,
        j,
      },
    });
    setSelectedPiece({});
  };

  const isPieceSelected = (i, j) => {
    return selectedPiece.i === i && selectedPiece.j === j;
  };

  const getColor = (piece) =>
    piece === 1 ? 'white' : 'black';

  const renderBoard = () => {
    return (
      <div className="board">
        {game.board.map((row, i) => (
          <div key={i} className="row">
            {row.map((piece, j) => (
              <div
                key={`${i} ${j}`}
                className={classNames('cell', {
                  gray: (i + j) % 2 === 0,
                  white: (i + j) % 2 !== 0,
                })}
                onClick={() => dropSelectedPiece(i, j)} // проверка хода после выбора шашки
              >
                {piece !== 0 && (
                  <div
                    className={classNames('piece', {
                      selected: isPieceSelected(i, j), // для подсветки
                      white: piece === 1,
                      black: piece === 2,
                      blackQueen: piece === 4,
                      whiteQueen: piece === 3,
                      clickable: color === getColor(piece), // для cursor: pointer;
                    })}
                    onClick={() => selectPiece(i, j)}
                  ></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const isGameStarted = () => game.numberOfPlayers === 2;

  const renderWaiting = () => {
    return (
      <Col>
        <div className="text-center">
          <h2 className="mb-4">{game.name}</h2>
          <div className="mb-4">
            <Spinner animation="border" role="status" />
          </div>
          <span>Waiting for an opponent</span>
        </div>
      </Col>
    );
  };

  const renderGame = () => {
    return (
      <>
        <Col>
          <div className="text-center">Your piece color is {color}</div>
          {game.turn === color && (
            <div className="text-center">It is your turn!</div>
          )}
          {game.turn !== color && (
            <div className="text-center">Waiting for opponent!</div>
          )}
          {renderBoard()}
        </Col>
      </>
    );
  };
  return (
    <Row>
      {!isGameStarted() && renderWaiting()}
      {isGameStarted() && renderGame()}
    </Row>
  );
}