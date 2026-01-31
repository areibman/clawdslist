'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, ImagePlus, Link2, Loader2 } from 'lucide-react';

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'manual' | 'url'>('manual');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    locationId: '',
    condition: 'NEW',
    isDigital: false,
    cryptoPrice: '',
    cryptoCurrency: '',
    sourceUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          cryptoPrice: formData.cryptoPrice ? parseFloat(formData.cryptoPrice) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const data = await response.json();
      toast({
        title: 'Listing created! 🦞',
        description: 'Your listing is now live on Clawdslist.',
      });
      router.push(`/listings/${data.data.slug}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlImport = async () => {
    if (!formData.sourceUrl) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ingestion/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: formData.sourceUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to import from URL');
      }

      toast({
        title: 'Import started! 🦞',
        description: 'We\'re crawling the URL. You\'ll be notified when ready.',
      });
      router.push('/listings');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import from URL. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-sand-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/listings" className="text-muted-foreground hover:text-lobster-600 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to listings
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🦞</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Listing</h1>
          <p className="text-muted-foreground">
            Share your item with the Clawdslist community
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={mode === 'manual' ? 'lobster' : 'outline'}
            className="flex-1"
            onClick={() => setMode('manual')}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Manual Entry
          </Button>
          <Button
            variant={mode === 'url' ? 'lobster' : 'outline'}
            className="flex-1"
            onClick={() => setMode('url')}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Import from URL
          </Button>
        </div>

        {mode === 'url' ? (
          <Card>
            <CardHeader>
              <CardTitle>Import from URL</CardTitle>
              <CardDescription>
                Paste a product URL and we'll automatically extract the listing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">Product URL</Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://example.com/product/..."
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </div>
              <Button
                onClick={handleUrlImport}
                disabled={loading || !formData.sourceUrl}
                className="w-full bg-lobster-500 hover:bg-lobster-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Listing'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., OpenAI API Credits - 100K Tokens"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="tech-merch">👕 Tech Merch</option>
                      <option value="digital-services">💻 Digital Services</option>
                      <option value="computers">🖥️ Computers & Hardware</option>
                      <option value="api-credits">🔑 API Credits</option>
                      <option value="hackathon-food">🍕 Hackathon Food</option>
                      <option value="collectibles">🎨 Collectibles</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <select
                      id="condition"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      required
                    >
                      <option value="NEW">New</option>
                      <option value="LIKE_NEW">Like New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <select
                    id="location"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  >
                    <option value="">Select location</option>
                    <option value="sf-bay-area">SF Bay Area</option>
                    <option value="nyc">New York City</option>
                    <option value="austin">Austin</option>
                    <option value="seattle">Seattle</option>
                    <option value="digital">Digital / Remote</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDigital"
                    checked={formData.isDigital}
                    onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isDigital">This is a digital item (instant delivery)</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-sand-200 pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Accept Crypto (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cryptoPrice">Crypto Price</Label>
                      <Input
                        id="cryptoPrice"
                        type="number"
                        step="0.0001"
                        min="0"
                        placeholder="0.00"
                        value={formData.cryptoPrice}
                        onChange={(e) => setFormData({ ...formData, cryptoPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cryptoCurrency">Currency</Label>
                      <select
                        id="cryptoCurrency"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={formData.cryptoCurrency}
                        onChange={(e) => setFormData({ ...formData, cryptoCurrency: e.target.value })}
                      >
                        <option value="">Select currency</option>
                        <option value="ETH">ETH</option>
                        <option value="USDC">USDC</option>
                        <option value="SOL">SOL</option>
                        <option value="BTC">BTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>Add up to 10 photos of your item</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-sand-300 rounded-lg p-8 text-center">
                  <ImagePlus className="w-12 h-12 text-sand-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Drag and drop images here, or click to browse
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Upload Images
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-lobster-500 hover:bg-lobster-600" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Post Listing'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
