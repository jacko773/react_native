import React from 'react'

const WinningScreen = (gameState, playId) => {
    if (gameState['winner'] === '1-3' && (playId === 1 || playId === 3)) return <>you winned</>
    if (gameState['winner'] === '2-4' && (playId === 2 || playId === 4)) return <>you winned</>
    if (gameState['looser'] === '1-3' && (playId === 1 || playId === 3)) return <>you loosed</>
    if (gameState['looser'] === '1-3' && (playId === 1 || playId === 3)) return <>you loosed</>
}

export default WinningScreen