import { ArrowRight, Package, Check, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';

export default function OrderConfirmationPage({ order, navigate }) {
  const { formatPrice } = useStore();

  if (!order) {
    return (
      <main id="main-content" className="rv-container py-24 text-center">
        <h2 className="heading-2 text-[var(--brand-maroon)]">Order Received</h2>
        <button onClick={() => navigate({ page: 'home' })} className="btn btn-primary btn-md mt-4">
          Return to Home
        </button>
      </main>
    );
  }

  return (
    <main id="main-content" className="rv-container py-16 md:py-24 max-w-2xl text-center">
      {/* Drawn Gold Checkmark Animation */}
      <div className="w-20 h-20 mx-auto rounded-full bg-[var(--bg-cream)] border-2 border-[var(--brand-gold)] flex items-center justify-center mb-6">
        <svg viewBox="0 0 48 48" className="w-10 h-10 stroke-[var(--brand-maroon)] fill-none stroke-[3.5] stroke-linecap-round stroke-linejoin-round">
          <path d="M12 24 L20 32 L36 16" className="gold-check-animate" />
        </svg>
      </div>

      <p className="eyebrow text-[var(--brand-gold)] mb-2">Order Confirmed & Logged</p>
      <h1 className="heading-1 text-[var(--brand-maroon)] uppercase text-3xl md:text-4xl">
        ORDER NO. {order.orderNumber}
      </h1>

      <p className="serif-statement text-xl md:text-2xl text-[var(--ink-chocolate)] my-6 max-w-lg mx-auto">
        "Your order has entered our loom dispatch notes. Our master artisans in Bardoli thank you for honouring the craft."
      </p>

      {/* Order Summary Box */}
      <div className="bg-white border border-[var(--line-khadi)] p-6 rounded-[2px] text-left shadow-sm space-y-4 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line-khadi)]">
          <span className="caption uppercase font-semibold text-[var(--ink-soft)]">Order Details</span>
          <span className="caption text-[var(--state-success)] font-semibold">
            Status: {order.fulfillment?.status ? order.fulfillment.status.toUpperCase() : 'RECEIVED'}
          </span>
        </div>

        <div className="text-sm space-y-1.5 text-[var(--ink-chocolate)]">
          <p>
            <strong>Customer:</strong> {order.customer?.name} ({order.customer?.email})
          </p>
          <p>
            <strong>Shipping Address:</strong> {order.customer?.shippingAddress?.addressLine1},{' '}
            {order.customer?.shippingAddress?.city}, {order.customer?.shippingAddress?.state} -{' '}
            {order.customer?.shippingAddress?.pincode}
          </p>
          <p>
            <strong>Courier Partner:</strong> {order.fulfillment?.courierPartner} (Tracking:{' '}
            <span className="font-mono text-xs text-[var(--brand-maroon)]">
              {order.fulfillment?.trackingNumber}
            </span>
            )
          </p>
          <p>
            <strong>Total Amount Paid:</strong>{' '}
            <span className="price font-bold">{formatPrice(order.financials?.totalAmount)}</span>
          </p>
        </div>

        <div className="pt-3 border-t border-[var(--line-khadi)]">
          <p className="caption uppercase text-xs font-semibold text-[var(--ink-soft)] mb-2">
            Items in this Weaving ({order.items?.length})
          </p>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span>
                  {item.productTitle} ({item.variantSize}) x {item.quantity}
                </span>
                <span className="font-medium">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => navigate({ page: 'track', orderNumber: order.orderNumber })}
          className="btn btn-secondary btn-md"
        >
          Track Order Live →
        </button>
        <button
          onClick={() => navigate({ page: 'shop' })}
          className="btn btn-primary btn-md"
        >
          Continue Shopping
        </button>
      </div>
    </main>
  );
}
