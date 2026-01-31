import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryCard } from '@/components/categories/category-card'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'Tech Merch',
    slug: 'tech-merch',
    icon: '👕',
    count: 42,
    color: '#FF6B35',
    description: 'Swag, apparel, and merchandise from tech companies',
    featured: [
      { name: 'Hoodies & Apparel', count: 18 },
      { name: 'Stickers & Pins', count: 12 },
      { name: 'Office Swag', count: 8 },
      { name: 'Limited Editions', count: 4 },
    ],
  },
  {
    name: 'Digital Services',
    slug: 'digital-services',
    icon: '💻',
    count: 28,
    color: '#4ECDC4',
    description: 'Software, SaaS, and digital services',
    featured: [
      { name: 'Code Review', count: 8 },
      { name: 'Design Services', count: 10 },
      { name: 'Consulting', count: 6 },
      { name: 'Training', count: 4 },
    ],
  },
  {
    name: 'Computers & Hardware',
    slug: 'computers',
    icon: '🖥️',
    count: 35,
    color: '#45B7D1',
    description: 'Laptops, desktops, components, and peripherals',
    featured: [
      { name: 'Laptops', count: 12 },
      { name: 'Components', count: 10 },
      { name: 'Peripherals', count: 8 },
      { name: 'Networking', count: 5 },
    ],
  },
  {
    name: 'API Credits',
    slug: 'api-credits',
    icon: '🔑',
    count: 19,
    color: '#96CEB4',
    description: 'API credits, tokens, and cloud compute resources',
    featured: [
      { name: 'OpenAI Credits', count: 6 },
      { name: 'Anthropic Credits', count: 4 },
      { name: 'Cloud Compute', count: 5 },
      { name: 'Other APIs', count: 4 },
    ],
  },
  {
    name: 'Hackathon Food',
    slug: 'hackathon-food',
    icon: '🍕',
    count: 15,
    color: '#FFEAA7',
    description: 'Snacks, energy drinks, and sustenance for builders',
    featured: [
      { name: 'Energy Drinks', count: 5 },
      { name: 'Snack Boxes', count: 4 },
      { name: 'Coffee & Tea', count: 3 },
      { name: 'Meal Kits', count: 3 },
    ],
  },
  {
    name: 'Collectibles',
    slug: 'collectibles',
    icon: '🎨',
    count: 23,
    color: '#DDA0DD',
    description: 'NFTs, rare items, and digital collectibles',
    featured: [
      { name: 'Digital Art', count: 8 },
      { name: 'Trading Cards', count: 6 },
      { name: 'Memorabilia', count: 5 },
      { name: 'Vintage Tech', count: 4 },
    ],
  },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lobster-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-lobster-500 to-shell-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Categories</h1>
          <p className="text-lobster-100 text-lg">
            Find exactly what you're looking for 🦞
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Grid */}
        <div className="space-y-8">
          {categories.map((category) => (
            <Card key={category.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row">
                {/* Category Header */}
                <div 
                  className="md:w-64 p-6 flex flex-col items-center justify-center text-center"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
                    style={{ backgroundColor: `${category.color}30` }}
                  >
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold mb-1">{category.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{category.count} listings</p>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-sm font-medium flex items-center gap-1 hover:underline"
                    style={{ color: category.color }}
                  >
                    Browse All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Subcategories */}
                <div className="flex-1 p-6">
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {category.featured.map((sub) => (
                      <Link
                        key={sub.name}
                        href={`/categories/${category.slug}?sub=${encodeURIComponent(sub.name.toLowerCase().replace(' ', '-'))}`}
                        className="p-3 rounded-lg border hover:border-lobster-300 hover:bg-lobster-50 transition-colors group"
                      >
                        <div className="font-medium text-sm group-hover:text-lobster-600">
                          {sub.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sub.count} items
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Suggest Category */}
        <Card className="mt-12 bg-ocean-50 border-ocean-200">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-bold mb-2">Missing a category?</h3>
            <p className="text-muted-foreground mb-4">
              We're always looking to expand! Suggest a new category for the marketplace.
            </p>
            <Link
              href="/suggest-category"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-ocean-500 text-white hover:bg-ocean-600 transition-colors"
            >
              Suggest Category
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
