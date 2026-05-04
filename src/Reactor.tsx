import { useState, useEffect } from 'react'

import chamberImg from './assets/images/chamber.png'
import sageImg from './assets/images/sage.png'
import brimstoneImg from './assets/images/brimstone.png'

const PHASES = [
  { id: 'text', type: 'text', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', duration: 4000 },
  { id: 'chamber', type: 'image', content: chamberImg, duration: 5000 },
  { id: 'sage', type: 'image', content: sageImg, duration: 5000 },
  { id: 'brimstone', type: 'image', content: brimstoneImg, duration: 5000 },
  { id: 'credits', type: 'credits', content: null, duration: 10000 },
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
          <p className="reactor-lorem">Everything fell — Chamber, Sage, and Brimstone couldn’t hold the world together.
            The protector failed, nature faded, and the preserver watched it all turn to ruin.</p>
        ) : current.type === 'credits' ? (
          <div className="reactor-credits" style={{ textAlign: 'center', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem', zIndex: 10, fontFamily: 'monospace' }}>
            <h2 style={{ fontSize: '3rem', letterSpacing: '0.15em', fontWeight: '300', textTransform: 'uppercase' }}>Thank You</h2>
            <div style={{ fontSize: '1.2rem', lineHeight: '2.5', letterSpacing: '0.05em', color: '#ccc' }}>
              <p>Programmer and Lead Director: <strong style={{ color: '#fff' }}>Yash Thakur</strong></p>
              <p>Voicelines, Music and Art Director: <strong style={{ color: '#fff' }}>Priyansh Kuniyal</strong></p>
            </div>
          </div>
        ) : (
          <img src={current.content as string} className="reactor-agent-img" alt={current.id} />
        )}
      </div>
    </main>
  )
}

export default Reactor
