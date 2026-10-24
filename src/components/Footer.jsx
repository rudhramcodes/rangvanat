import { useState } from 'react';
import { api } from '../api/client.js';
import { useStore } from '../context/store.js';

export default function Footer({ navigate }) {
  const { addToast, settings } = useStore();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribing(true);
    try {
      const res = await api.subscribeNewsletter(email);
      if (res?.success) {
        addToast(res.message || 'Subscribed to Letters from the Loom!', 'success');
        setEmail('');
      } else {
        addToast(res?.message || 'Subscription failed. Please try again.', 'error');
      }
    } catch {
      addToast('Subscription failed. Please try again.', 'error');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer
      className="w-full bg-[var(--brand-maroon-deep)] text-[var(--bg-cream)] pt-20 pb-10"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="rv-container">
        {/* Top Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16 border-b border-[var(--line-khadi)]/20">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl md:text-4xl font-semibold tracking-wider text-[var(--bg-ivory)]">
                RANGVANAT
              </span>
              <span className="text-xs uppercase tracking-widest text-[var(--brand-gold-soft)] border-l border-[var(--brand-gold-soft)]/50 pl-3">
                Bardoli Khadi Studio
              </span>
            </div>
            <p className="serif-statement text-xl md:text-2xl text-[var(--bg-ivory)]/90 max-w-lg leading-relaxed">
              "The art of weaving colours into fabric, and fabric into stories. From Bardoli to the world."
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="eyebrow text-[var(--brand-gold-soft)] mb-2">Exclusive Circle</p>
            <h3 className="heading-3 text-[var(--bg-ivory)] mb-2 font-display text-2xl uppercase">
              Letters from the Loom
            </h3>
            <p className="text-[14px] text-[var(--bg-cream)]/75 mb-4">
              Receive one handwritten dispatch each month: newly woven limited edits, artisan stories, and loom notes.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="form-input flex-grow bg-white/10 border-white/20 text-[var(--bg-ivory)] placeholder:text-white/50 focus:border-[var(--brand-gold-soft)]"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn btn-primary-dark btn-md whitespace-nowrap"
              >
                {subscribing ? 'Subscribing...' : 'Join Circle'}
              </button>
            </form>
          </div>
        </div>

        {/* Middle Zone: 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-14">
          {/* Col 1: Shop */}
          <div>
            <p className="eyebrow text-[var(--brand-gold-soft)] mb-4">Shop Collections</p>
            <ul className="space-y-2.5 list-none p-0 m-0 text-[14px]">
              {['The Flora Edit', 'The Sacred Edit', 'The Folk Edit', 'The Heritage Edit', 'The Denim Edit', 'The Modern Edit'].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => navigate({ page: 'shop' })}
                      className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Col 2: The House */}
          <div>
            <p className="eyebrow text-[var(--brand-gold-soft)] mb-4">The House</p>
            <ul className="space-y-2.5 list-none p-0 m-0 text-[14px]">
              <li>
                <button
                  onClick={() => navigate({ page: 'story' })}
                  className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                >
                  Our Story & Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate({ page: 'craft' })}
                  className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                >
                  The Craft Process
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate({ page: 'journal' })}
                  className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                >
                  Weavers' Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate({ page: 'contact' })}
                  className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                >
                  Studio & Visits
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Care & Orders */}
          <div>
            <p className="eyebrow text-[var(--brand-gold-soft)] mb-4">Custodians Care</p>
            <ul className="space-y-2.5 list-none p-0 m-0 text-[14px]">
              <li>
                <button
                  onClick={() => navigate({ page: 'track' })}
                  className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                >
                  Track an Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate({ page: 'faq' })}
                  className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                >
                  Fabric Care & Washing
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate({ page: 'faq' })}
                  className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                >
                  Domestic & Global Shipping
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate({ page: 'faq' })}
                  className="text-[var(--bg-cream)]/85 hover:text-white transition-colors text-left"
                >
                  Returns & Exchanges
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Reach Us */}
          <div>
            <p className="eyebrow text-[var(--brand-gold-soft)] mb-4">Reach Our Loom</p>
            <div className="space-y-3 text-[14px] text-[var(--bg-cream)]/85">
              <p>Rangvanat Khadi Studio, Bardoli 394601, Gujarat, India</p>
              <p>Email: <a href={`mailto:${settings?.contactEmail||''}`} className="text-[var(--brand-gold-soft)] hover:underline">{settings?.contactEmail||'Contact the studio'}</a></p>
              <p>WhatsApp: <a href={settings?.phone ? `https://wa.me/${settings.phone.replace(/\D/g,'')}` : '/?page=contact'} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-gold-soft)] hover:underline">{settings?.phone||'Contact the studio'}</a></p>
              <p className="text-xs text-[var(--bg-cream)]/60">Monday to Saturday: 10:00 AM – 7:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Separator Gold Hairline */}
        <div className="w-full h-[1px] bg-[var(--brand-gold)]/60 my-6" />

        {/* Bottom Zone */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--bg-cream)]/65">
          <p>© {new Date().getFullYear()} RANGVANAT STUDIO · All Rights Reserved. Crafted with honour in Bardoli.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate({ page: 'content', id: 'privacy' })} className="hover:text-white">Privacy Policy</button>
            <button onClick={() => navigate({ page: 'content', id: 'terms' })} className="hover:text-white">Terms of Craft</button>
            <button onClick={() => navigate({ page: 'content', id: 'returns' })} className="hover:text-white">Refunds & Returns</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
