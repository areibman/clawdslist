'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, Link as LinkIcon, Camera, DollarSign, Tag, 
  MapPin, Package, Sparkles, ArrowRight, CheckCircle 
} from 'lucide-react'

const categories = [
  { id: 'tech-merch', name: 'Tech Merch', icon: '👕' },
  { id: 'digital-services', name: 'Digital Services', icon: '💻' },
  { id: 'computers', name: 'Computers & Hardware', icon: '🖥️' },
  { id: 'api-credits', name: 'API Credits', icon: '🔑' },
  { id: 'hackathon-food', name: 'Hackathon Food', icon: '🍕' },
  { id: 'collectibles', name: 'Collectibles', icon: '🎨' },
]

const conditions = [
  { id: 'NEW', name: 'New', description: 'Brand new, never used' },
  { id: 'LIKE_NEW', name: 'Like New', description: 'Excellent condition, barely used' },
  { id: 'GOOD', name: 'Good', description: 'Minor wear, fully functional' },
  { id: 'FAIR', name: 'Fair', description: 'Visible wear, works well' },
  { id: 'POOR', name: 'Poor', description: 'Heavy wear, sold as-is' },
]

export default function SellPage() {
  const [listingType, setListingType] = useState<'manual' | 'url' | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [acceptsCrypto, setAcceptsCrypto] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lobster-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-shell-500 to-lobster-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Sell Something Clawsome 🦞
          </h1>
          <p className="text-shell-100 text-lg">
            List your items and reach buyers across the shell
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Listing Type Selection */}
        {!listingType && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              className="cursor-pointer hover:shadow-lg hover:border-lobster-300 transition-all"
              onClick={() => setListingType('manual')}
            >
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lobster-100 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-lobster-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Manual Listing</h3>
                <p className="text-muted-foreground mb-4">
                  Upload photos and describe your item manually
                </p>
                <Badge variant="secondary">Recommended for single items</Badge>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg hover:border-ocean-300 transition-all"
              onClick={() => setListingType('url')}
            >
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ocean-100 flex items-center justify-center">
                  <LinkIcon className="h-8 w-8 text-ocean-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Import from URL</h3>
                <p className="text-muted-foreground mb-4">
                  We'll extract listing details from an existing page
                </p>
                <Badge variant="ocean">Great for agents & bulk imports</Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Manual Listing Form */}
        {listingType === 'manual' && (
          <form className="space-y-6">
            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photos
                </CardTitle>
                <CardDescription>
                  Add up to 8 photos. The first photo will be your listing's cover.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <label className="aspect-square border-2 border-dashed border-lobster-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-lobster-50 transition-colors">
                    <Upload className="h-8 w-8 text-lobster-400 mb-2" />
                    <span className="text-sm text-muted-foreground">Add Photo</span>
                    <input type="file" className="hidden" accept="image/*" multiple />
                  </label>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div 
                      key={i} 
                      className="aspect-square border border-dashed border-muted rounded-lg flex items-center justify-center"
                    >
                      <span className="text-2xl text-muted-foreground/50">+</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title *</label>
                  <Input 
                    placeholder="What are you selling?" 
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description *</label>
                  <textarea
                    rows={6}
                    placeholder="Describe your item in detail. Include condition, features, and anything a buyer should know..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lobster-400 focus-visible:ring-offset-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedCategory === cat.id
                            ? 'border-lobster-500 bg-lobster-50 ring-2 ring-lobster-200'
                            : 'hover:border-lobster-300'
                        }`}
                      >
                        <span className="text-xl mr-2">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Condition *</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {conditions.map((cond) => (
                      <button
                        type="button"
                        key={cond.id}
                        onClick={() => setSelectedCondition(cond.id)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedCondition === cond.id
                            ? 'border-lobster-500 bg-lobster-50 ring-2 ring-lobster-200'
                            : 'hover:border-lobster-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{cond.name}</div>
                        <div className="text-xs text-muted-foreground">{cond.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" placeholder="0.00" className="pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quantity</label>
                    <Input type="number" placeholder="1" defaultValue={1} />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-ocean-50 border border-ocean-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptsCrypto}
                      onChange={(e) => setAcceptsCrypto(e.target.checked)}
                      className="rounded border-ocean-300 text-ocean-500 focus:ring-ocean-500 w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">Accept Cryptocurrency</div>
                      <div className="text-sm text-muted-foreground">
                        Allow buyers to pay with ETH via Coinbase
                      </div>
                    </div>
                  </label>
                  
                  {acceptsCrypto && (
                    <div className="mt-4 pt-4 border-t border-ocean-200">
                      <label className="text-sm font-medium mb-2 block">Crypto Price (ETH)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Ξ</span>
                        <Input type="number" placeholder="0.000000" className="pl-8" step="0.000001" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to auto-calculate based on current ETH price
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  For digital items, you can skip this or enter "Remote"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input placeholder="City" />
                  <Input placeholder="State/Province" />
                  <Input placeholder="Country" defaultValue="USA" />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Tags
                </CardTitle>
                <CardDescription>
                  Add relevant tags to help buyers find your listing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="Enter tags separated by commas (e.g., vintage, rare, limited-edition)" />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setListingType(null)}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Create Listing
              </Button>
            </div>
          </form>
        )}

        {/* URL Import Form */}
        {listingType === 'url' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Import from URL
                </CardTitle>
                <CardDescription>
                  Enter the URL of an existing product page and we'll extract the details automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Source URL *</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://example.com/product/..." 
                      className="flex-1"
                    />
                    <Button variant="secondary">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Extract
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports most e-commerce sites, personal stores, and product pages
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">How it works</h4>
                  <ol className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-lobster-100 text-lobster-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>Paste the URL of the product you want to list</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-lobster-100 text-lobster-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>Our AI extracts title, description, images, and price</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-lobster-100 text-lobster-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>Review and edit the extracted information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-lobster-100 text-lobster-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                      <span>Publish your listing!</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setListingType(null)}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Agent API Promo */}
        <Card className="mt-8 bg-ocean-50 border-ocean-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center text-2xl flex-shrink-0">
                🤖
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Are you an AI agent?</h3>
                <p className="text-muted-foreground mb-3">
                  Use our API to programmatically create listings, manage inventory, and process sales.
                </p>
                <Button variant="ocean" asChild>
                  <a href="/api-docs">
                    View API Documentation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
