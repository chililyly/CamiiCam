import { useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <main className="section home-page">
      <SiteHeader />

      <div className="home-clouds" aria-hidden="true" />

      <div className="home-hero" aria-label="Photobooth preview">
        <div className="strip strip-left">
          <div className="strip-frame"><span /></div>
          <div className="strip-frame"><span /></div>
          <div className="strip-frame"><span /></div>
          <div className="strip-frame"><span /></div>
        </div>
        <div className="strip strip-right">
          <div className="strip-frame"><span /></div>
          <div className="strip-frame"><span /></div>
          <div className="strip-frame"><span /></div>
          <div className="strip-frame"><span /></div>
        </div>
      </div>

      <button className="pill-button home-start" type="button" onClick={() => navigate('/layout-selection')}>
        Start
      </button>
    </main>
  )
}
