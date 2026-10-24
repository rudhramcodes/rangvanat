import { useState } from 'react';
import { ArrowRight, Disc, Droplets, Grid, Layers } from 'lucide-react';

const CRAFT_STEPS = {
  spinning: {
    id: 'spinning',
    title: 'Hand Spinning',
    tagline: 'The Genesis of Yarn on the Amber Charkha',
    icon: Disc,
    heroImage: '/images/spinning.jpg',
    intro:
      'Everything starts with raw unbleached Indian Desi cotton. Drawn manually by women spinners in village courtyards, the fibres are gently coaxed into continuous yarn using traditional wooden and amber charkhas.',
    steps: [
      {
        num: '01',
        title: 'Gin & Card by Hand',
        desc: 'Cotton bolls are separated from seeds using wooden bow ginners that preserve the delicate staple length.',
        img: '/images/spinning.jpg',
      },
      {
        num: '02',
        title: 'Drawing the Roving',
        desc: 'Artisans roll the carded fluff into soft slivers called punis, primed for the spindle.',
        img: '/images/artisan1.jpg',
      },
      {
        num: '03',
        title: 'Spindle Twist Calibration',
        desc: 'By controlling hand wheel speed and arm extension, the spinner embeds natural twists that give khadi its capillary breathability.',
        img: '/images/3.webp',
      },
    ],
  },
  dyeing: {
    id: 'dyeing',
    title: 'Natural Dyeing',
    tagline: 'Fermenting the Living Colours of Earth',
    icon: Droplets,
    heroImage: '/images/dyeing.jpg',
    intro:
      'We do not use synthetic chemical powders or heavy metal fixatives. Our palette is extracted from wild roots, crushed leaves, madder bark, turmeric rhizomes, and fermented indigo vats.',
    steps: [
      {
        num: '01',
        title: 'Vat Inoculation',
        desc: 'Subterranean clay vessels are stirred twice daily with jaggery, lime, and organic fermentation starters.',
        img: '/images/dyeing.jpg',
      },
      {
        num: '02',
        title: 'Submersion & Oxidation',
        desc: 'Yarn hanks are dipped in oxygen-depleted vats; upon emergence, the air turns them from vibrant amber-green to deep indigo blue.',
        img: '/images/heritage-detail.jpg',
      },
      {
        num: '03',
        title: 'River Sun Cure',
        desc: 'Dyed yarns dry across bamboo poles beneath the Bardoli sun to temper and fix the molecular bonds.',
        img: '/images/finishing.jpg',
      },
    ],
  },
  weaving: {
    id: 'weaving',
    title: 'Pit Loom Weaving',
    tagline: 'The Rhythm of Warp, Weft and Treadle',
    icon: Grid,
    heroImage: '/images/heritage-main.jpg',
    intro:
      'Set into earthen pits to maintain the humidity required for un-sized natural cotton, our pit looms are operated by master weavers who synchronise hand shuttles with foot treadles.',
    steps: [
      {
        num: '01',
        title: 'Warp Dressing',
        desc: 'Hundreds of individual threads are stretched outdoors across wooden pegs in a day-long communal ritual.',
        img: '/images/heritage-main.jpg',
      },
      {
        num: '02',
        title: 'Reed & Heald Threading',
        desc: 'Each thread is drawn through eyes of healds and reed slots, forming the architectural matrix of the cloth.',
        img: '/images/3.webp',
      },
      {
        num: '03',
        title: 'Throwing the Shuttle',
        desc: 'The flying shuttle carries the weft back and forth at 80 beats per minute, weaving roughly four metres a day.',
        img: '/images/artisan2.jpg',
      },
    ],
  },
  finishing: {
    id: 'finishing',
    title: 'Block Finishing',
    tagline: 'Teakwood Blocks and Artisan Tailoring',
    icon: Layers,
    heroImage: '/images/finishing.jpg',
    intro:
      'Once off the loom, the cloth is hand-washed in natural river water and printed using hand-carved teakwood blocks steeped in gum arabica and iron mordants.',
    steps: [
      {
        num: '01',
        title: 'Block Carving',
        desc: 'Generational woodworkers chisel intricate floral and geometric motifs onto seasoned teakwood blocks.',
        img: '/images/finishing.jpg',
      },
      {
        num: '02',
        title: 'Hand Stamp Registration',
        desc: 'Master printers align blocks by eye, stamping rhythmic repeats with the heel of their palms.',
        img: '/images/heritage-detail.jpg',
      },
      {
        num: '03',
        title: 'Architectural Tailoring',
        desc: 'Our ateliers cut and stitch the finished cloth into timeless, editorial silhouettes.',
        img: '/images/hero.png',
      },
    ],
  },
};

