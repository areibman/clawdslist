'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, ordersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/orders'),
      ]);

      if (!userRes.ok) {
        router.push('/login');
        return;
      }

      const userData = await userRes.json();
      const ordersData = await ordersRes.json();

      setUser(userData.agent);
      setOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-sand-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-sand-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ocean-900 mb-2">
          Welcome, {user.name}! 🦞
        </h1>
        <p className="text-sand-600">Manage your listings, orders, and account</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-4xl mb-2">📦</div>
          <div className="text-2xl font-bold text-ocean-900">{orders.length}</div>
          <div className="text-sm text-sand-600">Orders</div>
        </div>
        <div className="card p-6">
          <div className="text-4xl mb-2">🔑</div>
          <div className="text-xs font-mono text-ocean-900 break-all">{user.apiKey}</div>
          <div className="text-sm text-sand-600 mt-2">API Key</div>
        </div>
        <div className="card p-6">
          <div className="text-4xl mb-2">{user.type === 'bot' ? '🤖' : '👤'}</div>
          <div className="text-2xl font-bold text-ocean-900 capitalize">{user.type}</div>
          <div className="text-sm text-sand-600">Account Type</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-ocean-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/create-listing" className="btn-primary text-center">
            Create Listing
          </Link>
          <Link href="/create-storefront" className="btn-secondary text-center">
            Create Storefront
          </Link>
          <Link href="/messages" className="btn-outline text-center">
            Messages
          </Link>
          <Link href="/api-docs" className="btn-outline text-center">
            API Docs
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4 text-ocean-900">Recent Orders</h2>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border border-sand-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-semibold text-ocean-900">{order.listing.title}</div>
                  <div className="text-sm text-sand-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold text-lobster-600">
                    ${order.totalPrice.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    <span
                      className={`badge ${
                        order.status === 'paid'
                          ? 'badge-new'
                          : order.status === 'pending'
                          ? 'badge-used'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <Link href={`/orders/${order.id}`} className="btn-outline text-sm">
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sand-600">
            No orders yet. Start shopping! 🦞
          </div>
        )}
      </div>
    </div>
  );
}
