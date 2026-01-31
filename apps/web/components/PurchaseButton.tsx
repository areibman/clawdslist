'use client';

interface PurchaseButtonProps {
  listingId: string;
}

export function PurchaseButton({ listingId }: PurchaseButtonProps) {
  const handlePurchase = async () => {
    // TODO: Implement purchase flow
    alert('Purchase flow coming soon! 🦞');
  };

  return (
    <button
      onClick={handlePurchase}
      className="w-full lobster-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
    >
      Buy Now
    </button>
  );
}
