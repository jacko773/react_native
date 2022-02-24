import { Grid } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
const BiddingScreen = ({ gameState, socket, gameId, playId }) => {
    const [bidValue, setbidValue] = useState(17);
    const gameStart = () => {
        socket.emit('bid_done', gameId)
    }
    const handleChanges = (e) => {
        const { value } = e.target;
        setbidValue(value);
    }
    const callBid = () => {
        socket.emit('update_bid', true, playId, bidValue, gameId);
    }

    const passBid = () => {
        socket.emit('update_bid', false, playId, 'PASS', gameId);
    }

    useEffect(() => {
        setbidValue(parseInt(gameState['bid_value']) + 1);
    }, [gameState['bid_value']]);

    return (
        <Grid style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Grid>
                <select onChange={handleChanges} value={bidValue} disabled={playId !== gameState['turn_position']}>
                    <option value={17} disabled={gameState['bid_value'] >= 17}>17</option>
                    <option value={18} disabled={gameState['bid_value'] >= 18}>18</option>
                    <option value={19} disabled={gameState['bid_value'] >= 19}>19</option>
                    <option value={20} disabled={gameState['bid_value'] >= 20}>20</option>
                    <option value={21} disabled={gameState['bid_value'] >= 21}>21</option>
                    <option value={22} disabled={gameState['bid_value'] >= 22}>22</option>
                    <option value={23} disabled={gameState['bid_value'] >= 23}>23</option>
                    <option value={24} disabled={gameState['bid_value'] >= 24}>24</option>
                    <option value={25} disabled={gameState['bid_value'] >= 25}>25</option>
                    <option value={26} disabled={gameState['bid_value'] >= 26}>26</option>
                    <option value={27} disabled={gameState['bid_value'] >= 27}>27</option>
                    <option value={28} disabled={gameState['bid_value'] >= 28}>28</option>
                    <option value={29} disabled={gameState['bid_value'] >= 29}>29</option>
                </select>

                <button onClick={callBid} disabled={playId !== gameState['turn_position']}>call</button>
                <button onClick={passBid} disabled={playId !== gameState['turn_position']}>pass</button>
            </Grid>
        </Grid>
    )
};

export default BiddingScreen;
