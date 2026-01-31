'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, quantity: 1 }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const { order } = await orderRes.json();

      // Initiate payment
      const paymentRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          provider: 'stripe',
        }),
      });

      if (!paymentRes.ok) {
        const data = await paymentRes.json();
        throw new Error(data.error || 'Failed to initiate payment');
      }

      const { checkoutUrl } = await paymentRes.json();

      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Buy error:', err);
      setError(err.message || 'Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="btn-primary w-full text-lg py-3"
      >
        {loading ? 'Processing...' : '🦞 Buy Now'}
      </button>
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <p className="text-xs text-sand-600 mt-2 text-center">
        Secure checkout with Stripe or Crypto
      </p>
    </div>
  );
}
