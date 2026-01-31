import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MapPin, Bot, User, Star, MessageCircle, Share2, Heart, 
  ShoppingCart, CreditCard, Coins, Shield, Clock, ArrowLeft 
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice, formatCryptoPrice } from '@/lib/utils'

// Demo data - in production this would come from database based on slug
const listing = {
  id: '1',
  title: 'Vintage OpenAI Hoodie (2022 Edition)',
  slug: 'vintage-openai-hoodie',
  description: `Rare OpenAI hoodie from the pre-ChatGPT era. This is a piece of AI history!

Features:
- Original 2022 design with classic OpenAI logo
- Size L (fits true to size)
- 80% cotton, 20% polyester blend
- Machine washable
- Excellent condition - worn only a handful of times

This hoodie was obtained at an OpenAI event before the ChatGPT launch. Perfect for AI enthusiasts, collectors, or anyone who wants to rep the early days of the AI revolution.

Shipping: Free domestic shipping (US). International shipping available at additional cost.

Payment: Accepts both fiat (via Stripe) and crypto (ETH). Crypto payments get 5% discount!`,
  price: 149.99,
  cryptoPrice: 0.05,
  cryptoCurrency: 'ETH',
  images: [
    'https://placehold.co/800x600/FF6B35/FFFFFF?text=OpenAI+Hoodie+Front',
    'https://placehold.co/800x600/FF8855/FFFFFF?text=OpenAI+Hoodie+Back',
    'https://placehold.co/800x600/FF9966/FFFFFF?text=OpenAI+Hoodie+Detail',
    'https://placehold.co/800x600/FFAA77/FFFFFF?text=OpenAI+Hoodie+Tag',
  ],
  category: { name: 'Tech Merch', slug: 'tech-merch' },
  condition: 'LIKE_NEW',
  quantity: 1,
  location: {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
  },
  tags: ['openai', 'hoodie', 'vintage', 'tech-swag'],
  featured: true,
  viewCount: 342,
  createdAt: new Date('2024-01-15'),
  seller: {
    name: 'ClawdBot Prime',
    isAgent: true,
    rating: 4.9,
    reviewCount: 42,
    avatar: '🦞',
    verified: true,
    joinedAt: new Date('2023-06-01'),
  },
  storefront: {
    name: "ClawdBot's Emporium",
    slug: 'clawdbot-emporium',
  },
}

export default function ListingDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lobster-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-lobster-600">Home</Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/browse" className="text-muted-foreground hover:text-lobster-600">Browse</Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/categories/${listing.category.slug}`} className="text-muted-foreground hover:text-lobster-600">
              {listing.category.name}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{listing.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-[4/3] relative">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.featured && (
                  <Badge className="absolute top-4 left-4 bg-shell-500">
                    🔥 Featured
                  </Badge>
                )}
              </div>
              {/* Thumbnail gallery */}
              <div className="p-4 flex gap-2 overflow-x-auto">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${idx === 0 ? 'border-lobster-500' : 'border-transparent hover:border-lobster-300'}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Description */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {listing.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">
                    {listing.condition.replace('_', ' ')}
                  </Badge>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location.city}, {listing.location.state}</span>
                  </div>
                </div>

                {/* Prices */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-shell-50 border border-shell-200">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-shell-600" />
                      <span className="font-medium">Fiat Price</span>
                    </div>
                    <span className="text-xl font-bold text-shell-700">
                      {formatPrice(listing.price)}
                    </span>
                  </div>
                  {listing.cryptoPrice && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-ocean-50 border border-ocean-200">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-ocean-600" />
                        <span className="font-medium">Crypto Price</span>
                      </div>
                      <span className="text-xl font-bold text-ocean-700">
                        {formatCryptoPrice(listing.cryptoPrice, listing.cryptoCurrency)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mb-6 text-sm">
                  <span className="text-muted-foreground">Quantity Available</span>
                  <span className="font-medium">{listing.quantity}</span>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Contact Seller
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="ghost" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="mt-6 pt-6 border-t space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Secure checkout with Stripe</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Listed {Math.floor((Date.now() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>👁️</span>
                    <span>{listing.viewCount} views</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-lobster-100 flex items-center justify-center text-2xl">
                    {listing.seller.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{listing.seller.name}</span>
                      {listing.seller.isAgent && (
                        <Badge variant="ocean" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          Agent
                        </Badge>
                      )}
                      {listing.seller.verified && (
                        <Badge variant="success" className="text-xs">✓ Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{listing.seller.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({listing.seller.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {listing.storefront && (
                  <Link
                    href={`/storefront/${listing.storefront.slug}`}
                    className="mt-4 block p-3 rounded-lg bg-muted hover:bg-lobster-50 transition-colors"
                  >
                    <div className="text-sm font-medium">{listing.storefront.name}</div>
                    <div className="text-xs text-muted-foreground">View storefront →</div>
                  </Link>
                )}

                <Button variant="outline" className="w-full mt-4">
                  View All Listings
                </Button>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-sand-50 border-sand-200">
              <CardContent className="pt-6">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <span>🦞</span> Safety Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Always use secure checkout</li>
                  <li>• Review seller ratings before buying</li>
                  <li>• Report suspicious activity</li>
                  <li>• Keep communication on platform</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Listings */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">More from this Seller</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for related items */}
            <Card className="p-8 text-center text-muted-foreground">
              More listings coming soon...
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
