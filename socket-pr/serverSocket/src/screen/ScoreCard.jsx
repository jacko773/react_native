import React from 'react'

const ScoreCard = ({ playId, point }) => {
    console.log('playId' + JSON.stringify(playId));
    console.log('point' + JSON.stringify(point));
    return (
        <>
            {
                (playId === 1 || playId === 3) &&
                <>
                    abc
                    {point === -6 && <img src={'/scoreCard/Player-1-3/-6.PNG'} width={50} height={50}></img>}
                    {point === -5 && <img src={'/scoreCard/Player-1-3/-5.PNG'} width={50} height={50}></img>}
                    {point === -4 && <img src={'/scoreCard/Player-1-3/-4.PNG'} width={50} height={50}></img>}
                    {point === -3 && <img src={'/scoreCard/Player-1-3/-3.PNG'} width={50} height={50}></img>}
                    {point === -2 && <img src={'/scoreCard/Player-1-3/-2.PNG'} width={50} height={50}></img>}
                    {point === -1 && <img src={'/scoreCard/Player-1-3/-1.PNG'} width={50} height={50}></img>}
                    {point === 0 && <img src={'/scoreCard/Player-1-3/0.PNG'} width={50} height={50}></img>}
                    {point === 1 && <img src={'/scoreCard/Player-1-3/+1.PNG'} width={50} height={50}></img>}
                    {point === 2 && <img src={'/scoreCard/Player-1-3/+2.PNG'} width={50} height={50}></img>}
                    {point === 3 && <img src={'/scoreCard/Player-1-3/+3.PNG'} width={50} height={50}></img>}
                    {point === 4 && <img src={'/scoreCard/Player-1-3/+4.PNG'} width={50} height={50}></img>}
                    {point === 5 && <img src={'/scoreCard/Player-1-3/+5.PNG'} width={50} height={50}></img>}
                    {point === 6 && <img src={'/scoreCard/Player-1-3/+6.PNG'} width={50} height={50}></img>}
                </>
            }
            {
                (playId === 2 || playId === 4) &&
                <>
                    2-4
                    {point === -6 && <img src={'/scoreCard/Player-2-4/-6.PNG'} width={50} height={50}></img>}
                    {point === -5 && <img src={'/scoreCard/Player-2-4/-5.PNG'} width={50} height={50}></img>}
                    {point === -4 && <img src={'/scoreCard/Player-2-4/-4.PNG'} width={50} height={50}></img>}
                    {point === -3 && <img src={'/scoreCard/Player-2-4/-3.PNG'} width={50} height={50}></img>}
                    {point === -2 && <img src={'/scoreCard/Player-2-4/-2.PNG'} width={50} height={50}></img>}
                    {point === -1 && <img src={'/scoreCard/Player-2-4/-1.PNG'} width={50} height={50}></img>}
                    {point === 0 && <img src={'/scoreCard/Player-2-4/0.PNG'} width={50} height={50}></img>}
                    {point === 1 && <img src={'/scoreCard/Player-2-4/+1.PNG'} width={50} height={50}></img>}
                    {point === 2 && <img src={'/scoreCard/Player-2-4/+2.PNG'} width={50} height={50}></img>}
                    {point === 3 && <img src={'/scoreCard/Player-2-4/+3.PNG'} width={50} height={50}></img>}
                    {point === 4 && <img src={'/scoreCard/Player-2-4/+4.PNG'} width={50} height={50}></img>}
                    {point === 5 && <img src={'/scoreCard/Player-2-4/+5.PNG'} width={50} height={50}></img>}
                    {point === 6 && <img src={'/scoreCard/Player-2-4/+6.PNG'} width={50} height={50}></img>}
                </>
            }
        </>
    )
}

export default ScoreCard