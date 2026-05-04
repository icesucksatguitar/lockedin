import { useCallback } from 'react'
import './AboutPage.css'

type AboutPageProps = {
  onClose: () => void
}

export default function AboutPage({ onClose }: AboutPageProps) {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  return (
    <div className="about-overlay" onClick={handleBackdropClick}>
      <div className="about-container">
        <button className="about-close" onClick={onClose} aria-label="Close about page">
          <span>CLOSE</span>
          <span className="about-close-icon">[×]</span>
        </button>

        <div className="about-content">
          <div className="about-header">
            <h1 className="about-title">VERIDIAN ARCHIVE</h1>
            <p className="about-subtitle">A Window into Two Destinies</p>
          </div>

          <div className="about-grid">
            <div className="about-section about-section--lead">
              <h2 className="about-section-heading">THE OBSERVATORY</h2>
              <p className="about-text">
                VERIDIAN ARCHIVE is not just a data interface; it is a temporal window. It was built to observe the divergence of our planet into two distinct possibilities. Through this lens, we witness the consequence of every choice we make—and the gravity of those we ignore.
              </p>
            </div>

            <div className="about-section">
              <h2 className="about-section-heading">ALPHA // THE RECLAMATION</h2>
              <p className="about-text">
                To your left is the Alpha Timeline. It is the story of what happens when the directives are followed. In this world, the warnings were met with action, the scars of industry were healed, and the planet was given the space to breathe again. It represents our hope, and our goal.
              </p>
            </div>

            <div className="about-directives">
              <h2 className="about-section-heading">OMEGA // THE ANOMALY</h2>
              <p className="about-text">
                To your right is the Omega Timeline. It is a cautionary record of the path we are currently on. In this world, the anomalies were allowed to fester until they became irreversible. The red pulses you see are the dying heartbeats of a world that lost its battle with time. 
              </p>
              <br />
              <p className="about-text">
                Life has vanished from Omega. It remains as a silent, grey monument to the cost of inaction.
              </p>
            </div>

            <div className="about-section about-section--full">
              <h2 className="about-section-heading">THE MISSION</h2>
              <p className="about-text">
                Our mission is to ensure that the Omega timeline remains a simulation, and that Alpha becomes our reality. The directives are the bridge. They are the last remaining tools we have to lock in a future where Earth remains vibrant, alive, and whole.
              </p>
            </div>
          </div>

          <div className="about-footer">
            <button className="about-experience-btn" onClick={onClose}>
              <span>EXPLORE EXPERIENCE</span>
              <span className="about-btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
