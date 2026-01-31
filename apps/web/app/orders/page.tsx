import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import prisma from '@/lib/db';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Package, ShoppingBag, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

// In a real app, this would come from auth
const DEMO_BUYER_ID = 'demo-buyer';

async function getOrders() {
  // Get demo orders for display
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      listing: {
        include: {
          media: { take: 1 },
          category: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
    case 'AWAITING_PAYMENT':
      return 'shell';
    case 'PAID':
    case 'PROCESSING':
      return 'ocean';
    case 'SHIPPED':
    case 'DELIVERED':
    case 'FULFILLED':
      return 'success';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-sand-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-lobster-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-muted-foreground">
            Track and manage your purchases
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-48 h-32 md:h-auto bg-sand-100 flex-shrink-0">
                      {order.listing.media[0]?.url ? (
                        <img
                          src={order.listing.media[0].url}
                          alt={order.listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-sand-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getStatusColor(order.status) as any}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Order #{order.orderNumber.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {order.listing.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{order.listing.category.icon}</span>
                            <span>{order.listing.category.name}</span>
                            <span>•</span>
                            <span>Qty: {order.quantity}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-lobster-600">
                            {formatPrice(Number(order.total), order.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {timeAgo(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-sand-200">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        {order.status === 'AWAITING_PAYMENT' && (
                          <Link href={`/orders/${order.id}/pay`}>
                            <Button variant="lobster" size="sm">
                              Complete Payment
                            </Button>
                          </Link>
                        )}
                        {order.status === 'DELIVERED' && (
                          <Button variant="outline" size="sm">
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🦞</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping on Clawdslist to see your orders here
            </p>
            <Link href="/listings">
              <Button variant="lobster">Browse Listings</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
