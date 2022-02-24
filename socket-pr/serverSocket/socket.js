const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const server = http.createServer(app);
const { Server } = require("socket.io");
const axios = require('axios');
const _cloneDeep = require('lodash/cloneDeep')

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: '*'
    }
});

const gameState = {};

const DefaultPlayedCard = {
    1: '',
    2: '',
    3: '',
    4: ''
}
const DefaultBidDetails = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    'PASS_COUNT': 0,
    'LAST_CALL': -1
}
const DefaultRoundWinner = {
    code: "",
    playId: -1
}

const DefaultTrump = 'JOKER'
const DefaultBidValue = -1;
const DefaultDealerPosition = 1;
const DefaultTurnPosition = 2;
const DeafultGameScore = {
    '1-3': 0,
    '2-4': 0
}
const DefaultRoundPoints = 0;

const DefaultPoints = {
    '1-3': 0,
    '2-4': 0
}

const DefaultGameState = {
    1: {
        'id': '',
        'cards': []
    },
    2: {
        'id': '',
        'cards': []
    },
    3: {
        'id': '',
        'cards': []
    },
    4: {
        'id': '',
        'cards': []
    },
    'played_card': _cloneDeep(DefaultPlayedCard),
    'bid_details': _cloneDeep(DefaultBidDetails),
    'round_winner': _cloneDeep(DefaultRoundWinner),
    'trump': DefaultTrump,
    'bid_value': DefaultBidValue,
    'dealer_position': DefaultDealerPosition,
    'turn_position': DefaultTurnPosition,
    'points': _cloneDeep(DefaultPoints),
    'game_score': _cloneDeep(DeafultGameScore),
    'round_points': DefaultRoundPoints,
    'round_done': 0,
    'round_start_id': 0,
    'trumpOpen': false

}

