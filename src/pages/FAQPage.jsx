import { useState } from 'react';
import { Plus } from 'lucide-react';

const FAQ_GROUPS = [
  {
    category: 'Orders & Bespoke Tailoring',
    items: [
      {
        q: 'How does bespoke sizing work at Rangvanat?',
        a: 'Select "Custom" in the size options on any product page and provide your bust, waist, and hip measurements in inches. After your order is placed, our master tailor will contact you directly on WhatsApp to confirm your preferred ease, drape length, and silhouette adjustments before the scissors touch the cloth.',
      },
      {
        q: 'Can I purchase fabric by the metre for independent tailoring?',
        a: 'Yes, select "Fabrics by the Metre" from the Shop dropdown. Our unstitched khadi textiles are available in continuous lengths of 2.5 to 10 metres, loomed at standard 44-inch widths.',
      },
      {
        q: 'Can I cancel or alter an order after placing it?',
        a: 'Because pieces are tailored to order, cancellation or size alteration requests can be accommodated within 24 hours of placing your order. Write to rangvanat@gmail.com or message us on WhatsApp.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        q: 'What are your domestic and international shipping charges?',
        a: 'We offer complimentary express domestic shipping across India on all orders exceeding ₹15,000. Orders below this threshold incur a flat ₹500 insured courier charge. International shipping is calculated at checkout based on weight and destination.',
      },
      {
        q: 'What is the estimated delivery timeline?',
        a: 'Ready atelier pieces are dispatched within 3 business days. Custom tailored garments require 7 to 10 business days for weaving and hand-finishing before dispatch.',
      },
      {
        q: 'How do I track my shipment?',
        a: 'Every order receives an automated BlueDart tracking code upon dispatch. You can track your shipment live using the "Track Order" link in our header or footer.',
      },
    ],
  },
  {
    category: 'Returns & Exchange',
    items: [
      {
        q: 'What is your exchange and return policy?',
        a: 'We accept returns on all standard-sized, unworn pieces with tags intact within 7 days of delivery. Due to the individual specifications, custom-tailored bespoke garments are non-returnable, but we provide one complimentary alteration.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Email orders@rangvanat.com with your order number and photograph of the piece. Our team will schedule an insured reverse courier pickup.',
      },
    ],
  },
  {
    category: 'Fabric Care & Preservation',
    items: [
      {
        q: 'How should I wash naturally dyed Khadi?',
        a: 'We recommend dry cleaning for the first two washes to set authentic vegetable indigo and madder dyes. Subsequently, hand wash gently in cold water with mild organic shampoo. Never wring or tumble dry; always line dry in shade.',
      },
      {
        q: 'Why do naturally dyed fabrics sometimes release a blue tint?',
        a: 'Natural fermented indigo bonds physically to cotton fibres without synthetic fixatives. The slight release of surface pigment during the first rinse is natural and will not diminish the depth of the garment. It is the signature of living colour.',
      },
    ],
  },
];

export default function FAQPage({ navigate }) {
  const [openItems, setOpenItems] = useState({ 'Orders & Bespoke Tailoring-0': true });

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-12 md:py-20">
      <div className="rv-container max-w-3xl">
        {/* Breadcrumbs */}
        <nav className="caption text-[var(--ink-soft)] mb-6 flex items-center gap-2">
          <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
            Home
          </button>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <span className="text-[var(--brand-maroon)] font-semibold">Help & FAQ</span>
        </nav>

        <div className="text-center mb-14">
          <p className="eyebrow text-[var(--brand-gold)] mb-1">Custodians Repository</p>
          <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl md:text-5xl">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="body-l text-[var(--ink-soft)] mt-3">
            Clear guidelines on sizing, caring for vegetable dyes, global shipping, and atelier commissions.
          </p>
        </div>

        {/* Grouped Accordions (§12.10) */}
        <div className="space-y-10">
          {FAQ_GROUPS.map((group) => (
            <div key={group.category} className="space-y-3">
              <h2 className="heading-2 text-[var(--brand-maroon)] uppercase text-lg pb-2 border-b border-[var(--line-khadi)]">
                {group.category}
              </h2>

              <div className="space-y-2">
                {group.items.map((item, idx) => {
                  const itemKey = `${group.category}-${idx}`;
                  const isOpen = !!openItems[itemKey];

                  return (
                    <div
                      key={idx}
                      className="border border-[var(--line-khadi)] bg-white rounded-[2px] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(itemKey)}
                        className="w-full min-h-[56px] px-5 py-3.5 flex items-center justify-between text-left font-semibold text-[15px] text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] transition-colors"
                      >
                        <span className="pr-4">{item.q}</span>
                        <div
                          className={`w-6 h-6 flex items-center justify-center rounded-full transition-transform duration-250 ${
                            isOpen ? 'rotate-45 text-[var(--brand-maroon)]' : 'text-[var(--ink-soft)]'
                          }`}
                        >
                          <Plus size={18} />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 text-[14.5px] text-[var(--ink-chocolate)]/85 leading-relaxed border-t border-[var(--line-khadi)]/40 pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions banner */}
        <div className="mt-16 p-8 bg-[var(--bg-cream)] border border-[var(--line-khadi)] rounded-[2px] text-center space-y-3">
          <h3 className="heading-3 text-[var(--brand-maroon)] uppercase">Still Seeking Answers?</h3>
          <p className="body-s text-[var(--ink-chocolate)]">
            Our atelier weavers in Bardoli are always delighted to converse about cloth.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <button onClick={() => navigate({ page: 'contact' })} className="btn btn-primary btn-sm">
              Contact Atelier
            </button>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
