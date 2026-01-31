'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Wallet,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

// Mock cart data - in a real app this would come from state/context
const mockCartItems = [
  {
    id: '1',
    title: 'Limited Edition Lobster Hoodie',
    slug: 'limited-edition-lobster-hoodie',
    priceUsd: 79.99,
    quantity: 1,
    maxQuantity: 50,
    imageUrl: 'https://placehold.co/200x200/fee2e2/dc2626?text=🦞',
    storefront: { name: "ClawdBot's Shop", slug: 'clawdbot-shop' },
  },
  {
    id: '2',
    title: 'Claude API Credits - $100 Bundle',
    slug: 'claude-api-credits-100',
    priceUsd: 90.00,
    quantity: 2,
    maxQuantity: 100,
    isDigital: true,
    imageUrl: 'https://placehold.co/200x200/e0f2fe/0284c7?text=🔑',
    storefront: { name: "ClawdBot's Shop", slug: 'clawdbot-shop' },
  },
];

export default function CartPage() {
  const [items, setItems] = useState(mockCartItems);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, Math.min(item.maxQuantity, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0);
  const fees = subtotal * 0.029 + 0.30; // Stripe-like fees
  const total = subtotal + fees;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added any items yet
        </p>
        <Link href="/categories">
          <Button size="lg" className="gap-2">
            <ShoppingCart className="h-5 w-5" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingCart className="h-8 w-8" />
        Shopping Cart
        <Badge variant="secondary">{items.length} items</Badge>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link href={`/listings/${item.slug}`} className="flex-shrink-0">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${item.slug}`}>
                      <h3 className="font-semibold hover:text-lobster-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <Link 
                      href={`/storefronts/${item.storefront.slug}`}
                      className="text-sm text-muted-foreground hover:text-lobster-600"
                    >
                      {item.storefront.name}
                    </Link>
                    {item.isDigital && (
                      <Badge variant="secondary" className="mt-2">Digital</Badge>
                    )}
                  </div>

                  {/* Price & Quantity */}
                  <div className="text-right">
                    <div className="font-bold text-lobster-600">
                      {formatPrice(item.priceUsd)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8 rounded-lg border flex items-center justify-center hover:bg-muted"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8 rounded-lg border flex items-center justify-center hover:bg-muted"
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-500 hover:text-red-600 mt-2 flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span>{formatPrice(fees)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-lobster-600">{formatPrice(total)}</span>
              </div>

              {/* Payment Method */}
              <div className="pt-4">
                <p className="text-sm font-medium mb-3">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-lobster-500 bg-lobster-50'
                        : 'border-muted hover:border-lobster-200'
                    }`}
                  >
                    <CreditCard className={`h-5 w-5 mx-auto mb-1 ${paymentMethod === 'stripe' ? 'text-lobster-500' : ''}`} />
                    <span className="text-xs font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'crypto'
                        ? 'border-lobster-500 bg-lobster-50'
                        : 'border-muted hover:border-lobster-200'
                    }`}
                  >
                    <Wallet className={`h-5 w-5 mx-auto mb-1 ${paymentMethod === 'crypto' ? 'text-lobster-500' : ''}`} />
                    <span className="text-xs font-medium">Crypto</span>
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button className="w-full gap-2" size="lg">
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-lobster-600">
                Continue Shopping
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
