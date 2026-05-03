import { useCallback, useEffect, useState } from 'react'
import EarthOverviewPage from './EarthOverviewPage'
import LoadingScreen from './LoadingScreen'
import Reactor from './Reactor'
import YearCounter from './YearCounter'
import './App.css'

type CursorState = {
  x: number
  y: number
  pressed: boolean
}

function App() {
  const [scene, setScene] = useState<'loader' | 'overview' | 'yearcounter' | 'reactor'>('loader')
  const [cursor, setCursor] = useState<CursorState>({ x: 0, y: 0, pressed: false })

  const handleAdvance = useCallback(() => {
    setScene('overview')
  }, [])

  const handleBridgeActivate = useCallback(() => {
    setScene('yearcounter')
  }, [])

  const handleYearSkip = useCallback(() => {
    setScene('reactor')
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      setCursor((current) => ({
        ...current,
        x: event.clientX,
        y: event.clientY,
      }))
    }

    const handlePointerDown = (event: MouseEvent) => {
      setCursor((current) => ({
        ...current,
        x: event.clientX,
        y: event.clientY,
        pressed: true,
      }))
    }

    const handlePointerUp = (event: MouseEvent) => {
      setCursor((current) => ({
        ...current,
        x: event.clientX,
        y: event.clientY,
        pressed: false,
      }))
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('mouseup', handlePointerUp)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('mouseup', handlePointerUp)
    }
  }, [])

  return (
    <>
      <span
        className={`custom-cursor ${cursor.pressed ? 'custom-cursor--pressed' : ''}`}
        style={{ left: cursor.x, top: cursor.y }}
        aria-hidden="true"
      />
      {scene === 'loader'      && <LoadingScreen onSkip={handleAdvance} />}
      {scene === 'overview'    && <EarthOverviewPage onBridgeActivate={handleBridgeActivate} />}
      {scene === 'yearcounter' && <YearCounter onSkip={handleYearSkip} />}
      {scene === 'reactor'     && <Reactor />}
    </>
  )
}

export default App
