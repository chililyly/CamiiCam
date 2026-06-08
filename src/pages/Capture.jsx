import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isSupabaseReady, supabase } from '../lib/supabase'
import { dataUrlToBlob, filters, layouts } from '../lib/photobooth'
import SiteHeader from '../components/SiteHeader'

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default function CapturePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedLayout, setSelectedLayout] = useState(() => {
    const layoutId = searchParams.get('layout')
    return layouts.find((l) => l.id === layoutId) || layouts[0]
  })
  const [selectedFilter, setSelectedFilter] = useState(filters[0])
  const [customFilters, setCustomFilters] = useState([])
  const [timerSeconds, setTimerSeconds] = useState(3)
  const [timerMenuOpen, setTimerMenuOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [sourceMode, setSourceMode] = useState('webcam')
  const [cameraReady, setCameraReady] = useState(false)
  const [uploadPreviews, setUploadPreviews] = useState([])
  const [stripPreview, setStripPreview] = useState('')
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [captureStatus, setCaptureStatus] = useState('')
  const [sessionStatus, setSessionStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [newFilterLabel, setNewFilterLabel] = useState('')
  const [newFilterCss, setNewFilterCss] = useState('')
  const [newFilterSwatch, setNewFilterSwatch] = useState('#23a6ea')

  const uploaderRef = useRef(null)
  const timerDropdownRef = useRef(null)
  const videoRef = useRef(null)
  const cameraStreamRef = useRef(null)

  const timerOptions = [3, 5, 8]

  const shotsLabel = useMemo(() => `${capturedPhotos.length}/${selectedLayout.shots}`, [capturedPhotos.length, selectedLayout.shots])
  const allFilters = useMemo(() => [...filters, ...customFilters], [customFilters])
  const swatchPalette = useMemo(
    () => ['#23a6ea', '#6c7f8e', '#e8d4b8', '#a8b5c8', '#c9a882', '#d9c5b0', '#8ba5c9'],
    [],
  )

  useEffect(() => () => {
    uploadPreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl))
  }, [uploadPreviews])

  const onUpload = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) {
      return
    }

    if (files.length !== selectedLayout.shots) {
      setUploadPreviews([])
      setSourceMode('webcam')
      setCapturedPhotos([])
      setStripPreview('')
      setCaptureStatus(`Upload exactly ${selectedLayout.shots} images for Layout ${selectedLayout.id}.`)
      setSessionStatus('')
      event.target.value = ''
      return
    }

    const previewUrls = files.map((file) => URL.createObjectURL(file))
    setUploadPreviews(previewUrls)
    setSourceMode('upload')
    setCapturedPhotos([])
    setStripPreview('')
    setCaptureStatus(`Uploaded ${files.length} images. You can start the capture process.`)
    setSessionStatus('')
    event.target.value = ''
  }

  const renderImageWithFilter = async (sourceUrl, filterCss) => {
    const img = await new Promise((resolve, reject) => {
      const nextImage = new Image()
      nextImage.crossOrigin = 'anonymous'
      nextImage.onload = () => resolve(nextImage)
      nextImage.onerror = reject
      nextImage.src = sourceUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 800

    const ctx = canvas.getContext('2d')
    ctx.filter = filterCss
    ctx.fillStyle = '#eff4ff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
    const drawWidth = img.width * scale
    const drawHeight = img.height * scale
    const x = (canvas.width - drawWidth) / 2
    const y = (canvas.height - drawHeight) / 2
    ctx.drawImage(img, x, y, drawWidth, drawHeight)

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  const captureFromVideoWithFilter = (video, filterCss) => {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 800

    const ctx = canvas.getContext('2d')
    ctx.filter = filterCss
    ctx.fillStyle = '#eff4ff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const sourceWidth = video.videoWidth || 1280
    const sourceHeight = video.videoHeight || 720
    const scale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight)
    const drawWidth = sourceWidth * scale
    const drawHeight = sourceHeight * scale
    const x = (canvas.width - drawWidth) / 2
    const y = (canvas.height - drawHeight) / 2
    ctx.drawImage(video, x, y, drawWidth, drawHeight)

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  const buildStripDataUrl = async (photos, layout) => {
    if (photos.length === 0) {
      return ''
    }

    const rows = Math.ceil(layout.shots / layout.columns)
    const cellWidth = 640
    const cellHeight = 800
    const pad = 24
    const headerHeight = 74
    const footerHeight = 64

    const canvas = document.createElement('canvas')
    canvas.width = layout.columns * cellWidth + (layout.columns + 1) * pad
    canvas.height = rows * cellHeight + (rows + 1) * pad + headerHeight + footerHeight

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#f4f8ff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#12345c'
    ctx.font = '600 44px "Cormorant Garamond", serif'
    ctx.fillText('photobooth', pad, 52)

    const imageElements = await Promise.all(
      photos.map((photo) => new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = photo
      })),
    )

    imageElements.forEach((image, index) => {
      const col = index % layout.columns
      const row = Math.floor(index / layout.columns)
      const x = pad + col * (cellWidth + pad)
      const y = headerHeight + pad + row * (cellHeight + pad)

      ctx.strokeStyle = '#1f252e'
      ctx.lineWidth = 6
      ctx.strokeRect(x - 3, y - 3, cellWidth + 6, cellHeight + 6)
      ctx.drawImage(image, x, y, cellWidth, cellHeight)
    })

    ctx.font = '600 30px "Nunito", sans-serif'
    ctx.fillStyle = '#2c4f7f'
    ctx.fillText(new Date().toLocaleDateString(), pad, canvas.height - 18)

    return canvas.toDataURL('image/jpeg', 0.96)
  }

  const startWebcam = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCaptureStatus('Webcam is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      })

      cameraStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraReady(true)
      setSourceMode('webcam')
      setCaptureStatus('Webcam started. You can capture now.')
    } catch (error) {
      setCaptureStatus(error instanceof Error ? error.message : 'Unable to start webcam')
    }
  }

  const stopWebcam = () => {
    const stream = cameraStreamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    cameraStreamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraReady(false)
  }

  useEffect(() => () => {
    stopWebcam()
  }, [])

  useEffect(() => {
    if (!timerMenuOpen) {
      return undefined
    }

    const handleClickOutside = (event) => {
      if (!timerDropdownRef.current?.contains(event.target)) {
        setTimerMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [timerMenuOpen])

  const uploadSessionToSupabase = async (sessionId, photos) => {
    if (!isSupabaseReady || photos.length === 0) {
      return
    }

    await supabase.from('photo_sessions').insert({
      session_id: sessionId,
      layout_id: selectedLayout.id,
      filter_id: selectedFilter.id,
      total_shots: photos.length,
      created_at: new Date().toISOString(),
    })

    for (let i = 0; i < photos.length; i += 1) {
      const path = `${sessionId}/shot-${i + 1}.jpg`
      const blob = dataUrlToBlob(photos[i])
      await supabase.storage.from('photobooth-uploads').upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      })
    }
  }

  const startCapture = async () => {
    if (sourceMode === 'webcam' && !cameraReady) {
      setCaptureStatus('Start the webcam before capturing.')
      return
    }

    if (sourceMode === 'upload' && uploadPreviews.length !== selectedLayout.shots) {
      setCaptureStatus(`Upload exactly ${selectedLayout.shots} images before starting capture.`)
      return
    }

    setBusy(true)
    setCapturedPhotos([])
    setStripPreview('')
    setSessionStatus('')

    try {
      const nextCaptures = []
      for (let shot = 1; shot <= selectedLayout.shots; shot += 1) {
        setCaptureStatus(`Preparing shot ${shot} of ${selectedLayout.shots}`)
        for (let tick = timerSeconds; tick > 0; tick -= 1) {
          setCountdown(tick)
          await wait(1000)
        }

        setCountdown(0)
        let processed = ''
        if (sourceMode === 'webcam') {
          if (!videoRef.current) {
            throw new Error('Webcam stream is unavailable')
          }
          processed = captureFromVideoWithFilter(videoRef.current, selectedFilter.css)
        } else {
          processed = await renderImageWithFilter(uploadPreviews[shot - 1], selectedFilter.css)
        }

        nextCaptures.push(processed)
        setCapturedPhotos([...nextCaptures])
      }

      const strip = await buildStripDataUrl(nextCaptures, selectedLayout)
      setStripPreview(strip)
      setCaptureStatus('Previewing...')
      setShowPreviewModal(true)

      if (isSupabaseReady) {
        const sessionId = crypto.randomUUID()
        await uploadSessionToSupabase(sessionId, nextCaptures)
      }
    } catch (error) {
      setCaptureStatus('Capture failed. Please try another image.')
      setSessionStatus(error instanceof Error ? error.message : 'Unexpected error')
    } finally {
      setBusy(false)
      setCountdown(0)
    }
  }

  const downloadStrip = () => {
    if (!stripPreview) {
      setCaptureStatus('Capture a session before downloading the strip.')
      return
    }
    setShowPreviewModal(true)
  }

  const handleDownloadFromModal = () => {
    const anchor = document.createElement('a')
    anchor.href = stripPreview
    anchor.download = `photobooth-strip-${Date.now()}.jpg`
    anchor.click()
  }

  const closePreviewModal = () => {
    setShowPreviewModal(false)
    navigate('/')
  }

  const addCustomFilter = (event) => {
    event.preventDefault()

    const label = newFilterLabel.trim()
    const css = newFilterCss.trim()
    if (!label || !css) {
      setCaptureStatus('Enter both a filter name and CSS filter value.')
      return
    }

    const filterId = `custom-${Date.now()}`
    const nextFilter = {
      id: filterId,
      label,
      css,
      swatch: newFilterSwatch,
    }

    setCustomFilters((prev) => [...prev, nextFilter])
    setSelectedFilter(nextFilter)
    setShowFilterModal(false)
    setNewFilterLabel('')
    setNewFilterCss('')
    setNewFilterSwatch('#23a6ea')
    setCaptureStatus(`Added ${label} filter.`)
  }

  const getFilterSwatch = (filter, index) => filter.swatch || swatchPalette[index % swatchPalette.length]

  const renderLayoutCell = (shot, index) => {
    if (shot) {
      return <img src={shot} alt={`Captured shot ${index + 1}`} className="layout-shot" />
    }
    return <span className="layout-placeholder">Shot {index + 1}</span>
  }

  return (
    <main className="section capture-page">
      <SiteHeader />

      <p className="shot-counter">{shotsLabel}</p>

      <div className="capture-controls">
        <button className="pill-button subtle" type="button" onClick={() => uploaderRef.current?.click()}>
          Upload Images
        </button>
        <button className="pill-button subtle" type="button" onClick={startWebcam}>
          Start Webcam
        </button>
        <button className="pill-button subtle" type="button" onClick={stopWebcam}>
          Stop Webcam
        </button>
        <div className="timer-dropdown" ref={timerDropdownRef}>
          <button
            className={`timer-trigger ${timerMenuOpen ? 'open' : ''}`}
            type="button"
            onClick={() => setTimerMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={timerMenuOpen}
          >
            Set Timer - {timerSeconds}s
            <span className="timer-chevron" aria-hidden="true" />
          </button>
          {timerMenuOpen && (
            <ul className="timer-menu" role="listbox" aria-label="Set Timer">
              {timerOptions.map((seconds) => (
                <li key={seconds}>
                  <button
                    type="button"
                    className={`timer-option ${seconds === timerSeconds ? 'selected' : ''}`}
                    onClick={() => {
                      setTimerSeconds(seconds)
                      setTimerMenuOpen(false)
                    }}
                    role="option"
                    aria-selected={seconds === timerSeconds}
                  >
                    Set Timer - {seconds}s
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          ref={uploaderRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={onUpload}
          hidden
        />
      </div>

      <div className="live-preview-wrap">
        {sourceMode === 'webcam' ? (
          <video
            ref={videoRef}
            className={`live-camera ${selectedFilter.id !== 'none' ? 'filter-on' : ''}`}
            style={{ filter: selectedFilter.css }}
            autoPlay
            muted
            playsInline
          />
        ) : uploadPreviews.length > 0 ? (
          <img src={uploadPreviews[0]} alt="Upload preview" className="live-camera" style={{ filter: selectedFilter.css }} />
        ) : (
          <div className="live-camera placeholder">
            <span>Selected Layout: {selectedLayout.name}</span>
          </div>
        )}
      </div>

      <p className="section-title">choose a filter!</p>
      <div className="filter-bar" role="radiogroup" aria-label="Filters">
        {allFilters.map((filter, index) => (
          <button
            key={filter.id}
            type="button"
            className={`filter-dot ${selectedFilter.id === filter.id ? 'active' : ''}`}
            style={{ background: getFilterSwatch(filter, index) }}
            onClick={() => setSelectedFilter(filter)}
            role="radio"
            aria-checked={selectedFilter.id === filter.id}
            aria-label={filter.label}
            data-label={filter.label}
          />
        ))}
      </div>

      <button className="pill-button start-capture-btn" type="button" onClick={startCapture} disabled={busy}>
        {busy ? `Capturing${countdown ? ` (${countdown})` : ''}` : 'Start Capture'}
      </button>

      <p className="status-line">{captureStatus}</p>
      <p className="status-line muted">{sessionStatus}</p>

      {showPreviewModal && stripPreview && (
        <div className="modal-overlay" onClick={closePreviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Preview</h2>
            <img src={stripPreview} alt="Strip preview" className="modal-preview-image" />
            <div className="modal-actions">
              <button className="pill-button" type="button" onClick={closePreviewModal}>
                Back
              </button>
              <button className="pill-button" type="button" onClick={handleDownloadFromModal}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="filter-modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="filter-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="filter-modal-head">
              <h2 className="filter-modal-title">Add New Filter</h2>
              <button className="filter-modal-close" type="button" onClick={() => setShowFilterModal(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className="filter-modal-form" onSubmit={addCustomFilter}>
              <label className="filter-form-label" htmlFor="filter-name">
                Filter Name
              </label>
              <input
                id="filter-name"
                className="form-input"
                value={newFilterLabel}
                onChange={(event) => setNewFilterLabel(event.target.value)}
                placeholder="Example: Dreamy"
                required
              />

              <label className="filter-form-label" htmlFor="filter-css">
                CSS Filter Value
              </label>
              <input
                id="filter-css"
                className="form-input"
                value={newFilterCss}
                onChange={(event) => setNewFilterCss(event.target.value)}
                placeholder="Example: saturate(1.2) contrast(1.08)"
                required
              />

              <label className="filter-form-label" htmlFor="filter-color">
                Circle Color
              </label>
              <input
                id="filter-color"
                className="filter-color-input"
                type="color"
                value={newFilterSwatch}
                onChange={(event) => setNewFilterSwatch(event.target.value)}
              />

              <p className="filter-form-hint">Use valid CSS filter syntax like grayscale(1) or hue-rotate(20deg).</p>

              <div className="filter-modal-actions">
                <button className="pill-button subtle" type="button" onClick={() => setShowFilterModal(false)}>
                  Cancel
                </button>
                <button className="pill-button" type="submit">
                  Save Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
