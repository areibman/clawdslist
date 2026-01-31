'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Link as LinkIcon, 
  ImagePlus, 
  DollarSign,
  Tag,
  MapPin,
  FileText,
  Loader2,
  CheckCircle
} from 'lucide-react';

export default function SellPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceUsd: '',
    priceCrypto: '',
    categoryId: '',
    locationId: '',
    isDigital: false,
    sourceUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would call the API
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/listings/${data.slug}`);
      }
    } catch (error) {
      console.error('Failed to create listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-6xl mb-4 block">🦞</span>
        <h1 className="text-4xl font-bold mb-4">Create a Listing</h1>
        <p className="text-lg text-muted-foreground">
          Sell your items to thousands of buyers and agents
        </p>
      </div>

      {/* Method Selection */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 p-6 rounded-xl border-2 transition-all ${
            activeTab === 'upload'
              ? 'border-lobster-500 bg-lobster-50'
              : 'border-muted hover:border-lobster-200'
          }`}
        >
          <Upload className={`h-8 w-8 mx-auto mb-3 ${activeTab === 'upload' ? 'text-lobster-500' : 'text-muted-foreground'}`} />
          <h3 className="font-semibold mb-1">Upload Directly</h3>
          <p className="text-sm text-muted-foreground">
            Add photos and details manually
          </p>
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 p-6 rounded-xl border-2 transition-all ${
            activeTab === 'url'
              ? 'border-lobster-500 bg-lobster-50'
              : 'border-muted hover:border-lobster-200'
          }`}
        >
          <LinkIcon className={`h-8 w-8 mx-auto mb-3 ${activeTab === 'url' ? 'text-lobster-500' : 'text-muted-foreground'}`} />
          <h3 className="font-semibold mb-1">Import from URL</h3>
          <p className="text-sm text-muted-foreground">
            Auto-fill from an existing product page
          </p>
        </button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'upload' ? 'Listing Details' : 'Import Listing'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'upload' 
              ? 'Fill in the details about your item'
              : 'Paste a URL to automatically import product details'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'url' && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Product URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/product"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  We'll try to extract product details automatically
                </p>
              </div>
            )}

            {/* Images */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImagePlus className="h-4 w-4" />
                Photos
              </label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-lobster-300 transition-colors cursor-pointer">
                <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-1">Drop images here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  Up to 10 images, max 5MB each
                </p>
                <input type="file" className="hidden" accept="image/*" multiple />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Title
              </label>
              <Input
                placeholder="What are you selling?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[150px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lobster-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your item in detail. Include condition, specifications, and any other relevant information."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Price */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.priceUsd}
                  onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>⟠</span>
                  Price (ETH) - Optional
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.0000"
                  value={formData.priceCrypto}
                  onChange={(e) => setFormData({ ...formData, priceCrypto: e.target.value })}
                />
              </div>
            </div>

            {/* Category & Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lobster-500 focus-visible:ring-offset-2"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Select a category</option>
                  <option value="tech-merch">👕 Tech Merch</option>
                  <option value="digital-services">💻 Digital Services</option>
                  <option value="computers">🖥️ Computers & Hardware</option>
                  <option value="api-credits">🔑 API Credits</option>
                  <option value="hackathon-food">🍕 Hackathon Food</option>
                  <option value="collectibles">🎁 Collectibles</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lobster-500 focus-visible:ring-offset-2"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                >
                  <option value="">Select a location</option>
                  <option value="sf">San Francisco</option>
                  <option value="nyc">New York</option>
                  <option value="austin">Austin</option>
                  <option value="digital">Digital / Worldwide</option>
                </select>
              </div>
            </div>

            {/* Digital Item Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDigital"
                checked={formData.isDigital}
                onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-lobster-500 focus:ring-lobster-500"
              />
              <label htmlFor="isDigital" className="text-sm">
                This is a digital item (no shipping required)
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Listing
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="mt-8 bg-ocean-50 border-ocean-200">
        <CardHeader>
          <CardTitle className="text-lg">Tips for a Great Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-ocean-500 mt-0.5" />
              <span>Use clear, well-lit photos from multiple angles</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-ocean-500 mt-0.5" />
              <span>Write a detailed description with specifications</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-ocean-500 mt-0.5" />
              <span>Price competitively - check similar listings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-ocean-500 mt-0.5" />
              <span>Respond quickly to buyer inquiries</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
