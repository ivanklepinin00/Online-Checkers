const express = require ('express')
const movePiece = require('./movePiece');
const config = require ('config')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    transports: ['websocket'],
  });

app.use(express.json({extended: true}))


app.use('/api/auth', require('./routes/auth.routes'))

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

const PORT = process.env.PORT || 4000
let games = [];
let nextGameId = 0;

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })

        const getGames = () => {
            return games.map((g) => {
                const { players, ...game } = g;
                return {
                ...game,
                numberOfPlayers: players.length,
                };
            })
        }

        const getGameById = (gameId) => {
            return getGames().find((game)=> game.id === gameId)
        }

        const getGameForPlayer = (player) => {
            return games.find((g) =>
                g.players.find((p) => p.socket === player)
            );
        };


        const addPlayerToGame = ({ player, gameId }) => {
            const game = games.find((game)=> game.id === gameId)
            game.players.push({
            color: 'black',
            socket: player,
            });
        
            return 'black';
        }

        const sendGames = (sender) => {
            return sender.emit('games', getGames());
        };

        const createGame = ({ player, name }) => {
            const game = {
                name,
                turn: 'white',
                players: [
                {
                    socket: player,
                    color: 'white',
                },
                ],
                id: nextGameId++,
                board: [
                  [1, 0, 1, 0, 1, 0, 1, 0],
                  [0, 1, 0, 1, 0, 1, 0, 1],
                  [1, 0, 1, 0, 1, 0, 1, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0, 0, 0],
                  [0, 2, 0, 2, 0, 2, 0, 2],
                  [2, 0, 2, 0, 2, 0, 2, 0],
                  [0, 2, 0, 2, 0, 2, 0, 2],
                ],
                // board: [
                // [0, 0, 0, 0, 0, 0, 0, 0],
                // [0, 0, 0, 0, 0, 0, 0, 0],
                // [0, 0, 0, 0, 0, 0, 0, 0],
                // [0, 0, 0, 0, 0, 0, 0, 0],
                // [0, 0, 1, 0, 0, 0, 0, 0],
                // [0, 2, 0, 0, 0, 0, 0, 0],
                // [0, 0, 0, 0, 0, 0, 0, 0],
                // [0, 0, 0, 0, 0, 0, 0, 0],
                // ],
            };
            games.push(game);
            return game;
            
        }

        const endGame = ({ player, winner}) => {
            const game = getGameForPlayer(player);
            if (!game) return;
            games.splice(games.indexOf(game), 1);
            game.players.forEach((currentPlayer) => {
            if (winner) currentPlayer.socket.emit('winner', winner);
            });
        }

        const isGameOver = ({ player }) => {
            const game = getGameForPlayer(player);

            let whiteCount = 0;
            let blackCount = 0;
            for (let i = 0; i < game.board.length; i++) {
                for (let j = 0; j < game.board[i].length; j++) {
                if (
                    game.board[i][j] === 1 ||
                    game.board[i][j] === 3
                ) {
                    whiteCount++;
                }
                if (
                    game.board[i][j] === 2 ||
                    game.board[i][j] === 4
                ) {
                    blackCount++;
                }
                }
            }
            if (whiteCount === 0) {
                return 'black';
            } else if (blackCount === 0) {
                return 'white';
            } else {
                return false;
            }
        };

        io.on('connection', socket => {
            socket.emit('games', getGames());
            socket.on('create-game', (name) => {
                const game = createGame({player: socket, name})  
                sendGames(io);
                socket.emit('your-game-created', game.id);
                socket.emit('color', 'white');
            })

            socket.on('join-game', (gameId) => {
                const game = getGameById(gameId);
                if (game.numberOfPlayers < 2) {
                    const color = addPlayerToGame({
                        player: socket,
                        gameId,
                    });
                    sendGames(io);
                    socket.emit('color', color);
                }
                sendGames(io);
            })

            socket.on('move-piece', ({selectedPiece, destination,}) => {
            const game = getGameForPlayer(socket);
            movePiece({ game, selectedPiece, destination});
            const winner = isGameOver({ player: socket });

            if (winner !== false) {
                endGame({ player: socket, winner });
            }
            sendGames(io);
            })

            socket.on('disconnect', () => {
                endGame({ player: socket });
                sendGames(io);
            });
            socket.on('leave-game', () => {
                endGame({ player: socket });
                sendGames(io);
            })
        });

        http.listen(PORT, function(){
            console.log(`Server started on port ${PORT}`)
        });
        
    } catch (e) {
        console.log('server errorr', e.message)
        process.exit(1)
    }
}

start ()
