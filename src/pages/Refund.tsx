// src/pages/Refund.tsx
export default function Refund() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="section-subtitle">Legal</p>
          <h1 className="section-title">Refund & Return Policy</h1>
          <div className="gold-divider mt-4 mb-2" />
          <p className="text-gray-400 text-sm">Last updated: September 2026</p>
        </div>

        {/* Quick Summary */}
        <div className="bg-[#1e5c1e]/20 border border-[#1e5c1e]/40 rounded-2xl p-6 mb-10">
          <h2 className="font-serif text-xl font-bold text-white mb-4">Quick Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '📅', title: '7-Day Returns', desc: 'Return within 7 days of delivery' },
              { icon: '💰', title: 'Full Refund', desc: 'On damaged or wrong products' },
              { icon: '🔄', title: 'Easy Process', desc: 'Call/WhatsApp us to initiate' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center p-4 bg-[#0f1a0f] rounded-xl">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-white font-semibold mb-1">{title}</div>
                <div className="text-gray-400 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 text-gray-300">
          {[
            {
              title: '1. Eligible Returns',
              content: `You can return products within 7 days of delivery if: (a) The product is damaged or defective. (b) The wrong product was delivered. (c) The product significantly differs from its description. (d) The product is past its best-before date on arrival. Products must be in original, unopened packaging. Opened or partially used products are not eligible for return unless the quality issue is reported within 24 hours of opening.`,
            },
            {
              title: '2. Non-Returnable Items',
              content: `The following cannot be returned: (a) Products that have been opened and used. (b) Products damaged due to improper storage by the customer. (c) Products ordered on sale or at special discounted rates (unless damaged). (d) Wholesale/bulk orders (subject to separate contract terms).`,
            },
            {
              title: '3. How to Initiate a Return',
              content: `To initiate a return: (1) Contact us within 7 days of delivery via WhatsApp (+91 78109 90099), phone, or email. (2) Provide your order ID, reason for return, and photos of the product/packaging. (3) Our team will review your request within 24 hours. (4) If approved, we will arrange a free pick-up from your address within 2–3 business days. (5) Refund will be processed after the returned product is received and verified.`,
            },
            {
              title: '4. Refund Processing',
              content: `Approved refunds will be processed within 5–7 business days after return verification. UPI payments will be refunded to the original UPI ID. COD orders will be refunded via bank transfer (NEFT/IMPS) — please share your bank details. If the refund does not reflect within 7 business days, please contact your bank before reaching out to us.`,
            },
            {
              title: '5. Order Cancellation',
              content: `You may cancel your order before it is dispatched. Once dispatched, cancellation is not possible — you may initiate a return upon delivery. To cancel, contact us immediately via WhatsApp or phone with your order ID. Refund for cancelled orders will be processed within 3–5 business days.`,
            },
            {
              title: '6. Damaged in Transit',
              content: `If your product arrives visibly damaged, please: (a) Refuse delivery and note the damage on the delivery receipt. (b) Or, if you have already accepted delivery, take photos immediately and contact us within 24 hours. We will arrange a full replacement or refund at no additional cost.`,
            },
            {
              title: '7. Contact for Returns',
              content: `Returns & Refunds: WhatsApp: +91 78109 90099 | Email: hariharantradersorders@gmail.com | Phone: +91 78109 90099 (Mon–Sat, 9 AM–6 PM IST)`,
            },
          ].map(({ title, content }) => (
            <section key={title} className="card p-6">
              <h2 className="font-serif text-xl font-bold text-white mb-3">{title}</h2>
              <p className="leading-relaxed whitespace-pre-line">{content}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