const errorMsg = {
    'no_room_found': 'no game room found, please create first',
    'max_user_reach': 'max allowed user joined, Please create new game'
}
io.on('connection', (socket) => {

    socket.on('create_game', (callback) => {
        let gameId = socket.id;
        console.log(`created game room with room id ${gameId}`)
        gameState[gameId] = _cloneDeep(DefaultGameState);
        callback(gameId);
    });

    socket.on('join_game', async (gameId, userId, cb) => {
        let ids = await io.in(gameId).allSockets();
        if (!ids) {
            socket.emit('err', errorMsg.no_room_found)
            return;
        }
        if (ids.size >= 4) {
            socket.emit('err', errorMsg.max_user_reach);
            return;
        }
        socket.join(gameId);
        ids = await io.in(gameId).allSockets();
        gameState[gameId][ids.size]['id'] = userId;
        socket.emit('player_id', ids.size, async () => {
            cb();
            io.of('/').to(gameId).emit('game_state', gameState[gameId]);
            if (ids.size === 4) {
                io.of('/').to(gameId).emit('game_to_start')
                try {
                    const deck_data = await axios.get('http://deckofcardsapi.com/api/deck/new/shuffle/?cards=JS,9S,AS,0S,KS,QS,8S,7S,JD,9D,AD,0D,KD,QD,8D,7D,JC,9C,AC,0C,KC,QC,8C,7C,JH,9H,AH,0H,KH,QH,8H,7H').then(
                        data => {
                            return data.data
                        }
                    )
                    gameState[gameId].deckState = deck_data;
                    distributeFirst4Cards(gameId)
                } catch (error) {
                    console.log(error);
                }
            }
        });
    })



    const distributeFirst4Cards = async (gameId) => {
        try {
            let data = await axios.get(`https://deckofcardsapi.com/api/deck/${gameState[gameId].deckState.deck_id}/draw/?count=16`).then(
                data => data.data
            )
            gameState[gameId][1].cards = data.cards.slice(0, 4);
            gameState[gameId][2].cards = data.cards.slice(4, 8);
            gameState[gameId][3].cards = data.cards.slice(8, 12);
            gameState[gameId][4].cards = data.cards.slice(12, 16);
            gameState[gameId]['round_done'] = 0;
        } catch (error) {
            console.log(error)
        }
        io.of('/').to(gameId).emit('call_started', gameState[gameId]);
    }


    socket.on('update_bid', (call, playId, bidValue, gameId) => {
        if (call) {
            gameState[gameId]['bid_details'][playId] = bidValue;
            gameState[gameId]['bid_details']['LAST_CALL'] = playId;
            gameState[gameId]['bid_value'] = bidValue;
            if (gameState[gameId]['bid_details']['PASS_COUNT'] === 3) {
                gameState[gameId]['round_start_id'] = playId;
                gameState[gameId]['turn_position'] = playId;
                gameState[gameId]['points']['1-3'] = 0;
                gameState[gameId]['points']['2-4'] = 0;
                // void startGame(gameId);
                io.of('/').to(gameId).emit('biding_done', gameState[gameId]);
                return;
            }
        } else {
            gameState[gameId]['bid_details'][playId] = bidValue;
            gameState[gameId]['bid_details']['PASS_COUNT'] += 1;
            if (gameState[gameId]['bid_details']['PASS_COUNT'] === 4) {
                io.of('/').to(gameId).emit('restart_game');
                return;
            }
            if ((gameState[gameId]['bid_details']['PASS_COUNT'] === 3) && gameState[gameId]['bid_details']['LAST_CALL'] !== -1) {
                gameState[gameId]['round_start_id'] = gameState[gameId]['bid_details']['LAST_CALL'];
                gameState[gameId]['turn_position'] = gameState[gameId]['bid_details']['LAST_CALL'];
                gameState[gameId]['points']['1-3'] = 0;
                gameState[gameId]['points']['2-4'] = 0;
                // void startGame(gameId);
                io.of('/').to(gameId).emit('biding_done', gameState[gameId]);
                return;
            }
        }
        gameState[gameId]['turn_position'] = getNextTurnId(gameState[gameId], playId);
        console.log(gameState[gameId]['turn_position'])
        io.of('/').to(gameId).emit('game_state', gameState[gameId]);
    })

    socket.on('set_trump', (cardCode, gameId) => {
        gameState[gameId]["trump"] = cardCode;
        void startGame(gameId);
    })

    const startGame = async (gameId) => {
        try {
            let data = await axios.get(`https://deckofcardsapi.com/api/deck/${gameState[gameId].deckState.deck_id}/draw/?count=16`).then(
                data => data.data
            )
            gameState[gameId][1].cards = [...gameState[gameId][1].cards, ...data.cards.slice(0, 4)];
            gameState[gameId][2].cards = [...gameState[gameId][2].cards, ...data.cards.slice(4, 8)];
            gameState[gameId][3].cards = [...gameState[gameId][3].cards, ...data.cards.slice(8, 12)];
            gameState[gameId][4].cards = [...gameState[gameId][4].cards, ...data.cards.slice(12, 16)];
        } catch (error) {
            console.log(error)
        }
        io.of('/').to(gameId).emit('game_started', gameState[gameId]);
    }

    socket.on('played_card', (card, playId, gameId) => {
        gameState[gameId]['played_card'][playId] = card;
        let rem_card = gameState[gameId][playId]['cards'].filter(data => data.code !== card.code);
        gameState[gameId][playId]['cards'] = rem_card;
        void chekWinner(gameId, card, playId);
        let nextID = getNextmoveTurnId(playId);
        gameState[gameId]['round_points'] += pointsObj[card.code.substr(0, 1)]
        if (nextID === gameState[gameId]['round_start_id']) {
            gameState[gameId]['round_done'] += 1;
            let winnerId = gameState[gameId]["round_winner"]["playId"]
            gameState[gameId]['first_card_code'] = '';
            if (winnerId === 1 || winnerId === 3) {
                gameState[gameId]['points']['1-3'] += gameState[gameId]['round_points'];
                gameState[gameId]['turn_position'] = winnerId;
                gameState[gameId]['round_start_id'] = winnerId;
                gameState[gameId]['played_card'] = _cloneDeep(DefaultPlayedCard);
                gameState[gameId]["round_winner"] = _cloneDeep(DefaultRoundWinner);
                gameState[gameId]['round_points'] = 0;
            } else {
                gameState[gameId]['points']['2-4'] += gameState[gameId]['round_points'];
                gameState[gameId]['turn_position'] = winnerId;
                gameState[gameId]['round_start_id'] = winnerId;
                gameState[gameId]['played_card'] = _cloneDeep(DefaultPlayedCard);
                gameState[gameId]['round_points'] = 0;
                gameState[gameId]["round_winner"] = _cloneDeep(DefaultRoundWinner);
            }

        } else {
            gameState[gameId]['turn_position'] = nextID;
        }
        console.log('played_Card');


        io.of('/').to(gameId).emit('game_state', gameState[gameId]);

        if (gameState[gameId]['round_done'] === 8) {
            void updateScoreCard(gameId);
        }
    })

    const chekWinner = (gameId, card, playId) => {
        if (gameState[gameId]["round_winner"]['playId'] === -1) {
            gameState[gameId]["first_card_code"] = card.code.substr(1, 2);
            gameState[gameId]["round_winner"] = {
                code: card.code,
                playId: playId
            }
            return true;
        }
        if (card.code.substr(1, 2) === gameState[gameId]["first_card_code"] || (card.code.substr(1, 2) === gameState[gameId]["trump"] && gameState[gameId]['trumpOpen'] === true)) {
            if (gameState[gameId]['trumpOpen'] === true) {
                if (resultcheckObj[gameState[gameId]["trump"]][card.code] > resultcheckObj[gameState[gameId]["trump"]][gameState[gameId]["round_winner"]['code']]) {
                    gameState[gameId]["round_winner"] = {
                        code: card.code,
                        playId: playId
                    }
                }
            } else {
                if (resultcheckObj['JOKER'][card.code] > resultcheckObj['JOKER'][gameState[gameId]["round_winner"]['code']]) {
                    gameState[gameId]["round_winner"] = {
                        code: card.code,
                        playId: playId
                    }
                }
            }
        } else {
            console.log(resultcheckObj[gameState[gameId]["trump"]][card.code]);
            console.log(resultcheckObj[gameState[gameId]["trump"]][gameState[gameId]["round_winner"]['code']])
        }
    }

    const updateScoreCard = (roomId) => {
        if (gameState[roomId]['bid_details']['LAST_CALL'] === 1 || gameState[roomId]['bid_details']['LAST_CALL'] === 3) {
            if (gameState[roomId]['points']['1-3'] * 2 >= gameState[roomId]['bid_value']) {
                gameState[roomId]['game_score']['1-3'] += 1;
            } else {
                gameState[roomId]['game_score']['1-3'] -= 1;
            }
        } else {
            if (gameState[roomId]['points']['2-4'] >= gameState[roomId]['bid_value']) {
                gameState[roomId]['game_score']['2-4'] += 1;
            } else {
                gameState[roomId]['game_score']['2-4'] -= 1;
            }
        }
        if (gameState[roomId]['game_score']['1-3'] >= 6 || gameState[roomId]['game_score']['1-3'] <= -6) {
            if (gameState[roomId]['game_score']['1-3'] >= 6) {
                gameState[roomId]['winner'] = '1-3'
                gameState[roomId]['looser'] = '2-4'
            } else {
                gameState[roomId]['winner'] = '2-4'
                gameState[roomId]['looser'] = '1-3'
            }
            io.of('/').to(roomId).emit('declare_winner', gameState[roomId]);
        } else if (gameState[roomId]['game_score']['2-4'] >= 6 || gameState[roomId]['game_score']['2-4'] <= -6) {
            if (gameState[roomId]['game_score']['2-4'] <= -6) {
                gameState[roomId]['winner'] = '1-3'
                gameState[roomId]['looser'] = '2-4'
            } else {
                gameState[roomId]['winner'] = '2-4'
                gameState[roomId]['looser'] = '1-3'
            }
            io.of('/').to(roomId).emit('declare_winner', gameState[roomId]);
        } else {
            startNewGameRound(roomId);
        }

    }
    socket.on('open_trump', (roomId) => {
        gameState[roomId].trumpOpen = true;
        io.of('/').to(roomId).emit('game_state', gameState[roomId]);
    })
    const startNewGameRound = async (roomId) => {
        gameState[roomId]['bid_details'] = _cloneDeep(DefaultBidDetails);
        gameState[roomId]["trump"] = 'JOKER';
        gameState[roomId]['bid_value'] = 17;
        gameState[roomId]['dealer_position'] += 1;
        gameState[roomId]['turn_position'] = gameState[roomId]['dealer_position'] + 1 <= 4 ? gameState[roomId]['dealer_position'] + 1 : (gameState[roomId]['dealer_position'] + 1) % 4;
        gameState[roomId]['points'] = _cloneDeep(DefaultPoints);
        gameState[roomId]['round_points'] = 0;
        gameState[roomId]['round_start_id'] = -1;
        try {
            await axios.post(`https://deckofcardsapi.com/api/deck/${gameState[roomId].deckState.deck_id}/shuffle/`);
            distributeFirst4Cards(roomId)
        } catch (error) {
            console.log(error);
        }

    }

    const getNextTurnId = (currentGame, playId) => {
        const nextId = playId + 1 <= 4 ? playId + 1 : (playId + 1) % 4;
        if (currentGame['bid_details'][nextId] !== 'PASS') {
            console.log('next id', nextId);
            return nextId;
        } else {
            return getNextTurnId(currentGame, nextId);
        }
    }

    const getNextmoveTurnId = (playId) => {
        const nextId = playId + 1 <= 4 ? playId + 1 : (playId + 1) % 4;
        return nextId;
    }
});

