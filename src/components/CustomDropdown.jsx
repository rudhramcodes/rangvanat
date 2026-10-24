import { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Reusable Luxury Minimal Dropdown Component
 *
 * @param {Array<{value: string, label: string, badge?: string, description?: string, icon?: React.ReactNode} | string>} options
 * @param {string} value - Selected option value
 * @param {(value: string) => void} onChange - Callback when an option is picked
 * @param {string} [placeholder='Select...'] - Fallback placeholder text
 * @param {string} [prefix] - Optional prefix inline text (e.g., 'Sort:')
 * @param {string} [label] - Optional external or header label
 * @param {'left' | 'right'} [align='left'] - Menu alignment relative to trigger
 * @param {'sm' | 'md' | 'lg'} [size='sm'] - Control sizing
 * @param {boolean} [disabled=false]
 * @param {string} [className=''] - Wrapper class
 * @param {string} [buttonClassName=''] - Custom trigger button classes
 * @param {string} [menuClassName=''] - Custom menu container classes
 */
export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  prefix,
  label,
  align = 'left',
  size = 'sm',
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const listboxId = useId();

  // Normalize options into uniform { value, label, badge, description, icon } objects
  const normalizedOptions = useMemo(()=>options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value,
      label: opt.label || String(opt.value),
      badge: opt.badge,
      description: opt.description,
      icon: opt.icon,
    };
  }),[options]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside clicks (mouse & touch)
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Sync highlighted index when opened
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => opt.value === value);
      queueMicrotask(()=>setHighlightedIndex(idx >= 0 ? idx : 0));
    } else {
      queueMicrotask(()=>setHighlightedIndex(-1));
    }
  }, [isOpen, value, normalizedOptions]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % normalizedOptions.length);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length);
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
          const selected = normalizedOptions[highlightedIndex];
          if (selected) {
            onChange?.(selected.value);
            setIsOpen(false);
            buttonRef.current?.focus();
          }
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      }
      case 'Tab': {
        setIsOpen(false);
        break;
      }
      default:
        break;
    }
  };

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  // Size variations
  const sizeStyles = {
    sm: {
      btn: 'h-9 px-3 text-xs gap-2',
      item: 'px-3 py-2 text-xs',
      icon: 13,
    },
    md: {
      btn: 'h-10 px-3.5 text-xs sm:text-sm gap-2.5',
      item: 'px-3.5 py-2.5 text-xs sm:text-sm',
      icon: 14,
    },
    lg: {
      btn: 'h-11 px-4 text-sm gap-3',
      item: 'px-4 py-3 text-sm',
      icon: 15,
    },
  }[size] || {
    btn: 'h-9 px-3 text-xs gap-2',
    item: 'px-3 py-2 text-xs',
    icon: 13,
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="block caption text-[var(--ink-soft)] text-xs mb-1 font-medium tracking-wide">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative flex items-center justify-between bg-white text-[var(--ink-chocolate)] border border-[var(--line-khadi)] rounded-[2px] transition-all duration-200 ease-out select-none cursor-pointer outline-none ${
          sizeStyles.btn
        } ${
          isOpen
            ? 'border-[var(--brand-maroon)] shadow-[0_0_0_2px_rgba(94,27,16,0.12)] bg-[#FDFCFB]'
            : 'hover:border-[var(--brand-gold)] hover:bg-[#FDFBF7] active:scale-[0.985]'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {prefix && (
            <span className="caption text-[var(--ink-soft)] text-xs font-normal">
              {prefix}
            </span>
          )}
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium text-[var(--ink-chocolate)]">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Animated Chevron */}
        <ChevronDown
          size={sizeStyles.icon}
          className={`flex-shrink-0 ml-1 text-[var(--ink-soft)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen
              ? 'rotate-180 text-[var(--brand-maroon)]'
              : 'group-hover:text-[var(--ink-chocolate)]'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Floating Dropdown Menu Panel */}
      <div
        id={listboxId}
        ref={listRef}
        role="listbox"
        tabIndex={-1}
        aria-orientation="vertical"
        className={`absolute top-[calc(100%+6px)] z-50 min-w-[200px] w-max max-w-[280px] bg-white border border-[var(--line-khadi)] rounded-[3px] shadow-[0_16px_36px_rgba(42,24,16,0.14)] py-1.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
        } ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
        } ${menuClassName}`}
      >
        {normalizedOptions.map((opt, index) => {
          const isSelected = opt.value === value;
          const isHighlighted = highlightedIndex === index;

          return (
            <div
              key={String(opt.value)}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(opt.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`group/item flex items-center justify-between gap-3 w-full cursor-pointer select-none transition-colors duration-150 ${
                sizeStyles.item
              } ${
                isSelected
                  ? 'bg-[var(--brand-maroon-tint)]/40 text-[var(--brand-maroon)] font-semibold'
                  : isHighlighted
                  ? 'bg-[var(--bg-ivory)] text-[var(--ink-chocolate)]'
                  : 'text-[var(--ink-chocolate)] hover:bg-[var(--bg-ivory)] hover:text-[var(--brand-maroon)]'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-2">
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] font-semibold flex-shrink-0">
                      {opt.badge}
                    </span>
                  )}
                </div>
                {opt.description && (
                  <span className="text-[11px] text-[var(--ink-soft)] font-normal truncate mt-0.5">
                    {opt.description}
                  </span>
                )}
              </div>

              {isSelected && (
                <Check
                  size={14}
                  className="text-[var(--brand-maroon)] flex-shrink-0 ml-2 transition-transform duration-200 scale-100 animate-in fade-in"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