export default function TheCraftPage({ initialStep = 'spinning', navigate }) {
  const [activeStepKey, setActiveStepKey] = useState(initialStep);
  const currentStep = CRAFT_STEPS[activeStepKey] || CRAFT_STEPS.spinning;

  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-10 md:py-16">
      <div className="rv-container">
        {/* Breadcrumbs */}
        <nav className="caption text-[var(--ink-soft)] mb-6 flex items-center gap-2">
          <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
            Home
          </button>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <span className="text-[var(--brand-maroon)] font-semibold">The Craft</span>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <span className="capitalize">{currentStep.title}</span>
        </nav>

        {/* Header Zone */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="eyebrow text-[var(--brand-gold)] mb-2">The Four Rituals of Bardoli</p>
          <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl md:text-5xl">
            THE ANATOMY OF HANDLOOM
          </h1>
          <p className="body-l text-[var(--ink-soft)] mt-3">
            Every garment journeys through four sacred artisanal stages before it ever touches your wardrobe.
          </p>

          {/* Interactive Stage Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {Object.keys(CRAFT_STEPS).map((key) => {
              const item = CRAFT_STEPS[key];
              const Icon = item.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveStepKey(key)}
                  className={`h-11 px-5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeStepKey === key
                      ? 'bg-[var(--brand-maroon)] text-[var(--bg-ivory)] shadow-sm'
                      : 'bg-white border border-[var(--line-khadi)] text-[var(--ink-chocolate)] hover:border-[var(--brand-maroon)]'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Craft Stage Feature (§12.7) */}
        <div className="space-y-16">
          {/* Hero Banner for this Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="caption text-[var(--brand-gold)] uppercase font-semibold">
                Stage {activeStepKey === 'spinning' ? '01' : activeStepKey === 'dyeing' ? '02' : activeStepKey === 'weaving' ? '03' : '04'}
              </span>
              <h2 className="heading-1 text-[var(--brand-maroon)] uppercase">{currentStep.tagline}</h2>
              <p className="body-l text-[var(--ink-chocolate)] leading-relaxed">{currentStep.intro}</p>
            </div>
            <div className="lg:col-span-6">
              <div className="aspect-[4/3] bg-[var(--bg-cream)] overflow-hidden rounded-[0px] shadow-sm">
                <img
                  src={currentStep.heroImage}
                  alt={currentStep.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Three Process Step Blocks with Gold Display Numerals (§12.7) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[var(--line-khadi)]">
            {currentStep.steps.map((s, idx) => (
              <div key={idx} className="bg-white p-6 border border-[var(--line-khadi)] rounded-[2px] space-y-3">
                <span className="display-l text-[var(--brand-gold)] font-bold">{s.num}</span>
                <h3 className="heading-3 text-[var(--brand-maroon)] uppercase text-lg">{s.title}</h3>
                <p className="body-s text-[var(--ink-chocolate)]/90 leading-relaxed">{s.desc}</p>
                <div className="aspect-[16/10] overflow-hidden bg-[var(--bg-cream)] mt-3">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>

          {/* Next Process Stage Teaser (§12.7) */}
          <div className="p-8 md:p-12 bg-[var(--bg-tan)] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-6 border border-[var(--line-khadi)]">
            <div>
              <p className="caption text-[var(--brand-maroon)] uppercase font-semibold">Next Stage in the Loom</p>
              <h3 className="heading-2 text-[var(--ink-chocolate)] text-2xl uppercase">
                {activeStepKey === 'spinning'
                  ? 'Stage 2: Natural Fermented Dyeing'
                  : activeStepKey === 'dyeing'
                  ? 'Stage 3: Pit Loom Weaving'
                  : activeStepKey === 'weaving'
                  ? 'Stage 4: Teakwood Block Finishing'
                  : 'Stage 1: Hand Spinning on the Charkha'}
              </h3>
            </div>
            <button
              onClick={() => {
                const keys = Object.keys(CRAFT_STEPS);
                const nextIdx = (keys.indexOf(activeStepKey) + 1) % keys.length;
                setActiveStepKey(keys[nextIdx]);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className="btn btn-primary btn-md whitespace-nowrap"
            >
              <span>Explore Next Process</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
