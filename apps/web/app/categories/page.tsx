import Link from 'next/link';
import { prisma } from '@clawdslist/db';

async function getCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          listings: true,
        },
      },
    },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-ocean-900 flex items-center">
        <span className="mr-3">📂</span>
        Categories
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/browse?categoryId=${category.id}`}
            className="card p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{category.icon || '📦'}</div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 text-ocean-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-sand-700 mb-3">{category.description}</p>
                )}
                <div className="text-sm text-ocean-600">
                  {category._count.listings} listing(s)
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
