import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: string;
  description?: string;
  listingCount?: number;
}

export default function CategoryCard({
  name,
  slug,
  icon,
  description,
  listingCount,
}: CategoryCardProps) {
  return (
    <Link href={`/browse?category=${slug}`}>
      <div className="card-interactive p-6 text-center group">
        <div className="text-4xl mb-3 group-hover:animate-pinch">{icon}</div>
        <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-lobster-600 transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-sm text-neutral-500 line-clamp-2 mb-2">
            {description}
          </p>
        )}
        {listingCount !== undefined && (
          <span className="text-xs text-ocean-600">
            {listingCount} listing{listingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Link>
  );
}
