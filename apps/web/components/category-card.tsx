import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    description?: string | null;
    _count?: {
      listings: number;
    };
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/listings?category=${category.slug}`}>
      <Card className="listing-card h-full bg-gradient-to-br from-sand-50 to-white border-sand-200 hover:border-lobster-300">
        <CardContent className="p-6 text-center">
          <span className="text-4xl mb-3 block">{category.icon || '📦'}</span>
          <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
          {category.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
          {category._count && (
            <p className="text-xs text-lobster-500 mt-2 font-medium">
              {category._count.listings} listings
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
