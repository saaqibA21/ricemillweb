// src/pages/Terms.tsx
export default function Terms() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="section-subtitle">Legal</p>
          <h1 className="section-title">Terms & Conditions</h1>
          <div className="gold-divider mt-4 mb-2" />
          <p className="text-gray-400 text-sm">Last updated: September 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          {[
            {
              title: '1. Acceptance of Terms',
              content: `By accessing and using the Hariharan Traders Rice website (hariharantraders.com) and placing orders, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website or services.`,
            },
            {
              title: '2. Products and Pricing',
              content: `All rice products listed on our website are subject to availability. Prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices without prior notice. In case of a pricing error, we will inform you before processing your order.`,
            },
            {
              title: '3. Orders and Payment',
              content: `Orders are confirmed only after successful payment (for UPI/card orders) or acceptance of Cash on Delivery terms. We accept UPI payments through PhonePe, Google Pay, Paytm, and direct UPI ID. Cash on Delivery is available for orders up to ₹5,000 in select pincodes. Order confirmation will be sent via SMS to your registered mobile number.`,
            },
            {
              title: '4. Delivery and Shipping',
              content: `We deliver across India. Standard delivery takes 3–5 business days. Delivery timelines may vary due to location, weather conditions, or other unforeseen circumstances. Free delivery is applicable on orders above ₹999. We are not liable for delays caused by courier partners or natural events beyond our control.`,
            },
            {
              title: '5. Returns and Refunds',
              content: `We offer a 7-day return policy for products that are damaged, incorrectly delivered, or do not match the description. Products must be returned in original, unopened packaging. Refunds are processed within 5–7 business days after the return is verified. Please refer to our Refund Policy page for detailed procedures.`,
            },
            {
              title: '6. User Accounts',
              content: `You are required to provide accurate information when creating an account. Your account is linked to your registered mobile number. You are responsible for maintaining the confidentiality of your OTP and account activity. Hariharan Traders Rice is not liable for unauthorized access resulting from your negligence.`,
            },
            {
              title: '7. Intellectual Property',
              content: `All content on this website, including images, text, logos, product descriptions, and branding, is the property of Hariharan Traders Rice and is protected under Indian copyright law. Unauthorized reproduction or distribution is strictly prohibited.`,
            },
            {
              title: '8. Wholesale and Export Orders',
              content: `Wholesale and export inquiries are subject to separate pricing negotiations and contract terms. Minimum order quantities apply as stated on our Wholesale page. Export orders comply with APEDA and FSSAI regulations. We reserve the right to reject any inquiry at our sole discretion.`,
            },
            {
              title: '9. Limitation of Liability',
              content: `Hariharan Traders Rice shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our liability is limited to the value of the product purchased. Nothing in these terms limits liability for death or personal injury caused by negligence.`,
            },
            {
              title: '10. Governing Law',
              content: `These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Tamil Nadu, India. We encourage resolution of disputes through our customer support team before approaching legal remedies.`,
            },
            {
              title: '11. Amendments',
              content: `We reserve the right to update these Terms and Conditions at any time. The updated terms will be posted on this page with the revision date. Continued use of our website after changes constitutes your acceptance of the revised terms.`,
            },
            {
              title: '12. Contact',
              content: `For any questions regarding these Terms, please contact us at info@hariharantraders.com or call +91 98765 43210.`,
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
