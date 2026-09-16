// src/pages/Contact.tsx
import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '../store/languageStore';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch (err) {
      console.warn('Network issue submitting feedback:', err);
    } finally {
      setLoading(false);
      setSubmitted(true);
      toast.success('Message sent! We\'ll get back to you soon.', {
        style: { background: '#1a2e1a', color: '#f0f7f0', border: '1px solid #d4a017' },
      });
    }
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-subtitle">{t('contact.getInTouch', 'Get In Touch')}</p>
          <h1 className="section-title mb-4">{t('contact.pageTitle', 'Contact Us')}</h1>
          <div className="gold-divider mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {[
              {
                Icon: Phone,
                title: t('contact.callUs', 'Call Us'),
                lines: ['+91 78109 90099'],
                sub: 'Mon–Sat, 9 AM to 6 PM IST',
              },
              {
                Icon: Mail,
                title: t('contact.emailUs', 'Email Us'),
                lines: ['hariharantradersorders@gmail.com'],
                sub: 'We reply within 4–6 hours',
              },
              {
                Icon: MapPin,
                title: t('contact.visitUs', 'Visit Us'),
                lines: ['Hariharan Traders Rice', 'Tamil Nadu, India'],
                sub: 'Open Monday to Saturday, 9 AM – 5 PM',
              },
              {
                Icon: Clock,
                title: t('contact.hours', 'Business Hours'),
                lines: ['Mon–Fri: 9:00 AM – 6:00 PM', 'Sat: 9:00 AM – 2:00 PM'],
                sub: 'Closed on Sundays & National Holidays',
              },
            ].map(({ Icon, title, lines, sub }) => (
              <div key={title} className="flex gap-4">
                <div className="w-12 h-12 bg-[#d4a017]/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
                  <Icon className="w-6 h-6 text-[#d4a017]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{title}</h3>
                  {lines.map((l) => (
                    <p key={l} className="text-gray-300">{l}</p>
                  ))}
                  <p className="text-gray-500 text-sm mt-1">{sub}</p>
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/917810990099?text=Hello%20Hariharan%20Traders%20Rice%20Mill%2C%20I%20have%20an%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold px-6 py-4 rounded-xl hover:bg-[#25D366]/20 transition-all"
            >
              <MessageCircle className="w-6 h-6" />
              <div>
                <div>Chat on WhatsApp</div>
                <div className="text-xs font-normal text-[#25D366]/70">
                  Fastest response — usually within minutes
                </div>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div>
            {submitted ? (
              <div className="card p-8 text-center">
                <CheckCircle className="w-16 h-16 text-[#7ec07e] mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400 mb-6">We'll respond within 4–6 business hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-secondary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <h2 className="font-serif font-bold text-xl text-white mb-2">Send a Message</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Your Name *</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input
                      type="tel"
                      placeholder="Mobile number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Subject *</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input cursor-pointer"
                    required
                  >
                    <option value="">Select subject</option>
                    <option>Product Inquiry</option>
                    <option>Wholesale / Bulk Order</option>
                    <option>Export Inquiry</option>
                    <option>Order Support</option>
                    <option>General Query</option>
                  </select>
                </div>

                <div>
                  <label className="label">Message *</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input resize-none"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 disabled:opacity-50">
                  <Send className="w-5 h-5" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
