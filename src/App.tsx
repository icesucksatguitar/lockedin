import { useCallback, useEffect, useState, useRef } from 'react'
import EarthOverviewPage from './EarthOverviewPage'
import LoadingScreen from './LoadingScreen'
import NarratorIntro from './NarratorIntro'
import Reactor from './Reactor'
import YearCounter from './YearCounter'
import './App.css'

export type CinematicPhase = 'pre-anomaly' | 'anomaly' | 'directives' | 'completed'

function App() {
  const [scene, setScene] = useState<'loader' | 'intro' | 'overview' | 'yearcounter' | 'reactor'>('loader')
  const [cinematicPhase, setCinematicPhase] = useState<CinematicPhase>('pre-anomaly')
  const cursorRef = useRef<HTMLSpanElement>(null)

  const handleAdvance = useCallback(() => {
    setScene('intro')
  }, [])

  const handleIntroComplete = useCallback(() => {
    setScene('overview')
    setCinematicPhase('completed')
  }, [])

  const handleBridgeActivate = useCallback(() => {
    setScene('yearcounter')
  }, [])

  const handleYearSkip = useCallback(() => {
    setScene('reactor')
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${event.clientX}px`
        cursorRef.current.style.top = `${event.clientY}px`
      }
    }

    const handlePointerDown = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.add('custom-cursor--pressed')
      }
    }

    const handlePointerUp = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove('custom-cursor--pressed')
      }
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    window.addEventListener('mousedown', handlePointerDown, { passive: true })
    window.addEventListener('mouseup', handlePointerUp, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('mouseup', handlePointerUp)
    }
  }, [])

  return (
    <>
      <span
        ref={cursorRef}
        className="custom-cursor"
        aria-hidden="true"
      />
      {scene === 'loader'      && <LoadingScreen onSkip={handleAdvance} />}
      {scene === 'intro'       && <NarratorIntro onComplete={handleIntroComplete} onPhaseChange={setCinematicPhase} />}
      {(scene === 'intro' || scene === 'overview')    && <EarthOverviewPage onBridgeActivate={handleBridgeActivate} showControls={scene === 'overview'} cinematicPhase={cinematicPhase} />}
      {scene === 'yearcounter' && <YearCounter onSkip={handleYearSkip} />}
      {scene === 'reactor'     && <Reactor />}
    </>
  )
}

export default App
