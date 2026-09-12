// src/pages/Privacy.tsx
export default function Privacy() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="section-subtitle">Legal</p>
          <h1 className="section-title">Privacy Policy</h1>
          <div className="gold-divider mt-4 mb-2" />
          <p className="text-gray-400 text-sm">Last updated: September 2026</p>
        </div>

        <div className="space-y-6 text-gray-300">
          {[
            {
              title: '1. Information We Collect',
              content: `We collect: (a) Mobile number — required for OTP authentication and order notifications. (b) Name and delivery address — required to process and deliver your orders. (c) Email address — optional, used for order confirmation and promotional communications. (d) Device and usage data — IP address, browser type, pages visited, to improve our website. We do not collect credit/debit card details; all payment data is handled securely by Razorpay.`,
            },
            {
              title: '2. How We Use Your Information',
              content: `Your data is used to: process and deliver orders; send OTP and order status SMS; improve our product range and website; send promotional offers (with your consent); comply with legal and regulatory requirements. We will never sell, rent, or trade your personal data to third parties.`,
            },
            {
              title: '3. Data Sharing',
              content: `We may share your data with: (a) Courier partners (for delivery address and contact). (b) Payment processors (Razorpay — they handle payment data under their own privacy policy). (c) SMS gateway providers (for OTP delivery). (d) Government authorities if required by law. All third parties are bound by data protection agreements.`,
            },
            {
              title: '4. Cookies',
              content: `We use cookies to maintain your session, remember cart contents, and analyse website traffic. You can disable cookies in your browser settings, but this may affect website functionality. We use Google Analytics to understand visitor behaviour — this data is anonymised.`,
            },
            {
              title: '5. Data Security',
              content: `We employ industry-standard security measures including SSL/TLS encryption, secure database storage, and access controls. Your OTP is never stored in plain text. Despite our efforts, no data transmission over the internet is 100% secure; please report any suspected breach immediately.`,
            },
            {
              title: '6. Data Retention',
              content: `We retain your account information as long as your account is active. Order data is retained for 7 years as required by Indian tax law. You may request deletion of your account and associated data (except legally required records) by contacting us.`,
            },
            {
              title: '7. Your Rights',
              content: `Under the Indian Personal Data Protection framework, you have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data; opt out of marketing communications at any time; lodge a complaint with the data protection authority.`,
            },
            {
              title: '8. Children\'s Privacy',
              content: `Our website and services are not intended for children under 18 years. We do not knowingly collect data from minors. If we become aware that we have collected data from a minor, we will delete it immediately.`,
            },
            {
              title: '9. Changes to this Policy',
              content: `We may update this Privacy Policy periodically. We will notify registered users of significant changes via SMS. Continued use of our website after changes constitutes acceptance of the updated policy.`,
            },
            {
              title: '10. Contact',
              content: `For privacy concerns or data requests, contact our Data Protection Officer at: info@hariharantraders.com | +91 98765 43210 | Hariharan Traders Rice, Tamil Nadu, India.`,
            },
          ].map(({ title, content }) => (
            <section key={title} className="card p-6">
              <h2 className="font-serif text-xl font-bold text-white mb-3">{title}</h2>
              <p className="leading-relaxed">{content}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
