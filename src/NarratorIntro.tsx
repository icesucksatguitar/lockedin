import { useEffect, useRef, useState } from 'react'
import voicelineUrl from './assets/first_voiceline.wav'
import './NarratorIntro.css'

type NarratorIntroProps = {
  onComplete: () => void
}

type Subtitle = {
  start: number
  end: number
  text: string
}

// Actual transcript
const TRANSCRIPT: Subtitle[] = [
  { start: 0.0, end: 5.5, text: "In the Beginning, there was equilibrium" },
  { start: 5.6, end: 11.5, text: "An unseen symmetry sustaining everything that persisted" },
  { start: 11.6, end: 15.5, text: "Perfect, Unbroken" },
  { start: 15.6, end: 20.0, text: "Until..." }
]

export default function NarratorIntro({ onComplete }: NarratorIntroProps) {
  const [fading, setFading] = useState(false)
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1)
  const [displayedText, setDisplayedText] = useState('')

  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const completedRef = useRef(false)

  // Audio & Timing Logic
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Attempt to play as soon as it mounts
    audio.play().catch((err) => {
      console.error("Audio autoplay blocked by browser:", err)
      // If blocked, we might just have to skip or wait for interaction,
      // but since the user clicked to skip the loading screen, it should play.
    })

    const handleTimeUpdate = () => {
      const time = audio.currentTime
      if (time >= 17 && !fading) {
        setFading(true)
      }

      // Find which subtitle should be playing right now
      const currentSubIndex = TRANSCRIPT.findIndex(sub => time >= sub.start && time <= sub.end)
      setActiveSubtitleIndex(currentSubIndex)
    }

    const handleEnded = () => {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [fading, onComplete])

  // Subtitle Typing Effect Logic
  useEffect(() => {
    if (activeSubtitleIndex === -1) {
      setDisplayedText('')
      return
    }

    const targetText = TRANSCRIPT[activeSubtitleIndex].text
    let currentIndex = 0
    setDisplayedText('')

    const typingInterval = setInterval(() => {
      currentIndex++
      setDisplayedText(targetText.slice(0, currentIndex))
      if (currentIndex >= targetText.length) {
        clearInterval(typingInterval)
      }
    }, 80) // 80ms per character for slow pacing

    return () => clearInterval(typingInterval)
  }, [activeSubtitleIndex])

  // Canvas Galaxy Shader Logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    let animationId: number

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Generate static stars with random twinkle speeds
    const stars = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005
    }))

    let time = 0
    const render = () => {
      time += 0.005

      // Base dark color
      ctx.fillStyle = '#010003'
      ctx.fillRect(0, 0, w, h)

      // Draw faint galaxy clouds
      const cx = w / 2
      const cy = h / 2

      const drawCloud = (color: string, r: number, ox: number, oy: number) => {
        const grad = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r)
        grad.addColorStop(0, color)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      ctx.globalCompositeOperation = 'screen'
      
      // Purple cloud orbiting slowly
      drawCloud('rgba(30, 10, 60, 0.4)', w * 0.7, Math.sin(time) * w * 0.2, Math.cos(time) * h * 0.2)
      // Blue cloud
      drawCloud('rgba(10, 20, 70, 0.3)', w * 0.8, Math.sin(time * 0.8 + 2) * w * 0.3, Math.cos(time * 0.9 + 1) * h * 0.2)
      // Pinkish center core
      drawCloud('rgba(50, 5, 40, 0.2)', w * 0.5, Math.sin(time * 1.2) * w * 0.1, Math.cos(time * 1.1) * h * 0.1)

      // Render stars
      ctx.fillStyle = '#ffffff'
      for (const s of stars) {
        s.alpha += s.speed
        const currentAlpha = Math.abs(Math.sin(s.alpha)) * 0.7 + 0.1
        ctx.globalAlpha = currentAlpha
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      animationId = window.requestAnimationFrame(render)
    }

    animationId = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={`narrator-scene ${fading ? 'narrator-scene--fade-out' : ''}`}>
      <canvas ref={canvasRef} className="narrator-scene__canvas" />
      <audio ref={audioRef} src={voicelineUrl} />
      
      <div className="narrator-scene__subtitles">
        {activeSubtitleIndex !== -1 && (
          <p className="narrator-scene__subtitle-text">
            {displayedText}
          </p>
        )}
      </div>

      <button className="narrator-scene__skip" onClick={onComplete}>
        skip transmission
      </button>
    </div>
  )
}
