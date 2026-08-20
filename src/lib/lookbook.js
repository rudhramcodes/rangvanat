/**
 * Rangvanat Lookbook — all products & collections from the official booklet.
 *
 * 📸 IMAGE LINKS:
 * Paste your Cloudinary URLs into the `image` field of each product below.
 * Empty ("") shows the styled khadi-weave placeholder frame automatically.
 * This is the ONLY file you need to edit to swap in images.
 */

export const COLLECTIONS = [
  {
    id: 'flora',
    name: 'The Flora Edit',
    mood: 'Gardens, blooms and peacocks. Nature rendered in khadi.',
    count: 8,
    image: '', // ← cover image (Cloudinary URL)
  },
  {
    id: 'sacred',
    name: 'The Sacred Edit',
    mood: 'Symbols, epics and devotion — woven into thread.',
    count: 9,
    image: '',
  },
  {
    id: 'folk',
    name: 'The Folk Edit',
    mood: 'Folk art, tribal rhythm and the hand-painted line.',
    count: 7,
    image: '',
  },
  {
    id: 'heritage',
    name: 'The Heritage Edit',
    mood: 'Patola, Jamdani and mirror work. Craft with a lineage.',
    count: 5,
    image: '',
  },
  {
    id: 'denim',
    name: 'The Denim Edit',
    mood: 'Raw denim khadi, reimagined for today.',
    count: 4,
    image: '',
  },
  {
    id: 'modern',
    name: 'The Modern Edit',
    mood: 'Contemporary silhouettes with a heritage soul.',
    count: 3,
    image: '',
  },
]

export const CATEGORIES = [
  'Designer Fabric',
  'Corset',
  'Co-ord Set',
  'Jacket',
  'Dress',
  'Skirt & Top',
  'Bottom',
  'Saree',
  'Dupatta',
  "Men's Wear",
]

