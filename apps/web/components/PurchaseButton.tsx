'use client';

import { useState } from 'react';

interface PurchaseButtonProps {
  listingId: string;
}

export function PurchaseButton({ listingId }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'demo_key', // In real app, get from auth
        },
        body: JSON.stringify({
          listingId,
          paymentMethod: 'stripe',
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const { order } = await orderRes.json();

      // Create checkout session
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'demo_key', // In real app, get from auth
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: 'stripe',
        }),
      });

      if (!checkoutRes.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await checkoutRes.json();
      
      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full lobster-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Buy Now'}
    </button>
  );
}
