import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Package, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import { api } from '../api/client';
import { useStore } from '../context/store';

export default function OrderConfirmationPage({ order: initial, orderNumber, navigate }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { formatPrice, addToast } = useStore();

  const number = orderNumber || initial?.orderNumber;
  const token =
    (typeof window !== 'undefined' && decodeURIComponent(window.location.hash.slice(1))) ||
    initial?.accessToken ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`rv_order_${number}`)) ||
    '';

  useEffect(() => {
    let active = true;
    if (number) {
      api.getOrderByNumber(number, token).then((r) => {
        if (active) {
          if (r.success) setOrder(r.data);
          else setError(r.message || 'Unable to load order information.');
        }
      }).catch((e) => {
        if (active) setError(e.message || 'Unable to communicate with server.');
      });
    }
    return () => {
      active = false;
    };
  }, [number, token]);

  const download = async () => {
    setDownloading(true);
    try {
      const headers = { 'X-Order-Token': token };
      const auth = localStorage.getItem('rv_token');
      if (auth) headers.Authorization = `Bearer ${auth}`;
      const r = await fetch(`/api/orders/${encodeURIComponent(number)}/acknowledgement`, { headers });
      if (!r.ok) throw new Error('Unable to generate acknowledgement PDF');
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rangvanat-${number}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      addToast('Acknowledgement PDF downloaded', 'success');
    } catch (e) {
      setError(e.message);
      addToast('Could not download acknowledgement', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const copyOrderNumber = () => {
    if (!number) return;
    navigator.clipboard?.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Order number copied to clipboard', 'info');
  };

  const stages = [
    { key: 'received', label: '1. Request Received', desc: 'Registered in Bardoli' },
    { key: 'in_stitching', label: '2. Loom & Stitching', desc: 'Handcrafted on looms' },
    { key: 'dispatched', label: '3. Handloom QA', desc: 'Insured dispatch' },
    { key: 'delivered', label: '4. Delivered', desc: 'At your doorstep' },
  ];

  const currentStageIndex = order?.fulfillment?.status === 'delivered' ? 3
    : order?.fulfillment?.status === 'dispatched' ? 2
    : order?.fulfillment?.status === 'in_stitching' ? 1
    : 0;

  return (
    <main id="main-content" className="w-full bg-[var(--bg-ivory)] py-12 md:py-20">
      <div className="rv-container max-w-4xl">
        {/* Celebration Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--brand-maroon-tint)]/60 border border-[var(--brand-maroon)] flex items-center justify-center mb-5 text-[var(--brand-maroon)] shadow-xs">
            <CheckCircle2 size={32} strokeWidth={1.75} />
          </div>

          <p className="eyebrow text-[var(--brand-gold)] mb-1">Commission Registered</p>
          <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl md:text-5xl">
            Order Request Confirmed
          </h1>

          {number && (
            <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 bg-white border border-[var(--line-khadi)] rounded-[2px] shadow-xs">
              <span className="caption text-[var(--ink-soft)] text-xs font-medium">Order Number:</span>
              <strong className="text-[var(--brand-maroon)] text-xs tracking-wider font-mono font-semibold">
                {number}
              </strong>
              <button
                type="button"
                onClick={copyOrderNumber}
                className="text-[var(--ink-soft)] hover:text-[var(--brand-maroon)] ml-1"
                aria-label="Copy order number"
              >
                {copied ? <Check size={13} className="text-[var(--state-success)]" /> : <Copy size={13} />}
              </button>
            </div>
          )}

          <p className="body-l text-[var(--ink-soft)] mt-4">
            Thank you for being a patron of Indian handloom. Because each silhouette is woven with single-spindle khadi yarns, our studio reviews loom capacity before finalizing fulfillment.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-red-50 border border-red-200 text-xs text-[var(--state-error)] rounded-[2px] text-center" role="alert">
            {error}
          </div>
        )}

        {/* 4-Step Loom Progress Card */}
        <div className="bg-white border border-[var(--line-khadi)] rounded-[2px] p-6 md:p-8 mb-8 shadow-xs">
          <p className="caption uppercase font-semibold text-[var(--ink-chocolate)] tracking-wider mb-6 text-xs">
            ✦ Atelier Progress Timeline
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {stages.map((stg, idx) => {
              const isPastOrCurrent = idx <= currentStageIndex;
              return (
                <div key={stg.key} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPastOrCurrent
                          ? 'bg-[var(--brand-maroon)] text-white'
                          : 'bg-[var(--bg-cream)] text-[var(--ink-soft)] border border-[var(--line-khadi)]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`h-0.5 flex-grow ${
                        idx < currentStageIndex ? 'bg-[var(--brand-maroon)]' : 'bg-[var(--line-khadi)]'
                      }`}
                    />
                  </div>
                  <p className="text-xs font-semibold text-[var(--ink-chocolate)]">{stg.label}</p>
                  <p className="caption text-[11px] text-[var(--ink-soft)]">{stg.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {order ? (
          <div className="space-y-8 animate-fade-in">
            {/* Two-Column Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column (7 cols): Items List */}
              <div className="md:col-span-7 bg-white border border-[var(--line-khadi)] rounded-[2px] p-6 shadow-xs space-y-4">
                <h2 className="heading-3 text-[var(--brand-maroon)] uppercase text-base pb-3 border-b border-[var(--line-khadi)]">
                  Handcrafted Pieces in Request
                </h2>

                <div className="divide-y divide-[var(--line-khadi)]/60">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink-chocolate)]">
                          {item.productTitle}
                        </p>
                        <p className="caption text-xs text-[var(--ink-soft)] mt-0.5">
                          Size: {item.variantSize || 'Standard'} · Quantity: {item.quantity}
                        </p>
                      </div>
                      <span className="price text-sm font-semibold">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[var(--line-khadi)] space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.financials?.subtotal || 0)}</span>
                  </div>
                  {order.financials?.discountAmount > 0 && (
                    <div className="flex justify-between text-[var(--state-success)] font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(order.financials.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Domestic Shipping</span>
                    <span>
                      {order.financials?.shippingFee === 0
                        ? 'Complimentary'
                        : formatPrice(order.financials?.shippingFee || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[var(--ink-chocolate)] pt-2 border-t border-[var(--line-khadi)]">
                    <span>Total Order Value</span>
                    <span className="price text-lg text-[var(--brand-maroon)]">
                      {formatPrice(order.financials?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Delivery & Payment Status */}
              <div className="md:col-span-5 space-y-6">
                {/* Delivery Info */}
                <div className="bg-white border border-[var(--line-khadi)] rounded-[2px] p-6 shadow-xs space-y-3 text-xs">
                  <h3 className="heading-3 text-[var(--brand-maroon)] uppercase text-base pb-2 border-b border-[var(--line-khadi)]">
                    Delivery Destination
                  </h3>
                  <p className="font-semibold text-[var(--ink-chocolate)] text-sm">
                    {order.customer?.name}
                  </p>
                  <p className="text-[var(--ink-soft)] leading-relaxed">
                    {order.customer?.shippingAddress?.addressLine1}
                    {order.customer?.shippingAddress?.addressLine2 && `, ${order.customer.shippingAddress.addressLine2}`}
                    <br />
                    {order.customer?.shippingAddress?.city}, {order.customer?.shippingAddress?.state} - {order.customer?.shippingAddress?.pincode}
                    <br />
                    India
                  </p>
                  <p className="text-[var(--ink-soft)] pt-1 border-t border-[var(--line-khadi)]/50">
                    Phone: {order.customer?.phone}
                  </p>
                </div>

                {/* Next Steps Card */}
                <div className="bg-[var(--bg-cream)]/70 border border-[var(--brand-gold)] rounded-[2px] p-5 space-y-2 text-xs">
                  <p className="caption text-[var(--brand-maroon)] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={15} />
                    <span>What Happens Next?</span>
                  </p>
                  <p className="text-[var(--ink-chocolate)] leading-relaxed">
                    Our atelier will inspect the fabric inventory and weaving schedule. You will receive an SMS and email notification when your order is packed and dispatched from Bardoli.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="btn btn-secondary btn-md w-full sm:w-auto"
              >
                <Download size={15} />
                <span>{downloading ? 'Preparing PDF...' : 'Download Acknowledgement PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate({ page: 'track', orderNumber: number })}
                className="btn btn-primary btn-md w-full sm:w-auto"
              >
                <Package size={15} />
                <span>Track Atelier Progress</span>
              </button>

              <button
                type="button"
                onClick={() => navigate({ page: 'shop' })}
                className="btn-ghost text-xs text-[var(--ink-chocolate)] hover:text-[var(--brand-maroon)]"
              >
                Continue Browsing Lookbook →
              </button>
            </div>
          </div>
        ) : !error ? (
          <div className="py-16 text-center">
            <p className="caption text-[var(--ink-soft)] animate-pulse">Loading order details from atelier...</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
