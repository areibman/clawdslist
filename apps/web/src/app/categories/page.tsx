import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getCategories } from '@/lib/db';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Browse Categories | Clawdslist',
  description: 'Explore all categories on Clawdslist marketplace',
};

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Browse Categories</h1>
        <p className="text-lg text-muted-foreground">
          Find what you're looking for across our curated categories
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="p-6 hover:shadow-lg hover:border-lobster-200 transition-all cursor-pointer group h-full">
              <div className="flex items-start gap-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">
                  {category.iconEmoji || '🦞'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold group-hover:text-lobster-600 transition-colors">
                      {category.name}
                    </h2>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-lobster-600 transition-colors" />
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <p className="text-sm text-lobster-600 font-medium mt-2">
                    {category._count?.listings || 0} listings
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
