import React from 'react'

const OpenTrump = ({ trumpOpen, trumpCode, onOpenTrump }) => {
    if (!trumpOpen) return <><img src={'/images/back.png'} width={50} height={50} onClick={onOpenTrump} /></>
    return (
        <>
            {trumpCode === 'JOKER' && <img src={'/images/JOKER.png'} width={50} height={50} />}
            {trumpCode === 'C' && <img src={'/images/C.png'} width={50} height={50} />}
            {trumpCode === 'D' && <img src={'/images/D.png'} width={50} height={50} />}
            {trumpCode === 'H' && <img src={'/images/H.png'} width={50} height={50} />}
            {trumpCode === 'S' && <img src={'/images/S.png'} width={50} height={50} />}
        </>
    )
}

export default OpenTrump