import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { Box, Grid } from '@material-ui/core'
import BiddingScreen from './BiddingScreen';
import PlayGameScreen from './PlayGameScreen';
import _groupBy from 'lodash/groupBy'
import _sortBy from 'lodash/sortBy'
import TrumpScreen from './TrumpScreen';
import ScoreCard from './ScoreCard';


const positionId = (playID, position) => {
    switch (position) {
        case 'left':
            return (playID + 1) > 4 ? (playID + 1) % 4 : playID + 1;
        case 'top':
            return (playID + 2) > 4 ? (playID + 2) % 4 : playID + 2;
        case 'right':
            return (playID + 3) > 4 ? (playID + 3) % 4 : playID + 3;
        default:
            return playID;
    }
}

const DEFAULT_CARD = {
    "CLUBS": [

    ],
    "DIAMONDS": [

    ],
    "HEARTS": [

    ],
    "SPADES": [

    ],

}

const GameScreen = ({ socket, gameId, playId }) => {
    const [gameState, setgameState] = useState({});
    const [selectedCard, setselectedCard] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [positionArr, setpositionArr] = useState({});
    const [currentScreen, setcurrentScreen] = useState({
        callStarted: false,
        gameStarted: false,
        trumpSelection: false,
        winnerContainer: false
    });
    const [showPair, setshowPair] = useState(true)
    const [currentCards, setcurrentCards] = useState(DEFAULT_CARD);
    useEffect(() => {
        socket.on('call_started', (state) => {
            let grpCard = getGropedAndSortedCard(state[playId]?.cards)
            setisLoading(false);
            setgameState(state);
            setcurrentCards(grpCard);
            setcurrentScreen({
                callStarted: true,
                gameStarted: false,
                trumpSelection: false,
                winnerContainer: false
            })
        })
        socket.on('game_state', (state) => {
            let grpCard = getGropedAndSortedCard(state[playId]?.cards)
            setgameState(state);
            setcurrentCards(grpCard);
        })
        socket.on('game_to_start', (state) => {
            setisLoading(true);
        })
        socket.on('game_started', (state) => {
            let grpCard = getGropedAndSortedCard(state[playId]?.cards)
            setisLoading(false);
            setcurrentScreen({
                callStarted: false,
                gameStarted: true,
                trumpSelection: false,
                winnerContainer: false
            })
            setgameState(state);
            setcurrentCards(grpCard);
        })
        socket.on('biding_done', (state) => {
            setcurrentScreen({
                callStarted: false,
                gameStarted: false,
                trumpSelection: true,
                winnerContainer: false
            })
            setgameState(state);
        })

        socket.on('declare_winner', (state) => {
            setcurrentScreen({
                callStarted: false,
                gameStarted: false,
                trumpSelection: false,
                winnerContainer: true
            })
            setgameState(state);
        })

    }, [playId]);

    useEffect(() => {
        const position = {};
        position.left = positionId(playId, 'left');
        position.right = positionId(playId, 'right');
        position.top = positionId(playId, 'top');
        position.self = positionId(playId, 'self');
        setpositionArr(position);
    }, [playId]);

    const getGropedAndSortedCard = (cards) => {
        if (!cards)
            return DEFAULT_CARD;
        return _groupBy(_sortBy(cards, 'value'), 'suit');
    }
    const SelectCard = (data) => {
        if (gameState['turn_position'] !== playId) {
            return;
        }
        if (gameState['first_card_code'] === '' || gameState['first_card_code'] === data.code.substr(1, 2)) {
            setselectedCard(data);
            return;
        }
        if (gameState['first_card_code'] === 'C' && currentCards.CLUBS?.length > 0
            || gameState['first_card_code'] === 'D' && currentCards.DIAMONDS?.length > 0
            || gameState['first_card_code'] === 'H' && currentCards.HEARTS?.length > 0
            || gameState['first_card_code'] === 'S' && currentCards.SPADES?.length > 0
        ) {
            return;
        }
        // if(false || (true &&  data.code.substr(1, 2) === gameState['trump'])){
        setselectedCard(data);
        //     return;
        // }
        // if()

    }
    const Play = () => {
        socket.emit('played_card', selectedCard, playId, gameId);
    }

    const validateHavePair = () => {
        let trumpKing = `K${gameState["trump"]}`;
        let trumpQueen = `Q${gameState["trump"]}`;
        let data = gameState[playId]?.cards.filter(data => data.code === trumpKing || data.code === trumpQueen);
        if (data && data.length === 2) {
            return true;
        }

        return false;
    }
    if (!playId) <></>

    return (
        <div style={{ justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
            <h1>Welcome to 29 Game Screen!</h1>
            {gameState && gameState[playId] &&
                <div className='outer_game_board'>
                    {currentScreen.winnerContainer ? <></> :
                        <Grid className='inner_game_board'>
                            <Grid container className='top_game_grid'>
                                <Grid item xs={12} style={{ textAlign: 'center' }}>
                                    {positionArr.top}
                                    -
                                    {gameState[positionArr.top] && gameState[positionArr.top]['id']}
                                </Grid>
                            </Grid>
                            <Grid container className='middle_game_grid' style={{ alignItems: 'center' }}>
                                <Grid item xs={2} style={{ textAlign: 'left' }}>
                                    {positionArr.left}
                                    -
                                    {gameState[positionArr.left] && gameState[positionArr.left]['id']}
                                </Grid>
                                <Grid item xs={8}>
                                    {
                                        currentScreen.callStarted && <BiddingScreen gameState={gameState} socket={socket} gameId={gameId} playId={positionArr.self}></BiddingScreen>
                                    }
                                    {
                                        currentScreen.gameStarted && <PlayGameScreen gameState={gameState} positionArr={positionArr} gameId={gameId} playId={positionArr.self} socket={socket} turnPosition={gameState['turn_position']}></PlayGameScreen>
                                    }
                                    {
                                        currentScreen.trumpSelection && <TrumpScreen socket={socket} playId={positionArr.self} gameId={gameId} turn_position={gameState['turn_position']}></TrumpScreen>
                                    }
                                </Grid>
                                <Grid item xs={2} style={{ textAlign: 'right' }}>
                                    {positionArr.right}
                                    -
                                    {gameState[positionArr.right] && gameState[positionArr.right]['id']}

                                    {(playId === 1 || playId === 3) ? <ScoreCard playId={positionArr.right} point={gameState['game_score']['2-4']}></ScoreCard> : <ScoreCard playId={positionArr.right} point={gameState['game_score']['1-3']}></ScoreCard>}
                                </Grid>
                            </Grid>
                            <Grid container className='card_game_grid'>
                                <Grid item xs={12} style={{ alignItems: 'baseline', textAlign: 'center', }}>
                                    {(playId === 1 || playId === 3) ? <ScoreCard playId={playId} point={gameState['game_score']['1-3']}></ScoreCard> : <ScoreCard playId={playId} point={gameState['game_score']['2-4']}></ScoreCard>}
                                    {currentCards.CLUBS &&
                                        <Box component={'span'} m={2}>
                                            {currentCards.CLUBS?.map(data => {
                                                return <img src={data.image} disabled width={50} height={50} className={selectedCard.code === data.code ? 'highlight' : 'not_highlight'} style={{ marginRight: -30 }} onClick={() => SelectCard(data)} ></img>
                                            })}
                                        </Box>
                                    }
                                    {currentCards.DIAMONDS &&
                                        <Box component={'span'} m={2}>
                                            {currentCards.DIAMONDS?.map(data => {
                                                return <img src={data.image} disabled width={50} height={50} className={selectedCard.code === data.code ? 'highlight' : 'not_highlight'} style={{ marginRight: -30 }} onClick={() => SelectCard(data)} ></img>
                                            })}
                                        </Box>
                                    }
                                    {currentCards.HEARTS &&
                                        <Box component={'span'} m={2}>
                                            {currentCards.HEARTS?.map(data => {
                                                return <img src={data.image} disabled width={50} height={50} className={selectedCard.code === data.code ? 'highlight' : 'not_highlight'} style={{ marginRight: -30 }} onClick={() => SelectCard(data)} ></img>
                                            })}
                                        </Box>
                                    }
                                    {currentCards.SPADES &&
                                        <Box component={'span'} m={2}>
                                            {currentCards.SPADES?.map(data => {
                                                return <img src={data.image} disabled width={50} height={50} className={selectedCard.code === data.code ? 'highlight' : 'not_highlight'} style={{ marginRight: -30 }} onClick={() => SelectCard(data)} ></img>
                                            })}
                                        </Box>

                                    }
                                </Grid>
                            </Grid>
                            <Grid container className='bottom_game_grid'>
                                <Grid item xs={12} style={{ alignItems: 'baseline', textAlign: 'center', }}>
                                    <div>{positionArr.self}-{gameState[positionArr.self]['id']}</div>
                                    <div>
                                        {(playId === 1 || playId === 3) ? gameState['points']['1-3'] : gameState['points']['2-4']}
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    }
                </div>
            }
            <div style={{ justifyContent: 'center', alignItems: 'center' }}>
                <button onClick={Play} className={gameState['turn_position'] === playId ? 'highlightBorder' : ''} disabled={gameState['turn_position'] !== playId || selectedCard.length === 0}>move</button>
                {
                    validateHavePair() && <button>show pair</button>
                }
            </div>
            <div>
                {
                    JSON.stringify(gameState)
                }
            </div>
        </div>
    )
};

export default GameScreen;