export const PRODUCTS = [
  // ───────────────────────── DESIGNER FABRICS ─────────────────────────
  {
    id: 'rvf-01',
    code: 'RVF-01',
    name: 'The Majestic Elephant',
    category: 'Designer Fabric',
    collection: 'folk',
    inspiredBy: [
      'The majestic Indian elephant',
      'The beauty of traditional folk illustration',
      'The harmony of flora & fauna',
    ],
    specs: [
      '100% Authentic Khadi',
      'Elephant & Nature-Inspired Digital Print',
      'Intricate Folk-Style Line Art',
      'Elegant Ivory & Earthy Beige Palette',
      'Birds, Trees & Decorative Floral Motifs',
      'Ideal for Bespoke & Designer Creations',
      'Crafted in India',
    ],
    description:
      'Inspired by the majestic elephant and the enchanting flora and fauna of India, intricate folk-inspired illustrations are digitally printed on Authentic Khadi, creating a subtle yet distinctive expression of Indian heritage.',
    tagline: 'Majestic Heritage. Naturally Khadi.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVF-01.avif', // ← Cloudinary URL
  },
  {
    id: 'rvf-02',
    code: 'RVF-02',
    name: 'The Graceful Peacock',
    category: 'Designer Fabric',
    collection: 'flora',
    inspiredBy: [
      'The timeless elegance of the Indian peacock',
      'The serenity of blooming gardens',
      'The beauty of nature in neutral tones',
    ],
    specs: [
      '100% Authentic Khadi',
      'Peacock & Floral Digital Print',
      'Elegant Beige & Ivory Palette',
      'Nature-Inspired All-Over Pattern',
      'Soft, Earthy Contemporary Aesthetic',
      'Ideal for Bespoke & Designer Creations',
      'Crafted in India',
    ],
    description:
      'Inspired by the graceful peacock amidst blooming foliage, this delicate digital print transforms Authentic Khadi into an understated expression of Indian nature and contemporary luxury.',
    tagline: "Nature's Grace. Woven in Khadi.",
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVF-02.5.avif',
  },
  {
    id: 'rvf-03',
    code: 'RVF-03',
    name: 'Jute Border Floral',
    category: 'Designer Fabric',
    collection: 'flora',
    inspiredBy: [
      'The raw beauty of natural textures',
      'The simplicity of Indian floral motifs',
      'The warmth of earthy craftsmanship',
    ],
    specs: [
      '100% Authentic Khadi',
      'Delicate Floral Digital Print',
      'Natural Jute-Effect Border',
      'Elegant Ivory & Earthy Beige Palette',
      'Textured Heritage-Inspired Finish',
      'Ideal for Bespoke & Designer Creations',
      'Crafted in India',
    ],
    description:
      'Delicate floral motifs meet a rustic jute-effect border on Authentic Khadi, creating a refined designer fabric that blends natural texture with contemporary elegance.',
    tagline: 'Earthy Texture. Timeless Khadi.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVF-03.avif',
  },
  {
    id: 'rvf-04',
    code: 'RVF-04',
    name: 'Garden Stories Print',
    category: 'Designer Fabric',
    collection: 'flora',
    inspiredBy: [
      "The serenity of India's garden landscapes",
      'The graceful beauty of birds & blossoms',
      'The timeless charm of nature-inspired artistry',
    ],
    specs: [
      '100% Authentic Khadi',
      'Nature-Inspired Digital Print',
      'Delicate Tree, Bird & Floral Motifs',
      'Statement Botanical Border',
      'Elegant Ivory & Earthy Beige Palette',
      'Heritage-Inspired Contemporary Design',
      'Ideal for Bespoke & Designer Creations',
      'Crafted in India',
    ],
    description:
      'Inspired by serene Indian gardens, graceful birds, flowering trees, and delicate botanical forms come together in an earthy digital print on Authentic Khadi, finished with a statement nature-inspired border.',
    tagline: 'Garden Stories. Woven in Khadi.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVF-04.avif',
  },

  // ───────────────────────── CORSET ─────────────────────────
  {
    id: 'rvc-01',
    code: 'RVC-01',
    name: 'Lotus & Tulsi Corset',
    category: 'Corset',
    collection: 'sacred',
    inspiredBy: [
      'The grace of Krishna',
      'The purity of the Lotus',
      'The sacred simplicity of Tulsi',
    ],
    specs: [
      '100% Authentic Khadi',
      'Lotus-Inspired Hand Embroidery',
      'Traditional Amlo Tanko Embroidery',
      'Original Tulsi Bead Embellishments',
      'Contemporary Corset Silhouette',
      'Handcrafted in India',
    ],
    description:
      'Inspired by the grace of Krishna and the sacred purity of the lotus and tulsi — hand-embroidered on Authentic Khadi with traditional Amlo Tanko work and original tulsi beads, shaped into a contemporary corset silhouette.',
    tagline: 'Sacred Grace. Woven in Khadi.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213008/RVC-01.avif',
  },

  // ───────────────────────── CO-ORD SETS ─────────────────────────
  // {
  //   id: 'rvcs-01',
  //   code: 'RVCS-01',
  //   name: 'Earthy Geometry Co-ord',
  //   category: 'Co-ord Set',
  //   collection: 'folk',
  //   inspiredBy: [
  //     'The bold geometry of Indian folk artistry',
  //     'The warmth of earthy tones',
  //     'The beauty of handcrafted traditions',
  //   ],
  //   specs: [
  //     '100% Authentic Khadi',
  //     'Heritage-Inspired Hand Painting',
  //     'Earthy Brown & Beige Geometric Motifs',
  //     'Natural Wooden Button Detailing',
  //     'Contemporary Shirt & Pant Silhouette',
  //     'Hand-Painted & Crafted in India',
  //   ],
  //   description:
  //     'Inspired by the rhythmic geometry and earthy palette of Indian folk artistry — individually hand-painted on Authentic Khadi, complemented with natural wooden buttons for a contemporary co-ord look.',
  //   tagline: 'Earthy Roots. Modern Rhythm.',
  //   image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVC-01.avif',
  // },
  // {
  //   id: 'rvcs-02',
  //   code: 'RVCS-02',
  //   name: 'Seven Chakra Co-ord',
  //   category: 'Co-ord Set',
  //   collection: 'sacred',
  //   inspiredBy: [
  //     'The harmony of the Seven Chakras',
  //     'The balance of mind, body & spirit',
  //     'The vibrant energy of inner well-being',
  //   ],
  //   specs: [
  //     '100% Authentic Khadi',
  //     'Hand-Painted Seven Chakra-Inspired Detailing',
  //     'Seven Chakra Wooden Buttons',
  //     'Vibrant Symbolic Colour Accents',
  //     'Contemporary Co-ord Silhouette',
  //     'Hand-Painted & Crafted in India',
  //   ],
  //   description:
  //     'Inspired by the Seven Chakras, symbolizing balance, energy, and inner harmony — hand-painted on Authentic Khadi and thoughtfully detailed with Seven Chakra wooden buttons for the modern woman.',
  //   tagline: 'Seven Energies. One Harmony.',
  //   image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVCS-02.avif',
  // },
  {
    id: 'rvcs-03',
    code: 'RVCS-03',
    name: 'Pearl & Blossom Co-ord',
    category: 'Co-ord Set',
    collection: 'flora',
    inspiredBy: [
      'The freshness of delicate blossoms',
      'The purity of white Khadi',
      'The timeless elegance of pearls',
    ],
    specs: [
      '100% Authentic White Khadi',
      'Delicate Floral Hand Embroidery',
      'Soft Blue & Green Thread Detailing',
      'Hand-Applied Pearl Embellishments',
      'Contemporary Co-ord Silhouette',
      'Handcrafted in India',
    ],
    description:
      'Inspired by delicate blossoms, the purity of white Khadi, and the timeless elegance of pearls — hand-embroidered with soft blue and green threads and finished with hand-applied pearl embellishments.',
    tagline: 'Pure White. Pearl Grace.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVC-03.avif',
  },
  {
    id: 'rvcs-04',
    code: 'RVCS-04',
    name: 'Denim Flora Co-ord',
    category: 'Co-ord Set',
    collection: 'denim',
    inspiredBy: [
      'The untamed beauty of Indian nature',
      'The storytelling charm of folk art',
      'The bold spirit of modern India',
    ],
    specs: [
      '100% Authentic Denim Khadi',
      'Exclusive Heritage-Inspired Digital Print',
      'Artistic Birds, Blooms & Botanical Motifs',
      'Rich Terracotta & Earth-Toned Detailing',
      'Contemporary Co-ord Silhouette',
      'Crafted in India',
    ],
    description:
      'Where the rugged character of Denim Khadi meets the poetic beauty of Indian nature — digitally illustrated with birds and blossoms, creating a bold dialogue between heritage and contemporary fashion.',
    tagline: 'Denim Reimagined. Heritage Reborn.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVC-04.avif',
  },
  {
    id: 'rvcs-05',
    code: 'RVCS-05',
    name: 'Gamosa Heritage Co-ord',
    category: 'Co-ord Set',
    collection: 'folk',
    inspiredBy: [
      'The heritage of Assamese Gamosa',
      'Traditional geometric folk motifs',
      'The textile artistry of Northeast India',
    ],
    specs: [
      '100% Authentic Khadi',
      'Gamosa-Inspired Machine Embroidery',
      'Traditional Geometric Folk Motifs',
      'Rich Maroon Thread Detailing',
      'Embroidered Collar & Border Accents',
      'Contemporary Co-ord Silhouette',
      'Crafted in India',
    ],
    description:
      "Inspired by the rich textile heritage of Assam, this Authentic Khadi co-ord features machine embroidery inspired by traditional Gamosa geometric motifs, thoughtfully reimagined for the contemporary woman.",
    tagline: 'Threads of Assam. Spirit of Modern India.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVC-05.avif',
  },
  {
    id: 'rvcs-06',
    code: 'RVCS-06',
    name: 'Sacred Geometry Co-ord',
    category: 'Co-ord Set',
    collection: 'sacred',
    inspiredBy: [
      'The rhythm of sacred Indian geometry',
      'The serenity of ivory Khadi',
      'The beauty of repetition & balance',
    ],
    specs: [
      '100% Authentic Khadi',
      'Sacred Geometry-Inspired Machine Embroidery',
      'Rhythmic Petal Border Detailing',
      'Earthy Brown & Ochre Thread Accents',
      'Fabric-Covered Buttons',
      'Sculpted Statement Sleeves',
      'Contemporary Co-ord Silhouette',
      'Crafted in India',
    ],
    description:
      'Inspired by the rhythm, symmetry, and balance of Indian ornamental geometry — delicately machine-embroidered along the edges of Authentic Khadi, where minimalism becomes the canvas for heritage.',
    tagline: 'Sacred Rhythm. Modern Form.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVC-06.avif',
  }, 

  // Add RVCS-07 here if needed

  // ───────────────────────── JACKETS ─────────────────────────
  {
    id: 'rvj-01',
    code: 'RVJ-01',
    name: 'Elephant Mandala Jacket',
    category: 'Jacket',
    collection: 'folk',
    inspiredBy: [
      'The gentle strength of the Indian elephant',
      'The meditative beauty of Mandala art',
      'The timeless harmony of black & ivory',
    ],
    specs: [
      '100% Authentic Khadi',
      'Elephant & Mandala-Inspired Hand Painting',
      'Intricate Black-on-Ivory Artistic Detailing',
      'Contrast Black Border Accents',
      'Contemporary Sleeveless Jacket Silhouette',
      'Individually Hand-Painted & Crafted in India',
    ],
    description:
      'Inspired by the strength and wisdom of the elephant and the harmony of Mandala-inspired artistry — individually hand-painted on Authentic Khadi, creating a bold yet timeless statement for the modern wardrobe.',
    tagline: 'Wisdom in Art. Heritage in Style.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVJ-01.avif',
  },
  {
    id: 'rvj-02',
    code: 'RVJ-02',
    name: 'Embroidered Jacket & Shirt',
    category: 'Jacket',
    collection: 'modern',
    inspiredBy: [
      'The bold geometry of Indian textile traditions',
      'The vibrant rhythm of tribal artistry',
      'The harmony of heritage & contemporary layering',
    ],
    specs: [
      '100% Authentic Khadi',
      'Heritage-Inspired Machine Embroidered Jacket',
      'Vibrant Geometric Motifs',
      'Rich Red, Navy & Mustard Thread Detailing',
      'Coordinated Authentic Khadi Shirt',
      'Natural Button Detailing',
      'Contemporary Layered Silhouette',
      'Crafted in India',
    ],
    description:
      'Inspired by the bold geometry and rhythm of Indian textile artistry — machine-embroidered on Authentic Khadi and paired with a refined Khadi shirt, creating a distinctive contemporary layered ensemble.',
    tagline: 'Layered in Heritage. Styled for Today.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVJ-02.avif',
  },
  {
    id: 'rvj-03',
    code: 'RVJ-03',
    name: 'Denim Floral Long Jacket',
    category: 'Jacket',
    collection: 'denim',
    inspiredBy: [
      'The serenity of blue & ivory',
      "The beauty of India's blooming gardens",
      'The contemporary character of Denim Khadi',
    ],
    specs: [
      '100% Authentic Denim Khadi',
      'Floral-Inspired Digital Print',
      'Delicate Blue-on-Ivory Botanical Motifs',
      'Minimal Solid Khadi Border Detailing',
      'Contemporary Long Jacket Silhouette',
      'Crafted in India',
    ],
    description:
      'Where the distinctive texture of Denim Khadi meets the serenity of blooming florals — digitally printed in graceful blue tones and reimagined as a contemporary long jacket.',
    tagline: 'Denim in Bloom. Heritage in Motion.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVJ-03.avif',
  },
  {
    id: 'rvj-04',
    code: 'RVJ-04',
    name: 'Statement Jacket & Open Shirt',
    category: 'Jacket',
    collection: 'modern',
    inspiredBy: [
      'The bold rhythm of Indian geometric artistry',
      'The vibrant beauty of nature & folk expression',
      'The freedom of contemporary layering',
    ],
    specs: [
      '100% Authentic Khadi',
      'Heritage-Inspired Digital Print',
      'Geometric, Floral & Nature-Inspired Motifs',
      'Rich Earthy & Vibrant Colour Palette',
      'Statement Jacket with Coordinated Open Shirt',
      'Contemporary Layered Silhouette',
      'Crafted in India',
    ],
    description:
      'Inspired by the vibrant colours and artistic rhythms of India — digitally printed on Authentic Khadi and reimagined as a statement jacket paired with a flowing open shirt, bringing heritage into a bold contemporary form.',
    tagline: 'Heritage Unbound. Style Reimagined.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVJ-04.avif',
  },
  {
    id: 'rvj-05',
    code: 'RVJ-05',
    name: 'Tribal Spirit Jacket',
    category: 'Jacket',
    collection: 'folk',
    inspiredBy: [
      'The simplicity of Indian tribal life',
      'The harmony between people & nature',
      'The joyful colours of folk expression',
    ],
    specs: [
      '100% Authentic Khadi',
      'Tribal-Inspired Digital Print',
      'Human, Bird, Tree & Nature Motifs',
      'Vibrant Teal, Mustard & Orange Accents',
      'Hand-Applied Natural Cowrie Shell Embellishments',
      'Contemporary Sleeveless Jacket Silhouette',
      'Crafted in India',
    ],
    description:
      'Inspired by the joyful spirit of Indian tribal life and its deep connection with nature — digitally printed on Authentic Khadi and enhanced with hand-applied natural cowrie shells, bringing traditional folk expression into contemporary wearable art.',
    tagline: 'Tribal Spirit. Wearable Art.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVJ-05.avif',
  },
  {
    id: 'rvj-06',
    code: 'RVJ-06',
    name: 'Mirror-Work Long Jacket',
    category: 'Jacket',
    collection: 'heritage',
    inspiredBy: [
      'The purity of ivory Khadi',
      'The sparkle of traditional mirror artistry',
      'The sophistication of contemporary tailoring',
    ],
    specs: [
      '100% Authentic Khadi',
      'Mirror-Work Inspired Border Detailing',
      'Intricate White-on-White Embroidery',
      'Reflective Mirror Embellishments',
      'Statement Belted Long Jacket Silhouette',
      'Contemporary Tailored Finish',
      'Handcrafted in India',
    ],
    description:
      'Inspired by the luminous beauty of traditional Indian mirror work, delicately crafted in a monochromatic ivory palette on Authentic Khadi — transforming heritage embellishment into refined contemporary luxury.',
    tagline: 'Reflecting Heritage. Defining Elegance.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVJ-06.avif',
  },
  {
    id: 'rvj-07',
    code: 'RVJ-07',
    name: 'Maroon Floral Jacket',
    category: 'Jacket',
    collection: 'flora',
    inspiredBy: [
      'The timeless beauty of Indian florals',
      'The elegance of nature in bloom',
      'The harmony of simplicity & craftsmanship',
    ],
    specs: [
      '100% Authentic Khadi',
      'Floral Machine Embroidery',
      'Rich Maroon Thread Detailing',
      'Delicate Contrast Edge Finish',
      'Contemporary Sleeveless Jacket Silhouette',
      'Crafted in India',
    ],
    description:
      'Inspired by the timeless beauty of blooming Indian florals — intricately embroidered in rich maroon threads on Authentic Khadi and shaped into a contemporary jacket that celebrates nature with understated elegance.',
    tagline: 'Nature in Bloom. Heritage in Style.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVJ-07.avif',
  },
  // {
  //   id: 'rvj-08',
  //   code: 'RVJ-08',
  //   name: 'Ivory Mirror-Work Jacket',
  //   category: 'Jacket',
  //   collection: 'heritage',
  //   inspiredBy: [
  //     'The purity of ivory Khadi',
  //     'The elegance of contemporary Indian minimalism',
  //     'The beauty of delicate handcrafted details',
  //   ],
  //   specs: [
  //     '100% Authentic Khadi',
  //     'Delicate Mirror-Work Detailing',
  //     'Elegant Lapel Collar',
  //     'Statement Layered Hemline',
  //     'Waist-Tie Belt',
  //     'Contemporary Jacket Silhouette',
  //     'Handcrafted in India',
  //   ],
  //   description:
  //     'Authentic Khadi is elevated with delicate mirror-work detailing and a modern layered silhouette, creating an understated statement of Indian craftsmanship and contemporary elegance.',
  //   tagline: 'Pure Khadi. Refined Elegance.',
  //   image: '',
  // },

  // ───────────────────────── DRESSES ─────────────────────────
  {
    id: 'rvd-01',
    code: 'RVD-01',
    name: 'Geometric Print Long Dress',
    category: 'Dress',
    collection: 'modern',
    inspiredBy: [
      'The vibrant colours of India',
      'The rhythm of geometric artistry',
      'The timeless beauty of indigenous textile traditions',
    ],
    specs: [
      '100% Authentic Khadi',
      'Heritage-Inspired Digital Print',
      'Vibrant Geometric Motifs',
      'Symmetrical Border Detailing',
      'Contemporary Floor-Length Silhouette',
      'Handcrafted in India',
    ],
    description:
      "Inspired by India's vibrant colours and rhythmic geometric artistry — digitally printed on Authentic Khadi and transformed into an elegant silhouette for the modern woman.",
    tagline: 'Vibrant Heritage. Modern Elegance.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVD-01.avif',
  },
  {
    id: 'rvd-02',
    code: 'RVD-02',
    name: 'Tree of Life Long Dress',
    category: 'Dress',
    collection: 'sacred',
    inspiredBy: [
      'The timeless Tree of Life',
      'The strength of our roots',
      'Growth, prosperity & new beginnings',
    ],
    specs: [
      '100% Authentic Khadi',
      'Tree of Life-Inspired Machine Embroidery',
      'Earthy Gold & Brown Thread Detailing',
      'Nature-Inspired Motifs',
      'Contemporary Floor-Length Silhouette',
      'Crafted in India',
    ],
    description:
      'Inspired by the timeless Tree of Life and the strength of our roots — machine-embroidered in earthy gold and brown threads on Authentic Khadi, a floor-length celebration of growth and new beginnings.',
    tagline: 'Rooted in Heritage. Growing with Grace.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVD-02.avif',
  },
  {
    id: 'rvd-03',
    code: 'RVD-03',
    name: 'Blue Floral Midi Dress',
    category: 'Dress',
    collection: 'flora',
    inspiredBy: [
      'The delicacy of Indian floral artistry',
      'The purity of white Khadi',
      'The elegance of timeless craftsmanship',
    ],
    specs: [
      '100% Authentic White Khadi',
      'Floral-Inspired Machine Embroidery',
      'Elegant Blue Thread Detailing',
      'Embroidery Inspired by Traditional Border Motifs',
      'Contemporary Midi-Length Silhouette',
      'Crafted in India',
    ],
    description:
      'Inspired by delicate floral motifs and the serene purity of white — beautifully machine-embroidered on Authentic Khadi and reimagined as a contemporary midi dress for the modern woman.',
    tagline: 'Pure Heritage. Contemporary Grace.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVD-03.avif',
  },
  {
    id: 'rvd-04',
    code: 'RVD-04',
    name: 'Birds & Blooms Long Dress',
    category: 'Dress',
    collection: 'flora',
    inspiredBy: [
      'The vibrant gardens of India',
      'The beauty of birds, blooms & nature',
      'The richness of Indian decorative artistry',
    ],
    specs: [
      '100% Authentic Khadi',
      'Heritage-Inspired Digital Print',
      'Birds, Floral & Nature-Inspired Motifs',
      'Vibrant Multicolour Panel Detailing',
      'Contemporary Floor-Length Silhouette',
      'Crafted in India',
    ],
    description:
      "Inspired by India's vibrant gardens and the beauty of birds, blooms and nature — digitally printed on Authentic Khadi with rich multicolour panel detailing, transformed into an elegant floor-length silhouette for the modern woman.",
    tagline: 'Gardens in Bloom. Woven in Khadi.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVD-04.avif',
  },
  {
    id: 'rvd-05',
    code: 'RVD-05',
    name: 'Folk Hand-Painted Midi Dress',
    category: 'Dress',
    collection: 'folk',
    inspiredBy: [
      'The bold geometry of Indian folk artistry',
      'The warmth of earthy colours',
      'The rhythm of traditional patterns',
    ],
    specs: [
      '100% Authentic Khadi',
      'Heritage-Inspired Hand Painting',
      'Intricate Geometric Motifs',
      'Earthy & Vibrant Colour Detailing',
      'Contemporary Midi-Length Silhouette',
      'Hand-Painted & Crafted in India',
    ],
    description:
      'Inspired by the bold geometry and earthy colours of traditional Indian artistry — individually hand-painted on Authentic Khadi and reimagined in a contemporary midi silhouette for the modern woman.',
    tagline: 'Painted by Hand. Rooted in Heritage.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVD-05.avif',
  },

  // ───────────────────────── SKIRT & TOP ─────────────────────────
  // {
  //   id: 'rvst-01',
  //   code: 'RVST-01',
  //   name: 'Pastel Floral Skirt & Top',
  //   category: 'Skirt & Top',
  //   collection: 'flora',
  //   inspiredBy: [
  //     'The charm of youthful femininity',
  //     'The softness of blooming flowers',
  //     'The freshness of pastel colours',
  //   ],
  //   specs: [
  //     '100% Authentic White Khadi',
  //     'Pastel Floral Machine Embroidery',
  //     'Delicate Pink, Lavender & Green Thread Detailing',
  //     'Scalloped Embroidered Accents',
  //     'Fresh & Girlish Skirt-Top Silhouette',
  //     'Crafted in India',
  //   ],
  //   description:
  //     'Inspired by delicate blossoms, soft pastel hues, and the playful charm of youthful femininity — beautifully machine-embroidered on Authentic White Khadi for a fresh, graceful, and contemporary look.',
  //   tagline: 'Playful Blooms. Timeless Khadi.',
  //   image: '',
  // },

  // ───────────────────────── BOTTOMS ─────────────────────────
  {
    id: 'rvb-01',
    code: 'RVB-01',
    name: 'Shankh Designer Bottom',
    category: 'Bottom',
    collection: 'sacred',
    inspiredBy: [
      'The sacred Shankh (Conch)',
      'The simplicity of Indian spiritual artistry',
    ],
    specs: [
      '100% Authentic Khadi',
      'Shankh-Inspired Hand-Painted Motifs',
      'Minimal All-Over Artistic Detailing',
      'Elegant Ivory & Earthy Maroon Palette',
      'Contemporary Flared Bottom Silhouette',
      'Hand-Painted & Handcrafted in India',
    ],
    description:
      'Inspired by the Shankh, a timeless symbol of purity and auspiciousness, delicate motifs are individually hand-painted on Authentic Khadi, blending spiritual heritage with contemporary style.',
    tagline: 'Sacred Symbol. Contemporary Khadi.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213008/RVB-01.avif',
  },
  {
    id: 'rvb-02',
    code: 'RVB-02',
    name: 'Raw Denim Khadi Bottom',
    category: 'Bottom',
    collection: 'denim',
    inspiredBy: [
      'The raw character of Khadi',
      'The simplicity of contemporary denim styling',
    ],
    specs: [
      '100% Authentic Raw Denim Khadi',
      'Minimal Plain Design',
      'Contrast Stitch-Line Detailing',
      'Functional Front Pockets',
      'Contemporary Flared Silhouette',
      'Crafted in India',
    ],
    description:
      'Authentic Raw Denim Khadi is shaped into a clean flared bottom with minimal detailing, bringing together the soul of Khadi and the effortless character of denim.',
    tagline: 'Raw Khadi. Modern Form.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213008/RVB-02.avif',
  },

  // ───────────────────────── SAREES ─────────────────────────
  {
    id: 'rvs-01',
    code: 'RVS-01',
    name: 'Patola-Inspired Designer Saree',
    category: 'Saree',
    collection: 'heritage',
    inspiredBy: [
      'The timeless beauty of Patola artistry',
      "The vibrant colours of Gujarat's textile heritage",
      'The richness of traditional Indian craftsmanship',
    ],
    specs: [
      '100% Authentic Khadi',
      'Patola-Inspired Digital Print',
      'Traditional Embroidery Detailing',
      'Intricate Mirror & Decorative Handwork',
      'Rich Green, Red & Multicolour Heritage Palette',
      'Handcrafted Tassel Embellishments',
      'Coordinated Designer Blouse',
      'Crafted in India',
    ],
    description:
      "Inspired by the vibrant visual language of Gujarat's Patola tradition, traditional motifs are reimagined through digital printing on Authentic Khadi and enriched with embroidery, mirror detailing, and handcrafted tassels — bringing Gujarati textile heritage into a distinctive contemporary expression.",
    tagline: 'Patola Inspired. Khadi Reimagined.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVS-01.avif',
  },
  {
    id: 'rvs-02',
    code: 'RVS-02',
    name: 'Ramayana 51 Chaupais Saree',
    category: 'Saree',
    collection: 'sacred',
    inspiredBy: [
      'The timeless wisdom of the Ramayana',
      'The sacred beauty of Indian storytelling',
      'The artistic expression of Mehndi-inspired illustration',
    ],
    specs: [
      '100% Authentic Khadi',
      '51 Ramayana Chaupais Artistically Presented',
      'Mehndi-Inspired Ramayana Digital Print',
      'Ramayana Scenes Illustrated in Mehndi Art Style',
      'Intricate Narrative & Sacred Motifs',
      'Elegant Ivory & Earthy Gold Palette',
      'Heritage Storytelling Pallu',
      'Crafted in India',
    ],
    description:
      'Inspired by the sacred journey of the Ramayana, 51 Chaupais are artistically presented alongside Mehndi-inspired illustrations and digitally printed on Authentic Khadi, transforming scripture, art, and textile heritage into a soulful piece of wearable storytelling.',
    tagline: '51 Chaupais. One Sacred Story. Woven into Khadi.',
    image: '',
  },

  // ───────────────────────── DUPATTAS ─────────────────────────
  {
    id: 'rvdt-01',
    code: 'RVDT-01',
    name: 'Krishna Peacock Feather Dupatta',
    category: 'Dupatta',
    collection: 'sacred',
    inspiredBy: [
      'The divine grace of Krishna',
      'The timeless symbolism of the peacock feather',
      'The spiritual beauty of Indian heritage',
    ],
    specs: [
      '100% Authentic Khadi',
      'Handcrafted Peacock Feather Embroidery',
      'Traditional Khat Work Detailing',
      'Krishna-Inspired Sacred Motifs',
      'Rich Royal Blue Contrast Panels',
      'Traditional Gold Heritage Border',
      'Intricate Handcrafted Embellishments',
      'Crafted in India',
    ],
    description:
      'Inspired by the divine connection between Lord Krishna and the peacock feather, this Authentic Khadi dupatta combines handcrafted peacock feather embroidery, traditional Khat work, sacred motifs, and royal detailing — transforming Khadi into a soulful expression of Indian heritage.',
    tagline: 'Divine Threads. Timeless Devotion.',
    image: '',
  },
  {
    id: 'rvdt-02',
    code: 'RVDT-02',
    name: 'Jamdani-Inspired Dupatta',
    category: 'Dupatta',
    collection: 'heritage',
    inspiredBy: [
      'The timeless artistry of Jamdani',
      'The delicate beauty of birds & blossoms',
      'The poetic harmony of Indian nature',
    ],
    specs: [
      '100% Authentic Khadi',
      'Jamdani-Inspired Digital Print',
      'Delicate Bird, Floral & Nature Motifs',
      'Heritage-Inspired Geometric Layout',
      'Soft Pastel Colour Palette',
      'Handcrafted Tassel Detailing',
      'Elegant Decorative Border',
      'Crafted in India',
    ],
    description:
      'Inspired by the timeless visual language of Jamdani, delicate birds, blossoms, and nature-inspired motifs are digitally interpreted on Authentic Khadi and finished with handcrafted tassels — bringing traditional textile artistry into a graceful contemporary expression.',
    tagline: 'Woven Inspiration. Contemporary Grace.',
    image: '',
  },
  {
    id: 'rvdt-03',
    code: 'RVDT-03',
    name: 'Ramayana Mehndi-Warli Dupatta',
    category: 'Dupatta',
    collection: 'sacred',
    inspiredBy: [
      'The timeless wisdom of the Ramayana',
      'The spiritual beauty of Indian storytelling',
      'The artistic heritage of Mehndi & Warli art',
    ],
    specs: [
      '100% Authentic Khadi',
      'Ramayana-Inspired Digital Print',
      'Traditional Mehndi & Warli Art Illustrations',
      'Illustrated Scenes & Traditional Verses',
      'Elegant Ivory & Earthy Gold Palette',
      'Heritage-Inspired Border Detailing',
      'Contemporary Scarf-Dupatta Silhouette',
      'Crafted in India',
    ],
    description:
      'Inspired by the timeless Ramayana, meaningful verses and narrative scenes are artistically expressed through Mehndi and Warli-inspired illustrations, thoughtfully digitally printed on Authentic Khadi — bringing India\u2019s epic storytelling and folk-art heritage into a contemporary scarf dupatta.',
    tagline: 'Timeless Stories. Mehndi Art. Woven into Khadi.',
    image: '',
  },
  {
    id: 'rvdt-04',
    code: 'RVDT-04',
    name: 'Warli Art Dupatta',
    category: 'Dupatta',
    collection: 'folk',
    inspiredBy: [
      'The timeless storytelling tradition of Warli Art',
      'The simplicity of tribal life & community',
      'The sacred harmony between people and nature',
    ],
    specs: [
      '100% Authentic Khadi',
      'Warli Art-Inspired Digital Print',
      'Traditional Tribal Human & Nature Motifs',
      'Tree of Life & Folk Storytelling Elements',
      'Rich Wine & Natural Ivory Colour Palette',
      'Heritage-Inspired Statement Border',
      'Handcrafted Tassel Detailing',
      'Crafted in India',
    ],
    description:
      'Inspired by the storytelling spirit of Warli Art, scenes of tribal life, nature, music, and community are digitally interpreted on Authentic Khadi — transforming an ancient visual language into a contemporary expression of wearable heritage.',
    tagline: 'Ancient Stories. Contemporary Khadi.',
    image: '',
  },
  {
    id: 'rvdt-05',
    code: 'RVDT-05',
    name: 'Pichwai-Inspired Dupatta',
    category: 'Dupatta',
    collection: 'sacred',
    inspiredBy: [
      'The timeless beauty of Pichwai art',
      'The vibrant spirit of Indian folk culture',
      "The beauty of India's flora & fauna",
    ],
    specs: [
      '100% Authentic Khadi',
      'Pichwai-Inspired Digital Print',
      'Machine Embroidery Detailing',
      'Floral, Animal & Traditional Indian Motifs',
      'Vibrant Multicolour Heritage Border',
      'Decorative Mirror & Embellishment Accents',
      'Crafted in India',
    ],
    description:
      'Inspired by the artistic richness of Pichwai and Indian folk traditions, vibrant flora, fauna and heritage motifs are digitally printed on Authentic Khadi and enhanced with machine embroidery, mirror accents and embellishments.',
    tagline: 'Vibrant Heritage. Art in Every Detail.',
    image: '',
  },

  // ───────────────────────── MEN'S WEAR ─────────────────────────
  {
    id: 'rvm-01',
    code: 'RVM-01',
    name: 'Raw Denim Modi Jacket',
    category: "Men's Wear",
    collection: 'denim',
    inspiredBy: [
      'The understated elegance of Indian heritage',
      'The natural character of raw Khadi',
      'The refinement of contemporary menswear',
    ],
    specs: [
      '100% Authentic Raw Denim Khadi',
      'Heritage-Inspired Digital Print',
      'Subtle Floral & Traditional Motifs',
      'Elegant Ivory & Earthy Beige Palette',
      'Fabric-Covered Buttons',
      'Contemporary Sleeveless Modi Jacket Silhouette',
      'Crafted in India',
    ],
    description:
      "Subtle heritage motifs are digitally printed on Authentic Raw Denim Khadi and tailored into a contemporary men's Modi jacket, blending Indian tradition with refined modern style.",
    tagline: 'Heritage Tailored. Modern India.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVM-1.avif',
  },
  {
    id: 'rvm-02',
    code: 'RVM-02',
    name: 'Charkha Modi Jacket',
    category: "Men's Wear",
    collection: 'heritage',
    inspiredBy: [
      'The timeless symbol of the Charkha',
      'The spirit of Khadi & Swadeshi',
      'The simplicity of Indian heritage',
    ],
    specs: [
      '100% Authentic Khadi',
      'Hand-Painted Charkha Artwork',
      'Minimal Heritage-Inspired Design',
      'Natural Ivory & Earthy Tones',
      'Classic Sleeveless Modi Jacket Silhouette',
      'Hand-Painted & Handcrafted in India',
    ],
    description:
      'Inspired by the Charkha — a symbol of self-reliance and Swadeshi — the motif is individually hand-painted on Authentic Khadi and reimagined for contemporary Indian menswear.',
    tagline: 'Spirit of Swadeshi. Hand-Painted on Khadi.',
    image: 'https://res.cloudinary.com/dvsrgdyi7/image/upload/v1787213011/RVM-2.avif',
  },
]

