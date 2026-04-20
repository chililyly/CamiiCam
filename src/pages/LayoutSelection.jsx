import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { layouts } from '../lib/photobooth'

export default function LayoutSelectionPage() {
  const navigate = useNavigate()
  const [selectedLayoutId, setSelectedLayoutId] = useState('')

  const handleSelectLayout = (layoutId) => {
    setSelectedLayoutId(layoutId)
  }

  const handleContinue = () => {
    if (!selectedLayoutId) {
      return
    }

    navigate(`/capture?layout=${selectedLayoutId}`)
  }

  return (
    <main className="section layout-selection-page">
      <SiteHeader />
      
      <h2 className="section-title">choose your layout</h2>
      <p className="layout-subtitle">Choose from an assortment of photo booth frame designs.</p>
      
      <div className="layouts-carousel">
        <button className="carousel-arrow carousel-prev" type="button" aria-label="Previous layout">
          &#8249;
        </button>

        <div className="layout-grid">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              type="button"
              className={`layout-option ${selectedLayoutId === layout.id ? 'selected' : ''}`}
              onClick={() => handleSelectLayout(layout.id)}
              aria-label={layout.name}
              aria-pressed={selectedLayoutId === layout.id}
            >
              <div className={`layout-preview-mini columns-${layout.columns} shots-${layout.shots}`} style={{ transform: `rotate(${layout.tilt}deg)` }}>
                {Array.from({ length: layout.shots }).map((_, idx) => (
                  <span key={`${layout.id}-${idx}`} />
                ))}
              </div>
              <div className="layout-info">
                <span className="layout-label">{layout.name}</span>
                <span className="layout-desc">Size {layout.size}</span>
                <span className="layout-desc">{layout.shots} poses</span>
              </div>
            </button>
          ))}
        </div>

        <button className="carousel-arrow carousel-next" type="button" aria-label="Next layout">
          &#8250;
        </button>
      </div>

      <button className="pill-button continue-btn" type="button" onClick={handleContinue} disabled={!selectedLayoutId}>
        Continue
      </button>
    </main>
  )
}
