import React, { useState, useEffect } from 'react'

import chamberImg from './assets/images/chamber.png'
import sageImg from './assets/images/sage.png'
import brimstoneImg from './assets/images/brimstone.png'

const PHASES = [
  { id: 'text', type: 'text', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', duration: 4000 },
  { id: 'chamber', type: 'image', content: chamberImg, duration: 5000 },
  { id: 'sage', type: 'image', content: sageImg, duration: 5000 },
  { id: 'brimstone', type: 'image', content: brimstoneImg, duration: 5000 },
]

function Reactor() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    const currentPhase = PHASES[phaseIndex]
    if (!currentPhase) return

    const timer = setTimeout(() => {
      if (phaseIndex < PHASES.length - 1) {
        setIsFading(true)

        setTimeout(() => {
          setPhaseIndex(prev => prev + 1)
          setIsFading(false)
        }, 500)
      }
    }, currentPhase.duration)

    return () => clearTimeout(timer)
  }, [phaseIndex])

  const current = PHASES[phaseIndex]

  return (
    <main className="reactor-screen">
      <div className="reactor-vignette" aria-hidden="true" />
      <div className={`reactor-container ${isFading ? 'reactor-container--fade-out' : 'reactor-container--fade-in'}`} key={current.id}>
        {current.type === 'text' ? (
          <p className="reactor-lorem">{current.content}</p>
        ) : (
          <img src={current.content as string} className="reactor-agent-img" alt={current.id} />
        )}
      </div>
    </main>
  )
}

export default Reactor