server.listen(3006, () => {
    console.log('listening on *:3006');
});


const pointsObj = {
    'J': 3,
    '9': 2,
    'A': 1,
    '0': 1,
    'K': 0,
    'Q': 0,
    '8': 0,
    '7': 0,
}
const resultcheckObj = {
    'S': {
        'JS': 18,
        '9S': 17,
        'AS': 16,
        '0S': 15,
        'KS': 14,
        'QS': 13,
        '8S': 12,
        '7S': 11,
        'JD': 8,
        '9D': 7,
        'AD': 6,
        '0D': 5,
        'KD': 4,
        'QD': 3,
        '8D': 2,
        '7D': 1,
        'JC': 8,
        '9C': 7,
        'AC': 6,
        '0C': 5,
        'KC': 4,
        'QC': 3,
        '8C': 2,
        '7C': 1,
        'JH': 8,
        '9H': 7,
        'AH': 6,
        '0H': 5,
        'KH': 4,
        'QH': 3,
        '8H': 2,
        '7H': 1,
    },
    'D': {
        'JS': 8,
        '9S': 7,
        'AS': 6,
        '0S': 5,
        'KS': 4,
        'QS': 3,
        '8S': 2,
        '7S': 1,
        'JD': 18,
        '9D': 17,
        'AD': 16,
        '0D': 15,
        'KD': 14,
        'QD': 13,
        '8D': 12,
        '7D': 11,
        'JC': 8,
        '9C': 7,
        'AC': 6,
        '0C': 5,
        'KC': 4,
        'QC': 3,
        '8C': 2,
        '7C': 1,
        'JH': 8,
        '9H': 7,
        'AH': 6,
        '0H': 5,
        'KH': 4,
        'QH': 3,
        '8H': 2,
        '7H': 1,
    },
    'C': {
        'JS': 8,
        '9S': 7,
        'AS': 6,
        '0S': 5,
        'KS': 4,
        'QS': 3,
        '8S': 2,
        '7S': 1,
        'JD': 8,
        '9D': 7,
        'AD': 6,
        '0D': 5,
        'KD': 4,
        'QD': 3,
        '8D': 2,
        '7D': 1,
        'JC': 18,
        '9C': 17,
        'AC': 16,
        '0C': 15,
        'KC': 14,
        'QC': 13,
        '8C': 12,
        '7C': 11,
        'JH': 8,
        '9H': 7,
        'AH': 6,
        '0H': 5,
        'KH': 4,
        'QH': 3,
        '8H': 2,
        '7H': 1,
    },
    'H': {
        'JS': 8,
        '9S': 7,
        'AS': 6,
        '0S': 5,
        'KS': 4,
        'QS': 3,
        '8S': 2,
        '7S': 1,
        'JD': 8,
        '9D': 7,
        'AD': 6,
        '0D': 5,
        'KD': 4,
        'QD': 3,
        '8D': 2,
        '7D': 1,
        'JC': 8,
        '9C': 7,
        'AC': 6,
        '0C': 5,
        'KC': 4,
        'QC': 3,
        '8C': 2,
        '7C': 1,
        'JH': 18,
        '9H': 17,
        'AH': 16,
        '0H': 15,
        'KH': 14,
        'QH': 13,
        '8H': 12,
        '7H': 11,
    },
    'JOKER': {
        'JS': 8,
        '9S': 7,
        'AS': 6,
        '0S': 5,
        'KS': 4,
        'QS': 3,
        '8S': 2,
        '7S': 1,
        'JD': 8,
        '9D': 7,
        'AD': 6,
        '0D': 5,
        'KD': 4,
        'QD': 3,
        '8D': 2,
        '7D': 1,
        'JC': 8,
        '9C': 7,
        'AC': 6,
        '0C': 5,
        'KC': 4,
        'QC': 3,
        '8C': 2,
        '7C': 1,
        'JH': 8,
        '9H': 7,
        'AH': 6,
        '0H': 5,
        'KH': 4,
        'QH': 3,
        '8H': 2,
        '7H': 1,
    }
}