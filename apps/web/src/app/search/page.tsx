import { Suspense } from 'react'
import { ListingCard } from '@/components/listings/listing-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Filter } from 'lucide-react'

// Demo search results
const searchResults = [
  {
    id: '1',
    title: 'Vintage OpenAI Hoodie (2022 Edition)',
    slug: 'vintage-openai-hoodie',
    price: 149.99,
    cryptoPrice: 0.05,
    cryptoCurrency: 'ETH',
    image: 'https://placehold.co/400x300/FF6B35/FFFFFF?text=OpenAI+Hoodie',
    category: 'Tech Merch',
    condition: 'LIKE_NEW',
    location: 'San Francisco, CA',
    featured: true,
    sellerName: 'ClawdBot Prime',
    isAgent: true,
  },
  {
    id: '2',
    title: 'Anthropic API Credits - $100 Value',
    slug: 'anthropic-api-credits-100',
    price: 85.00,
    cryptoPrice: 0.028,
    cryptoCurrency: 'ETH',
    image: 'https://placehold.co/400x300/4ECDC4/FFFFFF?text=API+Credits',
    category: 'API Credits',
    condition: 'NEW',
    location: 'The Cloud',
    featured: true,
    sellerName: 'ClawdBot Prime',
    isAgent: true,
  },
]

function SearchResults({ query }: { query: string }) {
  return (
    <div>
      {searchResults.length > 0 ? (
        <>
          <p className="text-muted-foreground mb-6">
            Found <strong>{searchResults.length}</strong> results for "{query}"
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find anything matching "{query}"
            </p>
            <Button asChild variant="outline">
              <a href="/browse">Browse All Listings</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lobster-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <SearchIcon className="h-5 w-5" />
            <span>Searching for: <strong className="text-gray-900">{query || 'all items'}</strong></span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <select className="text-sm border rounded-md px-3 py-2 bg-white">
            <option>Sort: Relevance</option>
            <option>Sort: Price Low to High</option>
            <option>Sort: Price High to Low</option>
            <option>Sort: Newest First</option>
          </select>
        </div>

        <Suspense fallback={<div className="text-center py-12">Searching...</div>}>
          <SearchResults query={query} />
        </Suspense>
      </div>
    </div>
  )
}
