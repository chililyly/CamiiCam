import { useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import { isSupabaseReady, supabase } from '../lib/supabase'

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState('')

  const submitContact = async (event) => {
    event.preventDefault()
    setContactStatus('Sending...')

    try {
      if (!isSupabaseReady) {
        setContactStatus('Supabase not configured. Message was not stored.')
        return
      }

      await supabase.from('contact_messages').insert({
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        created_at: new Date().toISOString(),
      })

      setContactStatus('Message sent. Thank you!')
      setContactForm({ name: '', email: '', message: '' })
    } catch (error) {
      setContactStatus(error instanceof Error ? error.message : 'Could not send message')
    }
  }

  return (
    <main className="section about-page">
      <SiteHeader />
      
      <div className="about-layout">
        <div className="about-left">
          <h2 className="section-title">About</h2>
          <div className="about-text">
            <p className="about-heading">We are dedicated to providing a fun, seamless, and memorable photobooth experience for users around the world.</p>
            <p>
              If you have any questions, feedback, or concerns, feel free to contact us through our social media accounts or through our contact form.
            </p>
          </div>

          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📷</span>
              <span className="contact-label">@akhabla</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <span className="contact-label">eme@gmail.com</span>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={submitContact}>
          <h3 className="form-title">Contact Us</h3>
          <input
            type="text"
            placeholder="Name"
            value={contactForm.name}
            onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })}
            required
            className="form-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={contactForm.email}
            onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
            required
            className="form-input"
          />
          <textarea
            placeholder="Message"
            value={contactForm.message}
            onChange={(event) => setContactForm({ ...contactForm, message: event.target.value })}
            rows={4}
            required
            className="form-input"
          />
          <button type="submit" className="pill-button form-submit">Send</button>
          {contactStatus && <p className="status-line muted">{contactStatus}</p>}
        </form>
      </div>
    </main>
  )
}
