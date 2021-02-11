import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { NavLink } from 'react-router-dom';

export default function Lobby({
  joinGame,
  games,
}) {
  return (
    <div className="lobby">
      <div className="mb-4">
        <Button
          variant="primary"
          as={NavLink}
          to="/create-game"
        >
          Create New Game
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Game Name</th>
            <th>Number of Players</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {games.length === 0 && (
            <tr>
              <td colSpan="3">No games created yet</td>
            </tr>
          )}
          {games.map((game) => (
            <tr key={game.name}>
              <td>{game.name}</td>
              <td>{game.numberOfPlayers} / 2</td>
              <td>
                {game.numberOfPlayers < 2 && (<Button
                  onClick={() => joinGame(game.id)}
                  variant="link"
                  as={NavLink}
                  to="/game"
                >
                  Join Game
                </Button>)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}