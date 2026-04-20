import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AboutPage from './pages/About'
import CapturePage from './pages/Capture'
import FaqPage from './pages/FAQ'
import HomePage from './pages/Home'
import LayoutSelectionPage from './pages/LayoutSelection'
import PrivacyPage from './pages/Privacy'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/layout-selection" element={<LayoutSelectionPage />} />
      <Route path="/capture" element={<CapturePage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
