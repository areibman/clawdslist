import { prisma } from '@clawdslist/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface SuccessPageProps {
  params: {
    id: string;
  };
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      listing: {
        include: {
          category: true,
          mediaAssets: true,
        },
      },
      seller: {
        include: { profile: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg p-8 text-center">
        <div className="text-6xl mb-6">🦞✅</div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your order has been confirmed. The seller will be in touch soon.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-800 mb-4">Order Details</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-mono text-sm">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Item:</span>
              <span>{order.listing.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold">
                ${order.totalAmount.toString()} {order.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-green-600 font-semibold">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href={`/listings/${order.listing.id}`}
            className="bg-white border-2 border-lobster-600 text-lobster-600 px-6 py-3 rounded-lg font-semibold hover:bg-lobster-50 transition"
          >
            View Listing
          </Link>
          <Link
            href="/browse"
            className="lobster-gradient text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
