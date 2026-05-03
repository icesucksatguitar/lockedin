import { useEffect, useState, useRef } from 'react'
import cloveImg from './assets/images/clove.png'

const earthModelUrl = new URL('./assets/3D model/earth.glb', import.meta.url).href

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
  const assetsLoadedRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      fetch(earthModelUrl, { signal: controller.signal }).then(res => res.blob()),
      new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = cloveImg
      })
    ]).then(() => {
      assetsLoadedRef.current = true
    }).catch(err => {
      if (err.name !== 'AbortError') {
        console.error("Failed to preload assets", err)
        assetsLoadedRef.current = true
      }
    })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    let animationFrame = 0
    let currentProgress = 0
    let lastTime = performance.now()

    const step = (now: number) => {
      const delta = now - lastTime
      lastTime = now

      let speed = 100 / LOADING_DURATION_MS

      if (!assetsLoadedRef.current && currentProgress >= 70) {
        const distanceTo75 = 75 - currentProgress
        if (distanceTo75 > 0) {
          speed = speed * (distanceTo75 / 5) * 0.1
        } else {
          speed = 0
        }
      } else if (assetsLoadedRef.current && currentProgress >= 70) {
        speed = speed * 1.5
      }

      currentProgress += speed * delta
      if (currentProgress >= 100) {
        currentProgress = 100
      }

      setProgress(currentProgress)

      if (currentProgress < 100) {
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
