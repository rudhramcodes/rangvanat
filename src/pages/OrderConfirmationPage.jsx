import { useState, useEffect } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, Download, Package, Truck, Clock } from 'lucide-react';
import { useStore } from '../context/store.js';
import { api } from '../api/client.js';

export default function OrderConfirmationPage({ orderNumber, order: initialOrder, navigate }) {
  const { addToast } = useStore();
  const [order, setOrder] = useState(initialOrder || null);
  const [copied, setCopied] = useState(false);

  const num = orderNumber || initialOrder?.orderNumber;
  const token =
    (typeof window !== 'undefined' && decodeURIComponent(window.location.hash.slice(1))) ||
    initialOrder?.accessToken ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`rv_order_${num}`)) ||
    '';

  const [loading, setLoading] = useState(!initialOrder && Boolean(num));

  useEffect(() => {
    let active = true;
    if (num && !initialOrder) {
      setLoading(true);
      api
        .getOrderByNumber(num, token)
        .then((res) => {
          if (!active) return;
          if (res?.success && res.data) setOrder(res.data);
          setLoading(false);
        })
        .catch(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [num, token, initialOrder]);

  const handleCopy = () => {
    if (!num) return;
    navigator.clipboard?.writeText(num)?.catch?.(() => {});
    setCopied(true);
    addToast('Order number copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadInvoice = async () => {
    if (!num) return;
    try {
      const headers = token ? { 'X-Order-Token': token } : {};
      const res = await fetch(`/api/orders/${encodeURIComponent(num)}/acknowledgement`, { headers });
      if (!res.ok) throw new Error('PDF invoice not ready yet');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rangvanat-Order-${num}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      addToast('Invoice downloaded', 'success');
    } catch {
      addToast('Invoice will be emailed once dispatched', 'info');
    }
  };

  if (loading) {
    return (
      <div className="rv-container py-32 text-center text-sm text-[var(--color-muted)]">
        Verifying atelier order record…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rv-container py-32 text-center space-y-4">
        <h2 className="font-display text-2xl text-[var(--color-ink)]">Order Reference Not Found</h2>
        <p className="text-sm text-[var(--color-muted)]">
          We could not locate this order. Please check your confirmation link or tracking number.
        </p>
        <button onClick={() => navigate({ page: 'shop' })} className="btn-primary mt-4">
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--color-paper)] text-[var(--color-ink)] py-12 md:py-20 min-h-screen">
      <div className="rv-container max-w-3xl">
        {/* Success Card (§12) */}
        <div className="bg-[var(--color-white)] border border-[var(--color-line)] rounded-[8px] p-6 md:p-10 shadow-sm text-center space-y-6">
          {/* Badge */}
          <div className="w-16 h-16 rounded-full bg-[var(--color-cream)] text-[var(--color-success)] flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} strokeWidth={1.5} />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-clay)]">
              Order Confirmed
            </span>
            <h1 className="font-display text-3xl md:text-4xl text-[var(--color-ink)] font-normal mt-1">
              Your piece is with the atelier
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-2 font-body max-w-md mx-auto">
              Thank you for supporting handloom craft. Our master artisans in Bardoli are preparing your order.
            </p>
          </div>

          {/* Order Number Box */}
          <div className="inline-flex items-center gap-3 bg-[var(--color-cream)]/70 border border-[var(--color-line)] px-4 py-2.5 rounded-[6px]">
            <span className="text-xs text-[var(--color-muted)]">Order Reference:</span>
            <strong className="text-sm font-semibold text-[var(--color-ink)]">{num || 'RV-2026-PENDING'}</strong>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              aria-label="Copy order number"
            >
              {copied ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Delivery & Timeline Steps */}
          <div className="border-t border-[var(--color-line)] pt-6 text-left space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
              Fulfillment Journey
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[var(--color-cream)]/50 border border-[var(--color-line)] rounded-[6px]">
                <Clock size={16} className="text-[var(--color-clay)] mb-1" />
                <p className="font-semibold text-[var(--color-ink)]">1. Atelier Verification</p>
                <p className="text-[11px] text-[var(--color-muted)]">Inventory confirmed &amp; reserved</p>
              </div>
              <div className="p-3 bg-[var(--color-cream)]/50 border border-[var(--color-line)] rounded-[6px]">
                <Package size={16} className="text-[var(--color-clay)] mb-1" />
                <p className="font-semibold text-[var(--color-ink)]">2. Inspection &amp; Packaging</p>
                <p className="text-[11px] text-[var(--color-muted)]">Handloom gift box packing</p>
              </div>
              <div className="p-3 bg-[var(--color-cream)]/50 border border-[var(--color-line)] rounded-[6px]">
                <Truck size={16} className="text-[var(--color-clay)] mb-1" />
                <p className="font-semibold text-[var(--color-ink)]">3. Insured Dispatch</p>
                <p className="text-[11px] text-[var(--color-muted)]">5–7 business days to your door</p>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          {order?.items && order.items.length > 0 && (
            <div className="border-t border-[var(--color-line)] pt-6 text-left space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                Acquired Pieces
              </h3>
              <div className="divide-y divide-[var(--color-line)]">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--color-ink)]">
                      {it.productTitle} ({it.variantSize}) × {it.quantity}
                    </span>
                    <span className="price-tabular font-semibold text-[var(--color-ink)]">
                      ₹{it.subtotal?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="border-t border-[var(--color-line)] pt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate({ page: 'track', orderNumber: num })}
              className="btn-primary btn-sm h-10 px-5"
            >
              Track Order
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="btn-secondary btn-sm h-10 px-4 flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Download Invoice</span>
            </button>
            <button
              onClick={() => navigate({ page: 'shop' })}
              className="btn-secondary btn-sm h-10 px-4"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
