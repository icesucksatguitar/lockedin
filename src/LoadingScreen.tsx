import { useEffect, useState } from 'react'

const LOADING_DURATION_MS = 7000

const loaderStats = [
  { label: 'MASS', value: '1.2e38' },
  { label: 'VELOCITY', value: '-0.89c' },
  { label: 'ENTROPY', value: '4.2e15' },
  { label: 'DENSITY', value: '2.8e12' },
  { label: 'FIELD', value: '6.7e8' },
]

const planetLines = [
  'ALPHA // COORDINATES: 18.204N / 41.902W // TEMP: -128C // DENSITY: 2.74 // ENTROPY: 0.19',
  'OMEGA // COORDINATES: 07.118S / 132.540E // TEMP: 61C // DENSITY: 7.03 // ENTROPY: 0.42',
]

const statusText = planetLines.join('\n')

type LoadingScreenProps = {
  onSkip: () => void
}

function LoadingScreen({ onSkip }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    let animationFrame = 0
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const nextProgress = Math.min((elapsed / LOADING_DURATION_MS) * 100, 100)

      setProgress(nextProgress)

      if (nextProgress < 100) {
        animationFrame = window.requestAnimationFrame(step)
      }
    }

    animationFrame = window.requestAnimationFrame(step)

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  useEffect(() => {
    let index = 0
    const typing = window.setInterval(() => {
      index += 1
      setTypedText(statusText.slice(0, index))

      if (index >= statusText.length) {
        window.clearInterval(typing)
      }
    }, 35)

    return () => window.clearInterval(typing)
  }, [])

  useEffect(() => {
    const handleAdvance = () => {
      onSkip()
    }

    window.addEventListener('keydown', handleAdvance)
    window.addEventListener('mousedown', handleAdvance)
    window.addEventListener('touchstart', handleAdvance)

    return () => {
      window.removeEventListener('keydown', handleAdvance)
      window.removeEventListener('mousedown', handleAdvance)
      window.removeEventListener('touchstart', handleAdvance)
    }
  }, [onSkip])

  return (
    <main className="loader-screen">
      <section className="loader-panel" aria-label="Loading screen">
        <div className="loader-stats" aria-hidden="true">
          {loaderStats.map((stat) => (
            <div key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>

        <div className="planet-text" aria-live="polite">
          <p>{typedText}</p>
          <span className="typing-cursor" aria-hidden="true" />
        </div>

        <div className="progress-block">
          <div
            className="loading-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <span className="loading-bar__fill" style={{ width: `${progress}%` }} />
          </div>

          <p className="progress-label">{Math.round(progress)}%</p>
        </div>

        <button type="button" className="skip-button" onClick={onSkip}>
          press any button to skip
        </button>
      </section>
    </main>
  )
}

export default LoadingScreen
