export default function OurStoryPage({ navigate }) {
  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-10 md:py-16">
      {/* 1. Hero */}
      <section className="rv-container mb-20">
        <nav className="caption text-[var(--ink-soft)] mb-6 flex items-center gap-2">
          <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
            Home
          </button>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <span className="text-[var(--brand-maroon)] font-semibold">Our Story</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="eyebrow text-[var(--brand-gold)]">The Heritage Lineage</p>
            <h1 className="display-l text-[var(--brand-maroon)] uppercase">
              CRAFTED WITH HONOUR IN BARDOLI
            </h1>
            <p className="body-l text-[var(--ink-chocolate)] leading-relaxed">
              Rangvanat was born out of a quiet reverence for the loom. In an age of high-speed mechanized fashion, we chose the deliberate, unhurried cadence of the wooden charkha.
            </p>
            <p className="body-text text-[var(--ink-soft)] leading-relaxed">
              Every yard of Rangvanat khadi is spun from pure indigenous cotton grown in Gujarat soil, hand-carded by women artisans, and woven on floor pit looms that have stood in Bardoli for generations.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/5] bg-[var(--bg-cream)] overflow-hidden rounded-[0px] shadow-md">
              <img
                src="/images/founder-rachana-kapadia.jpg"
                alt="Founder Rachana Kapadia"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="caption text-center mt-3 text-[var(--ink-soft)] italic">
              Rachana Kapadia · Founder & Custodian of Rangvanat
            </p>
          </div>
        </div>
      </section>

      {/* 2. Timeline Band (maroon-deep) (§12.6) */}
      <section className="w-full bg-[var(--brand-maroon-deep)] text-[var(--bg-cream)] py-16 mb-20">
        <div className="rv-container">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="eyebrow text-[var(--brand-gold-soft)] mb-2">Three Generations</p>
            <h2 className="heading-2 text-[var(--bg-ivory)] uppercase">The Thread of History</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-t border-[var(--brand-gold)]/40 pt-6 space-y-2">
              <span className="display-l text-[var(--brand-gold-soft)] font-bold">1942</span>
              <h3 className="heading-3 text-[var(--bg-ivory)] text-lg">The Swaraj Awakening</h3>
              <p className="body-s text-[var(--bg-cream)]/80">
                During the Bardoli Satyagraha, our great-grandmothers spun khadi as an act of non-violent rebellion and self-reliance.
              </p>
            </div>

            <div className="border-t border-[var(--brand-gold)]/40 pt-6 space-y-2">
              <span className="display-l text-[var(--brand-gold-soft)] font-bold">1984</span>
              <h3 className="heading-3 text-[var(--bg-ivory)] text-lg">The Natural Dye Revival</h3>
              <p className="body-s text-[var(--bg-cream)]/80">
                Rejecting petrochemical chemical vat dyes, our family revived indigenous fermentation recipes using wild indigo and pomegranate.
              </p>
            </div>

            <div className="border-t border-[var(--brand-gold)]/40 pt-6 space-y-2">
              <span className="display-l text-[var(--brand-gold-soft)] font-bold">2026</span>
              <h3 className="heading-3 text-[var(--bg-ivory)] text-lg">The Contemporary Atelier</h3>
              <p className="body-s text-[var(--bg-cream)]/80">
                Today, Rangvanat merges archival handloom weaves with architectural modern silhouettes for global connoisseurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Full Width Serif Pull Quote (§12.6) */}
      <section className="rv-container text-center py-10 max-w-3xl mb-20">
        <blockquote className="serif-statement text-2xl md:text-3xl text-[var(--brand-maroon)] leading-relaxed">
          "When you touch genuine khadi, you are not touching a product of industry; you are holding forty hours of human breathing, contemplation, and song."
        </blockquote>
      </section>

      {/* 4. Photo Essay Alternating Rows (§12.6) */}
      <section className="rv-container space-y-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <img
              src="/images/heritage-main.jpg"
              alt="Artisan hands on pit loom"
              className="w-full aspect-[4/3] object-cover rounded-[0px]"
            />
          </div>
          <div className="md:col-span-6 space-y-4">
            <p className="eyebrow text-[var(--brand-gold)]">The Human Rhythm</p>
            <h3 className="heading-2 text-[var(--brand-maroon)]">RHYTHM OF THE PIT LOOM</h3>
            <p className="body-l text-[var(--ink-chocolate)]">
              Unlike automatic electric looms that operate at violent velocities, the pit loom operates at the pace of the artisan's heartbeat. The wooden reed presses each weft yarn with just enough tension to allow the cotton fibres to expand and breathe.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 md:order-2">
            <img
              src="/images/heritage-detail.jpg"
              alt="Indigo dye fermentation"
              className="w-full aspect-[4/3] object-cover rounded-[0px]"
            />
          </div>
          <div className="md:col-span-6 md:order-1 space-y-4">
            <p className="eyebrow text-[var(--brand-gold)]">The Living Ferment</p>
            <h3 className="heading-2 text-[var(--brand-maroon)]">COLOURS SOURCED FROM EARTH</h3>
            <p className="body-l text-[var(--ink-chocolate)]">
              Our blues are alive. We ferment leaves of Indigofera tinctoria in subterranean terracotta jars fed with jaggery and alkaline ash. The cloth emerges green from the vat and blooms into deep, luminous azure as oxygen touches it in the morning breeze.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="rv-container text-center py-12 border-t border-[var(--line-khadi)]">
        <h2 className="heading-2 text-[var(--brand-maroon)] uppercase mb-4">
          Experience the Living Weave
        </h2>
        <button onClick={() => navigate({ page: 'shop' })} className="btn btn-primary btn-lg">
          Explore the Complete Collection
        </button>
      </section>
    </main>
  );
}
