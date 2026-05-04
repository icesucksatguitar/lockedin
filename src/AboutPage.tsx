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
            <h1 className="about-title">LOCKEDIN</h1>
            <p className="about-subtitle">Advanced Climate Modeling and Real-Time Environmental Analytics</p>
          </div>

          <div className="about-grid">
            <div className="about-section about-section--lead">
              <h2 className="about-section-heading">PROJECT SCOPE</h2>
              <p className="about-text">
                LOCKEDIN is an open-source, high-fidelity climate visualization engine designed to aggregate and synthesize multi-scalar environmental data. By transforming raw satellite imagery and ground-sensor telemetry into actionable intelligence, we aim to demystify complex atmospheric dynamics and provide researchers, policymakers, and the public with a transparent, verifiable dashboard for planetary health.
              </p>
            </div>

            <div className="about-section">
              <h2 className="about-section-heading">TECHNICAL ARCHITECTURE</h2>
              <p className="about-text">
                Built using a specialized stack of React, Three.js, and WebGL, our engine renders real-time volumetric datasets with minimal latency. We utilize custom shaders to map variables—such as CO2 concentrations, thermal anomalies, and deforestation rates—directly onto a 3D Earth model, allowing for deep spatial correlation analysis.
              </p>
            </div>

            <div className="about-directives">
              <h2 className="about-section-heading">CORE DATA INTEGRATIONS</h2>

              <div className="directive-item">
                <h3 className="directive-heading">ATMOSPHERIC MONITORING</h3>
                <p className="directive-text">
                  Integration with NASA's Earthdata and Copernicus Climate Change Service to visualize global greenhouse gas density, methane leaks, and cloud aerosol optical depth.
                </p>
              </div>

              <div className="directive-item">
                <h3 className="directive-heading">BIOSPHERIC TRACKING</h3>
                <p className="directive-text">
                  Processing normalized difference vegetation indices (NDVI) to calculate biological loss and recovery rates across protected zones and temperate rainforests.
                </p>
              </div>

              <div className="directive-item">
                <h3 className="directive-heading">CRYOSPHERIC ANALYSIS</h3>
                <p className="directive-text">
                  Real-time reporting on sea ice extent and glacial mass change, highlighting the long-term impact of rising global mean temperatures on sea level volatility.
                </p>
              </div>
            </div>

            <div className="about-section about-section--full">
              <h2 className="about-section-heading">OPEN DATA COMMITMENT</h2>
              <p className="about-text">
                Transparency is at the heart of our methodology. All visualization pipelines are modular and source-audited against IPCC benchmarks. We are committed to fostering global climate literacy by ensuring our tool is accessible, reproducible, and strictly aligned with global sustainable development imperatives.
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
