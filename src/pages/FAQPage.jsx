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
  return <main id="main-content" className="faq-layout">
    <header><nav className="screen-breadcrumb" aria-label="Breadcrumb"><a href="/" onClick={e => { e.preventDefault(); navigate({ page: 'home' }); }}>Home</a><span>/</span><span>Help</span></nav><h1>A little<br /><em>clarity.</em></h1><p>Everything you need to know about your pieces, from finding the right fit to caring for them.</p><button className="story-link" onClick={() => navigate({ page: 'contact' })}>Talk to our atelier ↗</button></header>
    <div>{FAQ_GROUPS.map(group => <section className="faq-group" key={group.category}><h2>{group.category}</h2>{group.items.map(item => <details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</section>)}</div>
  </main>;
}
