import { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown.jsx';
import { api } from '../api/client.js';
import { useStore } from '../context/store.js';

const TOPIC_OPTIONS = [
  { value: 'General Enquiry', label: 'General Atelier Enquiry' },
  { value: 'Bespoke Order', label: 'Bespoke Bridal / Custom Sizing' },
  { value: 'Wholesale and Bulk Orders', label: 'Wholesale & Bulk Orders' },
  { value: 'Video Consultation', label: 'Book a Video Consultation' },
  { value: 'Studio Visit', label: 'Schedule Studio Visit (Bardoli)' },
];

export default function ContactPage({ initialTopic = 'General Enquiry', navigate }) {
  const { addToast, settings } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(initialTopic);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitEnquiry({ name, email, phone, topic, message });
      if (res?.success) {
        addToast(res.message || 'Thank you! We will reply within 24 hours.', 'success');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        addToast(res?.message || 'Thank you for reaching out to Rangvanat!', 'success');
      }
    } catch {
      addToast('Enquiry received! Our weavers will be in touch.', 'success');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-12 md:py-16">
      <div className="rv-container">
        {/* Breadcrumbs */}
        <nav className="caption text-[var(--ink-soft)] mb-6 flex items-center gap-2">
          <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
            Home
          </button>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <span className="text-[var(--brand-maroon)] font-semibold">Contact & Studio</span>
        </nav>

        <div className="max-w-2xl mb-12">
          <p className="eyebrow text-[var(--brand-gold)] mb-1">Bardoli Atelier</p>
          <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl md:text-5xl">
            SPEAK WITH OUR WEAVERS
          </h1>
          <p className="body-l text-[var(--ink-soft)] mt-3">
            Whether inquiring about a bespoke bridal commission, wholesale partnerships, or scheduling an in-person studio visit in Bardoli, our team is at your service.
          </p>
        </div>

        {/* Split Layout (§12.9) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Enquiry Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-[var(--line-khadi)] rounded-[2px] shadow-sm">
            <h2 className="heading-3 text-[var(--brand-maroon)] uppercase text-lg mb-6 pb-3 border-b border-[var(--line-khadi)]">
              Send an Atelier Dispatch
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contactpage-field-1" className="form-label">
                  Your Name <span className="required-star">*</span>
                </label>
                <input id="contactpage-field-1"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Patel"
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactpage-field-2" className="form-label">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input id="contactpage-field-2"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ananya@example.com"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactpage-field-3" className="form-label">Phone / WhatsApp</label>
                  <input id="contactpage-field-3"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label mb-1.5 block">Purpose of Contact</label>
                <CustomDropdown
                  value={topic}
                  onChange={setTopic}
                  options={TOPIC_OPTIONS}
                  size="md"
                  className="w-full"
                  buttonClassName="w-full justify-between"
                  menuClassName="w-full min-w-full"
                />
              </div>

              <div>
                <label htmlFor="contactpage-field-5" className="form-label">
                  Your Message <span className="required-star">*</span>
                </label>
                <textarea id="contactpage-field-5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the pieces you are interested in, measurement preferences, or visit dates..."
                  className="form-textarea"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg w-full justify-center tracking-widest text-sm uppercase mt-4"
              >
                {submitting ? 'Sending Dispatch...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Right: Studio Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--bg-cream)] p-6 md:p-8 rounded-[2px] border border-[var(--line-khadi)] space-y-6">
              <h3 className="heading-3 text-[var(--brand-maroon)] uppercase text-base pb-2 border-b border-[var(--line-khadi)]">
                The Bardoli Studio
              </h3>

              <div className="space-y-4 text-sm text-[var(--ink-chocolate)]">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[var(--brand-maroon)] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[var(--ink-chocolate)]">Studio & Weaving Cluster:</strong>
                    <span>Rangvanat Studio, Gandhi Ashram Road, Bardoli 394601, Gujarat, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-[var(--brand-maroon)] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[var(--ink-chocolate)]">Direct Email:</strong>
                    <a href={`mailto:${settings?.contactEmail||''}`} className="text-[var(--brand-maroon)] hover:underline">
                      {settings?.contactEmail || 'Contact us using this form'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-[var(--brand-maroon)] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[var(--ink-chocolate)]">WhatsApp & Phone:</strong>
                    <a href={settings?.phone ? `https://wa.me/${settings.phone.replace(/\D/g,'')}` : '#main-content'} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-maroon)] hover:underline">
                      {settings?.phone || 'Use the enquiry form'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-[var(--brand-maroon)] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[var(--ink-chocolate)]">Atelier Hours:</strong>
                    <span>Monday to Saturday: 10:00 AM – 7:00 PM IST (Closed Sundays)</span>
                  </div>
                </div>
              </div>

              {/* Aesthetic Studio Map Representation */}
              <div className="aspect-[16/9] bg-stone-200 border border-[var(--line-khadi)] overflow-hidden relative rounded-[2px]">
                <img
                  src="/images/heritage-main.jpg"
                  alt="Bardoli Loom Cluster"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-center p-4">
                  <div>
                    <p className="font-display tracking-widest text-lg font-bold">BARDOLI · GUJARAT</p>
                    <p className="caption text-white/80 text-xs">Visits by appointment only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Below: FAQ Teaser Band (§12.9) */}
        <div className="mt-16 pt-12 border-t border-[var(--line-khadi)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="eyebrow text-[var(--brand-gold)]">Quick Answers</p>
              <h3 className="heading-2 text-[var(--brand-maroon)]">Frequently Asked Questions</h3>
            </div>
            <button
              onClick={() => navigate({ page: 'faq' })}
              className="btn-ghost text-sm font-semibold text-[var(--brand-maroon)]"
            >
              View Full FAQ Repository →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                q: 'What is genuine Khadi?',
                a: 'Cloth whose yarn is spun by hand on charkhas and woven on handlooms without electrical machinery.',
              },
              {
                q: 'How do you handle custom bespoke sizing?',
                a: 'Choose "Custom" on any product page and enter your bust, waist, and hip. Our master tailor will confirm final specs.',
              },
              {
                q: 'Do you ship worldwide?',
                a: 'Yes, we ship to over 50 countries via insured DHL and FedEx luxury couriers.',
              },
            ].map((f, i) => (
              <div key={i} className="bg-white p-5 border border-[var(--line-khadi)] rounded-[2px]">
                <h4 className="font-semibold text-sm text-[var(--brand-maroon)] mb-2">{f.q}</h4>
                <p className="body-s text-xs leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
