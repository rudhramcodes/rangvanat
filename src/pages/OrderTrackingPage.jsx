import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Circle, Clock, PackageCheck, Truck, Home } from 'lucide-react';
import { api } from '../api/client.js';

export default function OrderTrackingPage({ initialOrderNumber = '', navigate }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [contact, setContact] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialOrderNumber) {
      handleTrack(initialOrderNumber);
    }
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
      if (res?.success && res.data) {
        setTrackingData(res.data);
      } else {
        setError(res?.message || 'No order found with the provided details.');
        setTrackingData(null);
      }
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
        <h1 className="heading-1 text-[var(--brand-maroon)] uppercase">Track Your Weaving</h1>
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
            <label className="form-label">Order Number</label>
            <input
              type="text"
              placeholder="e.g. RV-2026-382910"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="form-input uppercase"
              required
            />
          </div>
          <div className="md:col-span-4">
            <label className="form-label">Email or Phone (Optional)</label>
            <input
              type="text"
              placeholder="Contact used during checkout"
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
              <span className="caption uppercase text-[var(--ink-soft)] font-semibold">Order Confirmed</span>
              <h2 className="heading-2 text-[var(--brand-maroon)] text-xl uppercase">
                {trackingData.orderNumber}
              </h2>
            </div>
            <div className="text-right">
              <span className="caption text-xs text-[var(--ink-soft)]">Courier Partner</span>
              <p className="font-semibold text-sm text-[var(--ink-chocolate)]">
                {trackingData.courier} ({trackingData.trackingNumber})
              </p>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-6 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-[2px] before:bg-[var(--line-khadi)]">
            {trackingData.steps?.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-8">
                <div
                  className={`absolute left-1.5 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                    step.done
                      ? 'bg-[var(--brand-maroon)] border-[var(--brand-maroon)] text-white'
                      : 'bg-white border-[var(--line-khadi)]'
                  }`}
                >
                  {step.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <div>
                  <h4 className={`text-base font-semibold ${step.done ? 'text-[var(--brand-maroon)]' : 'text-[var(--ink-soft)]'}`}>
                    {step.label}
                  </h4>
                  <p className="caption text-xs text-[var(--ink-soft)]">
                    {step.date ? new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending dispatch'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Items Summary */}
          <div className="pt-4 border-t border-[var(--line-khadi)]">
            <h4 className="caption uppercase font-semibold text-[var(--ink-soft)] mb-3">
              Garments in Shipment ({trackingData.items?.length})
            </h4>
            <div className="space-y-2">
              {trackingData.items?.map((it, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-[var(--line-khadi)]/40">
                  <span>
                    {it.productTitle} · {it.variantSize} (x{it.quantity})
                  </span>
                  <span className="font-semibold">₹{it.subtotal?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
