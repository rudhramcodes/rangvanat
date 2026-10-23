import { useState, useEffect } from 'react';

const MESSAGES = [
  'COMPLIMENTARY DOMESTIC SHIPPING ON ORDERS ABOVE ₹15,000',
  'BARDOLI HANDLOOM ARCHIVE · 100% ARTISAN-SPUN KHADI',
  'BOOK A BESPOKE VIDEO CONSULTATION WITH OUR WEAVERS',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announcement-bar select-none" role="region" aria-label="Announcement">
      <span
        style={{
          transition: 'opacity 300ms ease-in-out',
          opacity: fade ? 1 : 0,
        }}
      >
        {MESSAGES[index]}
      </span>
    </div>
  );
}
