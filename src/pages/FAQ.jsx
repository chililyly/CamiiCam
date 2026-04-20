import { useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import { faqs } from '../lib/photobooth'

export default function FaqPage() {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const toggleExpanded = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <main className="section faq-page">
      <SiteHeader />
      
      <h2 className="section-title">Frequently Asked Questions</h2>
      
      <div className="faq-list">
        {faqs.map((item, index) => (
          <article key={`${index}-${item.question}`} className="faq-item">
            <button
              type="button"
              className={`faq-question ${expandedIndex === index ? 'expanded' : ''}`}
              onClick={() => toggleExpanded(index)}
              aria-expanded={expandedIndex === index}
            >
              <span>{item.question}</span>
              <span className="faq-toggle">
                {expandedIndex === index ? '−' : '+'}
              </span>
            </button>
            {expandedIndex === index && (
              <p className="faq-answer">{item.answer}</p>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}
