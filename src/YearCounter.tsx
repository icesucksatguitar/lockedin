import { useEffect, useRef, useState } from 'react'

const START_YEAR = 2015
const END_YEAR = 3000
const FADE_DURATION_MS = 3000
const COUNT_DURATION_MS = 8000

type YearCounterProps = {
  onSkip: () => void
}


function easeIn(t: number): number {
  return t * t * t
}

function YearCounter({ onSkip }: YearCounterProps) {
  const [fadeReady, setFadeReady] = useState(false)
  const [year, setYear] = useState(START_YEAR)
  const [counting, setCounting] = useState(false)
  const countFrame = useRef(0)


  useEffect(() => {
    const id = window.setTimeout(() => setFadeReady(true), 30)
    return () => window.clearTimeout(id)
  }, [])


  useEffect(() => {
    const id = window.setTimeout(() => setCounting(true), FADE_DURATION_MS)
    return () => window.clearTimeout(id)
  }, [])


  useEffect(() => {
    if (!counting) return

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / COUNT_DURATION_MS, 1)
      const easedT = easeIn(t)
      const currentYear = Math.round(START_YEAR + easedT * (END_YEAR - START_YEAR))
      setYear(currentYear)

      if (t < 1) {
        countFrame.current = window.requestAnimationFrame(tick)
      } else {
        setYear(END_YEAR)
      }
    }

    countFrame.current = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(countFrame.current)
  }, [counting])

  return (
    <main
      className="year-counter-screen"
      style={{ opacity: fadeReady ? 1 : 0 }}
      aria-label="Year counter"
    >
      <div className="year-counter-content">

        <div className="year-counter-display" aria-live="polite" aria-atomic="true">
          {year}
        </div>

        <p className="year-counter-sublabel">TEMPORAL COORDINATE LOCK</p>
      </div>

      <button type="button" className="skip-button" onClick={onSkip}>
        continue
      </button>
    </main>
  )
}

export default YearCounter
