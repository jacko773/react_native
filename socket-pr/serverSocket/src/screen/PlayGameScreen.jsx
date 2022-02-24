import { Grid } from "@material-ui/core";
import OpenTrump from "./OpenTrump";

const PlayGameScreen = ({ gameState, positionArr, playId, socket, gameId, turnPosition }) => {
    const openTrump = () => {
        let firstCardCode = gameState.first_card_code;
        if (!firstCardCode) return;
        if (turnPosition != playId) return;
        if (!!gameState[playId]?.cards) {
            let data = gameState[playId]?.cards.filter(data => data.code.substr(1, 2) === firstCardCode);
            if (data.length > 0) return;
            socket.emit('open_trump', gameId);
        }
    }
    return (
        <Grid container>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
                <img src={gameState['played_card'][positionArr.top].image} width={50} height={50}  ></img>
            </Grid>
            <Grid item xs={4} style={{ textAlign: 'center' }}>
                <img src={gameState['played_card'][positionArr.left].image} width={50} height={50}  ></img>
            </Grid>
            <Grid item xs={4} style={{ textAlign: 'center' }}>
                <OpenTrump onOpenTrump={openTrump} trumpOpen={gameState.trumpOpen} trumpCode={gameState.trump}></OpenTrump>
            </Grid>
            <Grid item xs={4} style={{ textAlign: 'center' }}>
                <img src={gameState['played_card'][positionArr.right].image} width={50} height={50}  ></img>
            </Grid>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
                <img src={gameState['played_card'][positionArr.self].image} width={50} height={50}  ></img>
            </Grid>
        </Grid>
    )
};

export default PlayGameScreen;
