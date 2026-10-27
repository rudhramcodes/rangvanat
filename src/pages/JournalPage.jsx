import { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { useStore } from '../context/store.js';

const ARTICLES = [
  {
    id: 'indigo-winter',
    category: 'Indigo Vats',
    title: 'The Alchemy of Fermented Indigo in Winter',
    date: 'October 18, 2026',
    readTime: '4 min read',
    image: '/images/dyeing.jpg',
    excerpt:
      'How our master dyer wakes the submerged fermentation vats with sugarcane jaggery and alkaline ash in the morning chill of Bardoli.',
    body: [
      'Indigo is not a chemical solution; it is a bacterial culture. Unlike modern synthetic dye powders that dissolve into inert water, natural indigo leaves from Indigofera tinctoria must be fermented into a living micro-ecology.',
      'In our subterranean terracotta vats in Bardoli, our head dyer feeds the solution every dawn with pure country jaggery, lime, and tamarind water. When the vat is healthy, a metallic coppery froth forms on its surface—what our elders call the "indigo flower".',
      'When cotton yarn enters this anaerobic bath, it appears yellowish-green. Only when the weaver lifts the skein into the open autumn air does oxygen react with the indoxyl molecules, turning the thread into deep, unfading, celestial blue.',
    ],
    quote: '"Indigo cannot be rushed by industrial heaters. It sleeps when it is cold, and awakens only when respected."',
  },
  {
    id: 'khadi-physics',
    category: 'Khadi Science',
    title: 'Why Genuine Khadi Breathes Cooler in Sweltering Heat',
    date: 'September 29, 2026',
    readTime: '3 min read',
    image: '/images/spinning.jpg',
    excerpt:
      'The microscopic physics of hand-twisted cotton fibres and capillary air traps in genuine artisan handloom.',
    body: [
      'High-speed mill looms twist cotton under immense mechanical tension, crushing the hollow lumen of the cotton fibre into a stiff, flat ribbon. The result is a fabric that feels dense and traps body heat against the skin.',
      'In hand spinning on the charkha, the twist is gentle and variable. The natural air channel inside each cotton filament remains open. As you wear the garment, these micro-pores expand with body moisture, actively wicking heat away.',
      'This is why khadi has been praised as the original thermostatic fabric of the subcontinent—insulating in winter and breathing like living skin in thirty-eight-degree tropical heat.',
    ],
    quote: '"Synthetic clothing traps you in plastic; handloom khadi breathes with your lungs."',
  },
  {
    id: 'patola-lineage',
    category: 'Weaving Heritage',
    title: 'Preserving the Rare Patola Geometric Weave in Gujarat',
    date: 'September 12, 2026',
    readTime: '5 min read',
    image: '/images/heritage-main.jpg',
    excerpt:
      'Double-ikat geometric mathematical calculations carried through three generations of Bardoli artisan families.',
    body: [
      'In double ikat Patola weaving, both warp and weft threads are individually tie-dyed prior to being placed on the loom. A single mistake in the alignment of one millimetre will ruin an entire four-month weaving process.',
      'Our master weavers work without written computer blueprints; the intricate grid geometry is memorised as chanted metric verses recited during the throwing of the shuttle.',
      'At Rangvanat, we preserve these mathematical heirlooms, ensuring that the ancient architectural geometry of Gujarat is not lost to machine imitation.',
    ],
    quote: '"Each Patola border is not just cloth; it is high mathematics rendered in vegetable dyes."',
  },
  {
    id: 'artisan-women',
    category: 'Artisan Lives',
    title: 'The Women Spinners of Bardoli: Guardians of Independence',
    date: 'August 24, 2026',
    readTime: '4 min read',
    image: '/images/artisan2.jpg',
    excerpt:
      'How spinning on the amber charkha provides financial sovereignty to over 200 women across rural Gujarat.',
    body: [
      'In our village cluster, spinning is not merely a craft; it is financial independence. Over two hundred women run charkhas on their own verandahs, spinning between family responsibilities.',
      'Unlike factory labor with rigid punch clocks, our collective compensates artisans per hank of verified yarn at rates negotiated directly with community elders.',
    ],
    quote: '"A woman at the charkha is a sovereign household."',
  },
];

export default function JournalPage({ navigate }) {
  const { addToast } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [readingArticle, setReadingArticle] = useState(null);

  const categories = ['All', 'Indigo Vats', 'Khadi Science', 'Weaving Heritage', 'Artisan Lives'];

  const filtered =
    selectedCategory === 'All'
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === selectedCategory);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: readingArticle.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Article link copied to clipboard', 'success');
    }
  };

  // If reading an article, show Full Article View (§12.8)
  if (readingArticle) {
    return (
      <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-12">
        <div className="rv-container max-w-3xl">
          <button
            onClick={() => setReadingArticle(null)}
            className="btn-ghost text-sm flex items-center gap-2 text-[var(--brand-maroon)] mb-8"
          >
            <ArrowLeft size={16} />
            <span>Back to Journal Index</span>
          </button>

          <span className="caption uppercase font-semibold text-[var(--brand-gold)]">
            {readingArticle.category}
          </span>
          <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl md:text-5xl mt-2 mb-4 leading-tight">
            {readingArticle.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-[var(--ink-soft)] pb-6 border-b border-[var(--line-khadi)] mb-8">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {readingArticle.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {readingArticle.readTime}
            </span>
            <button
              onClick={handleShare}
              className="ml-auto text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)] flex items-center gap-1.5"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>

          <div className="aspect-[16/10] overflow-hidden bg-[var(--bg-cream)] mb-10 rounded-[0px]">
            <img
              src={readingArticle.image}
              alt={readingArticle.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Body Text */}
          <div className="space-y-6 body-l text-[var(--ink-chocolate)] leading-relaxed">
            {readingArticle.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}

            <blockquote className="serif-statement text-2xl text-[var(--brand-maroon)] border-l-2 border-[var(--brand-gold)] pl-6 my-8 italic">
              {readingArticle.quote}
            </blockquote>
          </div>

          <div className="mt-14 pt-8 border-t border-[var(--line-khadi)] text-center">
            <button onClick={() => setReadingArticle(null)} className="btn btn-secondary btn-md">
              ← Read More Stories
            </button>
          </div>
        </div>
      </main>
    );
  }

  const featured = filtered[0];
  const others = filtered.slice(1);
  return <main id="main-content" className="journal-page">
    <header><nav className="screen-breadcrumb" aria-label="Breadcrumb"><button onClick={() => navigate({ page: 'home' })}>Home</button><span>/</span><span>Journal</span></nav><h1>Notes from<br /><em>the atelier.</em></h1><p>Stories of cloth, colour and the people who make them.</p></header>
    <nav className="craft-tabs" aria-label="Journal topics">{categories.map(cat => <button key={cat} aria-pressed={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>{cat}</button>)}</nav>
    {featured && <article className="journal-feature"><div className="journal-image"><img src={featured.image} alt={featured.title} /></div><div><p className="journal-meta">{featured.category} · {featured.readTime}</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><button className="story-link" onClick={() => setReadingArticle(featured)}>Read the story →</button></div></article>}
    <section className="journal-grid" aria-label="More stories">{others.map(art => <article key={art.id}><div className="journal-image"><img src={art.image} alt={art.title} loading="lazy" /></div><p className="journal-meta">{art.category} · {art.readTime}</p><h2>{art.title}</h2><p>{art.excerpt}</p><button className="story-link" onClick={() => setReadingArticle(art)}>Read the story →</button></article>)}</section>
  </main>;
}
