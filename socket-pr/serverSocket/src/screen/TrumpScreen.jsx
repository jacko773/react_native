import { Button, Grid } from '@material-ui/core';
import React, { useState } from 'react';

const TrumpScreen = ({ socket, playId, gameId , turn_position }) => {
    const [selectedCard, setselectedCard] = useState();
    let disable = turn_position !== playId;
    const SelectCard = (cardCode) => {
        setselectedCard(cardCode);
    }

    const setTrump = () => {
        socket.emit('set_trump', selectedCard, gameId);
    }
    return (
        <>
            <Grid container justifyContent='center' alignItems='center'>
                <Grid item xs={2}>
                    <img src={disable ?'/images/back.png' :'/images/JOKER.png'} width={50} height={50} className={selectedCard === 'JOKER' ? 'highlight' : 'not_highlight'} onClick={() => SelectCard('JOKER')} ></img>
                </Grid>
                <Grid item xs={2}>
                    <img src={disable ?'/images/back.png' :'/images/C.png'} width={50} height={50} className={selectedCard === 'C' ? 'highlight' : 'not_highlight'} onClick={() => SelectCard('C')} ></img>
                </Grid>
                <Grid item xs={2}>
                    <img src={disable ?'/images/back.png' :'/images/D.png'} width={50} height={50} className={selectedCard === 'D' ? 'highlight' : 'not_highlight'} onClick={() => SelectCard('D')} ></img>
                </Grid>
                <Grid item xs={2}>
                    <img src={disable ?'/images/back.png' :'/images/H.png'} width={50} height={50} className={selectedCard === 'H' ? 'highlight' : 'not_highlight'} onClick={() => SelectCard('H')} ></img>
                </Grid>
                <Grid item xs={2}>
                    <img src={disable ?'/images/back.png' :'/images/S.png'} width={50} height={50} className={selectedCard === 'S' ? 'highlight' : 'not_highlight'} onClick={() => SelectCard('S')} ></img>
                </Grid>
                <Grid item xs={2}>
                    <img src={disable ?'/images/back.png' :'/images/JOKER.png'} width={50} height={50} className={selectedCard === 'JOKER' ? 'highlight' : 'not_highlight'} onClick={() => SelectCard('JOKER')} ></img>
                </Grid>
                <Grid>
                    <Button disabled={!selectedCard || turn_position !== playId} onClick={setTrump}>SET</Button>
                </Grid>
            </Grid>

        </>
    )
};

export default TrumpScreen;
