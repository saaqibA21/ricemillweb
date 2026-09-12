// src/pages/Wholesale.tsx
import { useState } from 'react';
import { Send, CheckCircle, Package, Globe, FileText, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const moqTable = [
  { variety: 'Extra Long Basmati (1121)', moq: '100 MT', price: 'On Request', certification: 'FSSAI, Phyto' },
  { variety: 'Sella Basmati', moq: '100 MT', price: 'On Request', certification: 'FSSAI, APEDA' },
  { variety: 'Super Kernel Basmati', moq: '50 MT', price: 'On Request', certification: 'FSSAI' },
  { variety: 'Parboiled Rice (PR-11)', moq: '200 MT', price: 'On Request', certification: 'APEDA' },
  { variety: 'Sona Masoori', moq: '100 MT', price: 'On Request', certification: 'FSSAI' },
  { variety: 'Broken Rice (D1/D2)', moq: '500 MT', price: 'On Request', certification: 'N/A' },
];

const certifications = [
  'FSSAI License',
  'ISO 22000:2018',
  'APEDA Registered',
  'Phytosanitary Certificate',
  'Halal Certified',
  'MSDS Available',
];

export default function Wholesale() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    country: 'India',
    products: '',
    quantity: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch (err) {
      console.warn('Network issue saving export request:', err);
    } finally {
      setLoading(false);
      setSubmitted(true);
      toast.success('Inquiry submitted! We\'ll contact you within 24 hours.', {
        style: { background: '#1a2e1a', color: '#f0f7f0', border: '1px solid #d4a017' },
      });
    }
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-subtitle">Business Enquiries</p>
          <h1 className="section-title mb-4">Wholesale & Export</h1>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            We supply to restaurants, supermarkets, traders, and food manufacturers across India and internationally.
            Get competitive pricing with consistent, export-grade quality.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { Icon: Package, title: 'Bulk Packaging', desc: '25 kg, 50 kg PP bags, custom branding available' },
            { Icon: Globe, title: 'Export Ready', desc: 'Shipping to 25+ countries with full documentation' },
            { Icon: FileText, title: 'Certifications', desc: 'FSSAI, ISO 22000, APEDA, Phytosanitary' },
            { Icon: Truck, title: 'Reliable Supply', desc: 'Year-round supply with our own farm network' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <div className="w-10 h-10 bg-[#d4a017]/10 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-[#d4a017]" />
              </div>
              <h3 className="text-white font-semibold mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* MOQ Table */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-white mb-6">
              Minimum Order Quantities
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#2d4a2d]">
              <table className="w-full text-sm">
                <thead className="bg-[#1a2e1a]">
                  <tr>
                    <th className="text-left text-gray-300 font-semibold px-4 py-3">Variety</th>
                    <th className="text-left text-gray-300 font-semibold px-4 py-3">MOQ</th>
                    <th className="text-left text-gray-300 font-semibold px-4 py-3">Certs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2e1a]">
                  {moqTable.map((row) => (
                    <tr key={row.variety} className="bg-[#0f1a0f] hover:bg-[#1a2e1a] transition-colors">
                      <td className="px-4 py-3 text-white">{row.variety}</td>
                      <td className="px-4 py-3 text-[#d4a017] font-semibold">{row.moq}</td>
                      <td className="px-4 py-3 text-gray-400">{row.certification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-gray-400 text-xs mt-3">
              * Prices quoted in USD/MT for export or INR/MT for domestic. Contact us for current rates.
            </p>

            {/* Certifications */}
            <div className="mt-8">
              <h3 className="font-serif text-xl font-bold text-white mb-4">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {certifications.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 badge badge-gold px-3 py-1.5 text-sm">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Download Brochure */}
            <div className="mt-8 bg-[#1a2e1a] border border-[#2d4a2d] rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Download Product Brochure</h3>
              <p className="text-gray-400 text-sm mb-4">
                Detailed specification sheets, grade standards, and export documentation guide.
              </p>
              <button className="btn-secondary text-sm px-5 py-2.5">
                <FileText className="w-4 h-4" />
                Download PDF Brochure
              </button>
            </div>
          </div>

          {/* Inquiry Form */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-white mb-6">Get a Quote</h2>

            {submitted ? (
              <div className="card p-8 text-center">
                <CheckCircle className="w-16 h-16 text-[#7ec07e] mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-white mb-2">Inquiry Submitted!</h3>
                <p className="text-gray-400 mb-6">
                  Our team will contact you within 24 hours with pricing and availability.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company Name *</label>
                    <input
                      type="text"
                      placeholder="Your company"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Contact Person *</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone *</label>
                    <input
                      type="tel"
                      placeholder="+1 or +91 number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      placeholder="business@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Country</label>
                    <input
                      type="text"
                      placeholder="Country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Quantity Required</label>
                    <input
                      type="text"
                      placeholder="e.g. 500 MT / month"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Products Required</label>
                  <input
                    type="text"
                    placeholder="e.g. Basmati 1121, Parboiled PR-11"
                    value={form.products}
                    onChange={(e) => setForm({ ...form, products: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Additional Requirements</label>
                  <textarea
                    rows={4}
                    placeholder="Packaging preferences, grade requirements, delivery timeline..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input resize-none"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50">
                  <Send className="w-5 h-5" />
                  {loading ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
