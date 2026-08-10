const CharkhaMark = ({ className = '' }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden>
    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="1.5" />
    {Array.from({ length: 8 }).map((_, i) => (
      <line
        key={i}
        x1="50"
        y1="6"
        x2="50"
        y2="94"
        stroke="currentColor"
        strokeWidth="1"
        transform={`rotate(${i * 45} 50 50)`}
      />
    ))}
    <circle cx="50" cy="50" r="3.5" fill="currentColor" />
  </svg>
)

const PlaceholderImage = ({ label = 'Image', className = '', framed = false, alt = '', round = false, light = false }) => (
  <div
    role="img"
    aria-label={alt || `${label} — photography coming soon`}
    className={`relative overflow-hidden ${
      light
        ? 'bg-gradient-to-br from-parchment via-aged-parchment to-champagne/80'
        : 'bg-gradient-to-br from-heritage via-oxblood to-espresso'
    } ${round ? 'rounded-full' : ''} ${className}`}
  >
    <div className={`${light ? 'weave-espresso opacity-40' : 'weave opacity-20'} absolute inset-0`} />
    <div className="grain absolute inset-0 opacity-30" />
    <CharkhaMark
      className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 sm:h-24 sm:w-24 ${
        light ? 'text-heritage/40' : 'text-champagne/40'
      }`}
    />
    {!round && (
      <span
        className={`absolute bottom-3 left-3 text-[10px] font-medium uppercase tracking-[0.3em] ${
          light ? 'text-espresso/60' : 'text-champagne/70'
        }`}
      >
        {label} &mdash; coming soon
      </span>
    )}
    {framed && <span className={`pointer-events-none absolute inset-4 border ${light ? 'border-brass/40' : 'border-champagne/40'}`} />}
  </div>
)

export default PlaceholderImage
