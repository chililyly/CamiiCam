import SiteHeader from '../components/SiteHeader'

export default function PrivacyPage() {
  return (
    <main className="section privacy-page">
      <SiteHeader />
      
      <h2 className="section-title">Privacy Policy</h2>
      
      <div className="privacy-content">
        <p>
          We respect your privacy and are committed to protecting your personal information worldwide. When you use our photobooth website, we may collect and use your photos, contact details if you voluntarily submit a form, and session metadata for support purposes.
        </p>
        <p>
          The photos you upload or capture are processed and stored using Supabase, which you configure. You have complete control over your data retention, access policies, and deletion settings in your own Supabase project.
        </p>
        <p>
          By using our website, you consent to this Privacy Policy. We may update the policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
        </p>
        <p>
          Your data may be transferred to and processed in accordance with applicable global data protection laws, including but not limited to the European Union's General Data Protection Regulation (GDPR). We take reasonable steps to protect your data in a manner consistent with these standards.
        </p>
        <p>
          You have the right to access, correct, or request deletion of your personal data. To exercise these rights, please contact us using the information provided on the About page.
        </p>
      </div>
    </main>
  )
}
