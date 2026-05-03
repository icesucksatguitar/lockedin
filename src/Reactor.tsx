import { useState } from 'react'

// Placeholder voiceline — replace with real lines later
const VOICELINES: { speaker: string; text: string }[] = [
  // { speaker: 'TARS', text: 'Welcome to the Fractured Reactor interface.' },
]

type ReactorProps = {
  onSkip?: () => void
}

function Reactor({ onSkip }: ReactorProps) {
  const [activeLine] = useState(0)

  const currentLine = VOICELINES[activeLine] ?? null

  return (
    <main className="reactor-screen">
      {/* Starfield */}
      <div className="starfield" aria-hidden="true">
        {Array.from({ length: 200 }).map((_, i) => {
          const left = (i * 13.7 + (i % 7) * 3.1) % 100
          const top  = (i * 27.3 + (i % 5) * 5.9) % 100
          const size = i % 9 === 0 ? 2.2 : i % 4 === 0 ? 1.4 : 0.8
          return (
            <span
              key={i}
              className="star"
              style={{ left: `${left}%`, top: `${top}%`, width: `${size}px`, height: `${size}px`, animationDelay: `${(i % 18) * 0.14}s` }}
            />
          )
        })}
      </div>

      {/* Main content area — placeholder for future elements */}
      <div className="reactor-content">
        <p className="reactor-title">FRACTURED REACTOR</p>
        <p className="reactor-subtitle">SELECT AN AGENT TO VIEW DETAILS</p>
      </div>

      {/* Subtitle / voiceline bar */}
      <div className="voiceline-bar" aria-live="polite">
        {currentLine ? (
          <>
            <span className="voiceline-speaker">{currentLine.speaker}:</span>
            <p className="voiceline-text">{currentLine.text}</p>
          </>
        ) : (
          <>
            {/* Empty placeholder — voicelines will populate here */}
            <span className="voiceline-speaker voiceline-speaker--empty">&nbsp;</span>
            <p className="voiceline-text voiceline-text--empty">&nbsp;</p>
          </>
        )}
      </div>

      {onSkip && (
        <button type="button" className="skip-button" onClick={onSkip}>
          press any button to skip
        </button>
      )}
    </main>
  )
}

export default Reactor
