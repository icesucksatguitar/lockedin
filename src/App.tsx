import { useCallback, useEffect, useState, useRef } from 'react'
import EarthOverviewPage from './EarthOverviewPage'
import LoadingScreen from './LoadingScreen'
import NarratorIntro from './NarratorIntro'
import Reactor from './Reactor'
import YearCounter from './YearCounter'
import AboutPage from './AboutPage'
import backgroundAudio from './assets/background-audio/background_audio.mp3'
import './App.css'

export type CinematicPhase = 'pre-anomaly' | 'anomaly' | 'directives' | 'completed'

function App() {
  const [scene, setScene] = useState<'loader' | 'intro' | 'overview' | 'yearcounter' | 'reactor'>('loader')
  const [cinematicPhase, setCinematicPhase] = useState<CinematicPhase>('pre-anomaly')
  const [showAbout, setShowAbout] = useState(false)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const bgAudioRef = useRef<HTMLAudioElement>(null)

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
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = 0.6
    }

    const tryPlayAudio = () => {
      if (bgAudioRef.current && bgAudioRef.current.paused) {
        bgAudioRef.current.play().catch(console.error)
      }
    }

    window.addEventListener('click', tryPlayAudio, { once: true })
    window.addEventListener('keydown', tryPlayAudio, { once: true })
    window.addEventListener('touchstart', tryPlayAudio, { once: true })

    return () => {
      window.removeEventListener('click', tryPlayAudio)
      window.removeEventListener('keydown', tryPlayAudio)
      window.removeEventListener('touchstart', tryPlayAudio)
    }
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
      <audio
        ref={bgAudioRef}
        src={backgroundAudio}
        autoPlay
        loop
      />
      <span
        ref={cursorRef}
        className="custom-cursor"
        aria-hidden="true"
      />
      {scene === 'loader'      && <LoadingScreen onSkip={handleAdvance} />}
      {scene === 'intro'       && <NarratorIntro onComplete={handleIntroComplete} onPhaseChange={setCinematicPhase} />}
      {(scene === 'intro' || scene === 'overview')    && <EarthOverviewPage onBridgeActivate={handleBridgeActivate} showControls={scene === 'overview'} cinematicPhase={cinematicPhase} onAbout={() => setShowAbout(true)} />}
      {scene === 'yearcounter' && <YearCounter onSkip={handleYearSkip} />}
      {scene === 'reactor'     && <Reactor />}
      {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
    </>
  )
}

export default App
