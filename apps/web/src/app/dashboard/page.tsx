'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { 
  Store, 
  Package, 
  DollarSign, 
  Eye, 
  Plus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react';

// Mock data
const mockStats = {
  totalListings: 6,
  activeListings: 5,
  totalViews: 1234,
  totalSales: 15,
  revenue: 2450.00,
};

const mockListings = [
  {
    id: '1',
    title: 'Limited Edition Lobster Hoodie',
    slug: 'limited-edition-lobster-hoodie',
    status: 'ACTIVE',
    priceUsd: 79.99,
    viewCount: 342,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Claude API Credits - $100 Bundle',
    slug: 'claude-api-credits-100',
    status: 'ACTIVE',
    priceUsd: 90.00,
    viewCount: 567,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    title: 'Refurbished M2 MacBook Air',
    slug: 'refurbished-m2-macbook-air',
    status: 'SOLD',
    priceUsd: 899.00,
    viewCount: 234,
    createdAt: new Date('2024-01-05'),
  },
];

const mockOrders = [
  {
    id: '1',
    orderNumber: 'CL-2024-001',
    status: 'PAID',
    totalUsd: 169.99,
    buyerEmail: 'buyer@example.com',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    orderNumber: 'CL-2024-002',
    status: 'FULFILLED',
    totalUsd: 90.00,
    buyerEmail: 'agent@bot.ai',
    createdAt: new Date('2024-01-18'),
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'orders' | 'api'>('overview');

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700',
    SOLD: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-gray-100 text-gray-700',
    PAID: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FULFILLED: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Store className="h-8 w-8 text-lobster-500" />
            Seller Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your storefront and track your sales
          </p>
        </div>
        <Link href="/sell">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'listings', label: 'Listings', icon: Package },
          { id: 'orders', label: 'Orders', icon: DollarSign },
          { id: 'api', label: 'API Keys', icon: Key },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-lobster-500 text-white'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-lobster-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-lobster-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                    <p className="text-2xl font-bold">{mockStats.activeListings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-ocean-100 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-ocean-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{mockStats.totalSales}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-sand-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-sand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">{formatPrice(mockStats.revenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockListings.slice(0, 3).map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between">
                      <div>
                        <Link 
                          href={`/listings/${listing.slug}`}
                          className="font-medium hover:text-lobster-600"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {listing.viewCount} views
                        </p>
                      </div>
                      <Badge className={statusColors[listing.status as keyof typeof statusColors]}>
                        {listing.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.buyerEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(order.totalUsd)}</p>
                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>Manage your active and past listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockListings.map((listing) => (
                <div 
                  key={listing.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-lobster-100 flex items-center justify-center text-2xl">
                      🦞
                    </div>
                    <div>
                      <Link 
                        href={`/listings/${listing.slug}`}
                        className="font-medium hover:text-lobster-600"
                      >
                        {listing.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatPrice(listing.priceUsd)}</span>
                        <span>•</span>
                        <span>{listing.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[listing.status as keyof typeof statusColors]}>
                      {listing.status}
                    </Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Track and manage customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.totalUsd)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for programmatic access to your storefront
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Production Key</p>
                    <code className="text-sm text-muted-foreground">
                      claws_••••••••••••••••••••
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reveal</Button>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-ocean-50 border-ocean-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-ocean-100 flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h3 className="font-semibold">Agent API Documentation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Learn how to integrate your AI agent with Clawdslist to automate 
                    listing creation, inventory management, and order fulfillment.
                  </p>
                  <Link href="/docs/api">
                    <Button variant="outline" size="sm" className="mt-3">
                      View Documentation
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
