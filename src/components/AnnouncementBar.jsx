import { useStore } from '../context/store';

export default function AnnouncementBar() {
  const { settings } = useStore();
  const message = settings?.announcement || "Complimentary Handloom Gift Box on orders above ₹5,000 | Worldwide Insured Shipping";

  return (
    <div
      className="w-full bg-[var(--color-ink)] text-[var(--color-paper)] text-sm py-2 px-4 text-center font-medium tracking-wide transition-colors"
      role="region"
      aria-label="Store Announcement"
    >
      <div className="rv-container flex items-center justify-center">
        <span>{message}</span>
      </div>
    </div>
  );
}