/**
 * Why Rangvanaat — brand story from the booklet (pages 39–40).
 */
export const BRAND_STORY = {
  tagline: 'The Art of Weaving Colours into Fabric, and Fabric into Stories.',
  intro:
    'RANGVANAT is more than a name — it is a celebration of India\u2019s timeless weaving heritage.',
  rang: {
    title: 'Rang',
    body: 'Represents India\u2019s vibrant colours, traditions, festivals, culture, emotions, and diversity.',
  },
  vanat: {
    title: 'Vanat',
    body: 'Inspired by India\u2019s ancient art of weaving — a tradition that dates back over 5,000 years to the Indus Valley Civilization.',
  },
  union:
    'Together, RANGVANAT symbolizes the harmony of colour, craftsmanship, culture, and heritage in every thread.',
  products: [
    'Premium Designer Khadi Wear',
    'Indo-Western Garments',
    'Sarees',
    'Dupattas',
    'Co-ord Sets',
    'Jackets',
    'Designer Fabrics',
    'Couture',
    'Bespoke Creations',
  ],
  vision:
    'To preserve India\u2019s timeless weaving heritage while taking craftsmanship from Bardoli to the global stage.',
  mission:
    'Empowering women and artisans by transforming luxury while preserving India\u2019s artistic legacy.',
  crafts: [
    'Authentic Khadi',
    'Hand Painting',
    'Digital Printing',
    'Natural Dyeing',
    'Machine Embroidery',
  ],
}

/** Helper: collection by id */
export const getCollection = (id) => COLLECTIONS.find((c) => c.id === id)

/** Helper: products of a collection */
export const productsByCollection = (id) =>
  id === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.collection === id)