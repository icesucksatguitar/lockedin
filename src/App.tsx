import { useCallback, useEffect, useState } from 'react'
import EarthOverviewPage from './EarthOverviewPage'
import LoadingScreen from './LoadingScreen'
import './App.css'

type CursorState = {
  x: number
  y: number
  pressed: boolean
}

function App() {
  const [scene, setScene] = useState<'loader' | 'overview'>('loader')
  const [cursor, setCursor] = useState<CursorState>({ x: 0, y: 0, pressed: false })

  const handleAdvance = useCallback(() => {
    setScene('overview')
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
      {scene === 'overview' ? <EarthOverviewPage /> : <LoadingScreen onSkip={handleAdvance} />}
    </>
  )
}

export default App
