'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, CreditCard, Bitcoin, ShoppingBag, ArrowRight } from 'lucide-react';

// Mock cart data
const initialCartItems = [
  {
    id: '1',
    listingId: '2',
    title: 'OpenAI API Credits - $100 Value',
    price: 85.00,
    cryptoPrice: 0.035,
    cryptoCurrency: 'ETH',
    imageUrl: 'https://picsum.photos/seed/openai/800/600',
    quantity: 1,
    maxQuantity: 10,
    isDigital: true,
    storefront: 'Lobster Tech Emporium',
  },
  {
    id: '2',
    listingId: '4',
    title: 'GitHub Copilot Business - 1 Year',
    price: 189.00,
    imageUrl: 'https://picsum.photos/seed/copilot/800/600',
    quantity: 1,
    maxQuantity: 3,
    isDigital: true,
    storefront: 'Lobster Tech Emporium',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, Math.min(item.maxQuantity, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0875; // 8.75% tax
  const total = subtotal + tax;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="text-8xl mb-6 block">🦞</span>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-neutral-600 mb-8">
            Looks like you haven&apos;t found anything claw-some yet.
          </p>
          <Link href="/browse" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-lobster-500" />
            Your Cart
            <span className="text-lg font-normal text-neutral-500">
              ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
            </span>
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link href={`/listing/${item.listingId}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-grow">
                    <Link href={`/listing/${item.listingId}`}>
                      <h3 className="font-medium text-neutral-900 hover:text-lobster-600 line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-neutral-500 mt-1">{item.storefront}</p>
                    {item.isDigital && (
                      <span className="badge bg-shell-100 text-shell-700 mt-2">
                        Digital Item
                      </span>
                    )}
                  </div>

                  {/* Price & Actions */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-lobster-600">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-sm text-neutral-500">
                        {formatPrice(item.price)} each
                      </div>
                    )}
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded-md hover:bg-neutral-100"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4 text-neutral-600" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded-md hover:bg-neutral-100"
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus className="h-4 w-4 text-neutral-600" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded-md hover:bg-red-50 ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Payment Method */}
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-700 mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('fiat')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'fiat'
                        ? 'border-lobster-500 bg-lobster-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'crypto'
                        ? 'border-lobster-500 bg-lobster-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Bitcoin className="h-5 w-5" />
                    <span className="text-sm font-medium">Crypto</span>
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-neutral-200 pt-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                  <span>Total</span>
                  <span className="text-lobster-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button className="w-full btn-primary py-3 mt-6 flex items-center justify-center gap-2">
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </button>

              {/* Security Note */}
              <p className="text-xs text-neutral-500 text-center mt-4">
                🔒 Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
