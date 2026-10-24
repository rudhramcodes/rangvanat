import { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

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

  // Journal Index View (§12.8)
  const featured = filtered[0];
  const others = filtered.slice(1);

  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-12 md:py-16">
      <div className="rv-container">
        {/* Breadcrumbs */}
        <nav className="caption text-[var(--ink-soft)] mb-6 flex items-center gap-2">
          <button onClick={() => navigate({ page: 'home' })} className="hover:text-[var(--brand-maroon)]">
            Home
          </button>
          <span className="w-1 h-1 rounded-full bg-[var(--brand-gold)]" />
          <span className="text-[var(--brand-maroon)] font-semibold">Weavers' Journal</span>
        </nav>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="eyebrow text-[var(--brand-gold)] mb-1">Dispatches from Bardoli</p>
          <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl md:text-5xl">
            THE WEAVERS' CHRONICLE
          </h1>
          <p className="body-l text-[var(--ink-soft)] mt-3">
            Explorations into natural fermentation chemistry, handloom physics, and the living heritage of Indian khadi.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`h-9 px-4 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[var(--brand-maroon)] text-[var(--bg-ivory)]'
                    : 'bg-white border border-[var(--line-khadi)] text-[var(--ink-chocolate)] hover:border-[var(--brand-maroon)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Wide Article (§12.8) */}
        {featured && (
          <div
            onClick={() => setReadingArticle(featured)}
            className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[var(--bg-cream)]/50 p-6 md:p-8 rounded-[2px] mb-14 border border-[var(--line-khadi)]"
          >
            <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-[var(--bg-cream)]">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <span className="caption uppercase font-semibold text-[var(--brand-gold)]">
                Featured Dispatch · {featured.category}
              </span>
              <h2 className="heading-2 text-[var(--brand-maroon)] text-2xl md:text-3xl uppercase leading-tight group-hover:text-[var(--brand-maroon-deep)]">
                {featured.title}
              </h2>
              <p className="body-l text-[var(--ink-chocolate)]">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
                <span>{featured.date}</span>
                <span>•</span>
                <span>{featured.readTime}</span>
              </div>
              <button className="btn btn-primary btn-sm mt-2">Read Dispatch →</button>
            </div>
          </div>
        )}

        {/* 3-Column Grid for Rest (§12.8) */}
        {others.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {others.map((art) => (
              <div
                key={art.id}
                onClick={() => setReadingArticle(art)}
                className="group cursor-pointer flex flex-col bg-white border border-[var(--line-khadi)] p-5 rounded-[2px]"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[var(--bg-cream)] mb-4">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="caption uppercase text-[11px] font-semibold text-[var(--brand-gold)] mb-1">
                  {art.category}
                </span>
                <h3 className="heading-3 text-[17px] text-[var(--brand-maroon)] uppercase mb-2 group-hover:text-[var(--brand-maroon-deep)] line-clamp-2">
                  {art.title}
                </h3>
                <p className="body-s text-[var(--ink-chocolate)]/80 line-clamp-3 mb-4">{art.excerpt}</p>
                <div className="mt-auto pt-3 border-t border-[var(--line-khadi)] flex items-center justify-between text-xs text-[var(--ink-soft)]">
                  <span>{art.date}</span>
                  <span className="text-[var(--brand-maroon)] font-semibold">Read →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
