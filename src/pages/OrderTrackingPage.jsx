import { useState, useEffect } from 'react';

import { api } from '../api/client.js';

import { trackingSteps } from '../lib/orderTracking.js';

function toTrackingResult(res) {
  if (res?.success && res.data) {
    return {
      data: {
        ...res.data,
        steps: trackingSteps(res.data.fulfillment?.status),
      },
    };
  }
  return { error: res?.message || 'No order found with the provided details.' };
}

export default function OrderTrackingPage({ initialOrderNumber = '' }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [contact, setContact] = useState(()=>sessionStorage.getItem(`rv_order_${initialOrderNumber}`)||'');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialOrderNumber));
  const [error, setError] = useState('');

  const applyTrackingResult = (result) => {
    setTrackingData(result.data || null);
    if (result.error) setError(result.error);
  };

  // Auto-track a shared order link once, using the access key stored for that order.
  useEffect(() => {
    if (!initialOrderNumber) return undefined;
    let active = true;
    const accessKey = (sessionStorage.getItem(`rv_order_${initialOrderNumber}`) || '').trim();
    api
      .trackOrder(initialOrderNumber.trim(), accessKey)
      .then((res) => {
        if (active) applyTrackingResult(toTrackingResult(res));
      })
      .catch(() => {
        if (!active) return;
        setError('Error communicating with order tracker. Please try again.');
        setTrackingData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialOrderNumber]);

  const handleTrack = async (orderNumToUse) => {
    const num = orderNumToUse || orderNumber;
    if (!num.trim()) {
      setError('Please provide a valid order number (e.g. RV-2026-104928)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.trackOrder(num.trim(), contact.trim());
      applyTrackingResult(toTrackingResult(res));
    } catch {
      setError('Error communicating with order tracker. Please try again.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="rv-container py-12 md:py-20 max-w-3xl">
      <div className="text-center mb-10">
        <p className="eyebrow text-[var(--brand-gold)] mb-2">Live Atelier Tracker</p>
        <h1 className="heading-1 text-[var(--brand-maroon)] uppercase">Follow your piece</h1>
        <p className="body-l text-[var(--ink-soft)] max-w-md mx-auto mt-2">
          Follow your piece from the spinning wheel in Bardoli to your doorstep.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white border border-[var(--line-khadi)] p-6 rounded-[2px] shadow-sm mb-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          <div className="md:col-span-6">
            <label htmlFor="ordertrackingpage-field-1" className="form-label">Order Number</label>
            <input id="ordertrackingpage-field-1"
              type="text"
              placeholder="e.g. RV-2026-382910"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="form-input uppercase"
              required
            />
          </div>
          <div className="md:col-span-4">
            <label htmlFor="ordertrackingpage-field-2" className="form-label">Private order access key</label>
            <input id="ordertrackingpage-field-2"
              type="text"
              placeholder="Access key from your private order link"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md w-full justify-center h-12 uppercase"
            >
              {loading ? '...' : 'Track'}
            </button>
          </div>
        </form>

        {error && <p className="caption text-[var(--state-error)] mt-3">{error}</p>}
      </div>

      {/* Tracking Results Card */}
      {trackingData && (
        <div className="bg-white border border-[var(--line-khadi)] p-6 md:p-8 rounded-[2px] shadow-sm space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[var(--line-khadi)] gap-2">
            <div>
              <span className="caption uppercase text-[var(--ink-soft)] font-semibold">{trackingData.fulfillment?.status === 'cancelled' ? 'Order cancelled' : 'Order status'}</span>
              <h2 className="tracking-order-number">
                {trackingData.orderNumber}
              </h2>
            </div>
            <div className="text-left md:text-right">
              <span className="caption text-xs text-[var(--ink-soft)]">Courier Partner</span>
              <p className="font-semibold text-sm text-[var(--ink-chocolate)]">
                {trackingData.fulfillment?.courierPartner || 'Not dispatched'} ({trackingData.fulfillment?.trackingNumber || 'Pending'})
              </p>
            </div>
          </div>

          {/* Stepper Timeline */}
          <ol className="tracking-timeline" aria-label="Order progress">
            {trackingData.steps.map((step) => (
              <li key={step.label} className={`tracking-step is-${step.state}`}
                aria-current={step.state === 'current' ? 'step' : undefined}>
                <span className="tracking-marker" aria-hidden="true">
                  {step.state === 'complete' ? '✓' : step.state === 'cancelled' ? '×' : ''}
                </span>
                <div className="tracking-step-copy">
                  <h3>{step.label}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Items Summary */}
          <div className="pt-4 border-t border-[var(--line-khadi)]">
            <h4 className="caption uppercase font-semibold text-[var(--ink-soft)] mb-3">
              Items in your order ({trackingData.items?.length})
            </h4>
            <div className="space-y-2">
              {trackingData.items?.map((it, i) => (
                <div key={i} className="flex items-start justify-between gap-4 text-sm py-3 border-b border-[var(--line-khadi)]/40">
                  <span>
                    {it.productTitle} · {it.variantSize} (x{it.quantity})
                  </span>
                  <span className="font-semibold whitespace-nowrap">₹{it.subtotal?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
