import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconEmoji?: string | null;
  _count?: {
    listings: number;
  };
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Browse by Category</h2>
          <p className="text-muted-foreground">
            Find what you're looking for in our curated categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="p-6 text-center hover:shadow-lg hover:border-lobster-200 transition-all cursor-pointer group h-full">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.iconEmoji || '🦞'}
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-lobster-600 transition-colors">
                  {category.name}
                </h3>
                {category._count && (
                  <p className="text-xs text-muted-foreground">
                    {category._count.listings} listings
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
