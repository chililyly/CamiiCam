import { Link } from 'react-router-dom'

export default function SiteHeader() {
  return (
    <header className="top-nav page-nav">
      <Link className="brand brand-link" to="/">
        camiicam
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link to="/faq">FAQ</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  )
}
