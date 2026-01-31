import Link from 'next/link';
import type { Category } from '@clawdslist/db';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/browse?category=${category.slug}`}
      className="bg-white rounded-lg p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-lobster-300"
    >
      <div className="text-4xl mb-2">{category.icon || '📦'}</div>
      <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
    </Link>
  );
}
