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
  return <main id="main-content" className="craft-page">
    <header><nav className="screen-breadcrumb" aria-label="Breadcrumb"><a href="/" onClick={e => { e.preventDefault(); navigate({ page: 'home' }); }}>Home</a><span>/</span><span>The craft</span></nav><h1>The hands behind<br /><em>every thread.</em></h1><p>Follow the making, from the first spun yarn to the final stitch.</p></header>
    <nav className="craft-tabs" aria-label="Craft stages">{Object.entries(CRAFT_STEPS).map(([key, item]) => <button key={key} aria-pressed={activeStepKey === key} onClick={() => setActiveStepKey(key)}>{item.title}</button>)}</nav>
    <section className="craft-feature" key={currentStep.title}><img src={currentStep.heroImage} alt={currentStep.title} /><div><h2>{currentStep.tagline}</h2><p>{currentStep.intro}</p></div></section>
    <section className="craft-process">{currentStep.steps.map(s => <article key={s.title}><img src={s.img} alt={s.title} loading="lazy" /><h3>{s.title}</h3><p>{s.desc}</p></article>)}</section>
    <section className="editorial-close"><h2>Made to be lived in.</h2><button className="btn-primary" onClick={() => navigate({ page: 'shop' })}>Discover the pieces <ArrowRight size={18} /></button></section>
  </main>;
}
