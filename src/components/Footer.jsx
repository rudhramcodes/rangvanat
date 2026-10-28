import { useStore } from '../context/store.js';

export default function Footer({ navigate }) {
  const { settings } = useStore();

  const handleNav = (target) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(target);
  };

  return (
    <footer className="w-full bg-[var(--color-cream)] text-[var(--color-ink)] pt-20 pb-16">
      <div className="rv-container">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12">
          {/* Brand Col */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={settings?.logo || '/images/logo-only.svg'}
                alt="Rangvanat"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/logo-only.svg';
                }}
              />
              <span className="font-display text-2xl tracking-wider text-[var(--color-ink)]">
                Rangvanat
              </span>
            </div>
            <p className="text-base text-[var(--color-muted)] max-w-sm font-body leading-relaxed">
              Handcrafted artisanal Khadi studio based in Bardoli, Gujarat. Dedicated to preserving centuries-old charkha handspinning and botanical vat dyeing traditions.
            </p>
            <div className="pt-2 text-sm text-[var(--color-muted)]">
              <p>Atelier Studio: Rangvanat Studio, Gandhi Ashram Road, Bardoli 394601, Gujarat, India</p>
              <p className="mt-1">Inquiries: rangvanat.official@gmail.com · +91 98255 73657</p>
            </div>
          </div>

          {/* Col 2: Edits */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-base font-semibold text-[var(--color-ink)]">
              Curated Edits
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <button
                  onClick={() => handleNav({ page: 'shop', collection: 'flora' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  The Flora Edit
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'shop', collection: 'sacred' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  The Sacred Edit
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'shop', collection: 'folk' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  The Folk Edit
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'shop', collection: 'heritage' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  The Heritage Edit
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'shop', collection: 'denim' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  The Khadi Denim
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Atelier Heritage */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-base font-semibold text-[var(--color-ink)]">
              Atelier
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <button
                  onClick={() => handleNav({ page: 'story' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Our Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'craft' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Charkha &amp; Looms
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'journal' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Atelier Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'contact' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Contact &amp; Studio Visit
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Care & Policies */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-base font-semibold text-[var(--color-ink)]">
              Client Service
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-muted)]">
              <li>
                <button
                  onClick={() => handleNav({ page: 'track' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'faq' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Size Guide &amp; FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'content', id: 'shipping' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Shipping &amp; Customs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'content', id: 'returns' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Returns &amp; Exchanges
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav({ page: 'content', id: 'terms' })}
                  className="hover:text-[var(--color-ink)] transition-colors"
                >
                  Terms &amp; Privacy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-[var(--color-muted)] gap-4">
          <p>© {new Date().getFullYear()} Rangvanat Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>UPI · RuPay · Netbanking · Visa · Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
