import { prisma } from '@clawdslist/db';
import { ListingCard } from '@/components/ListingCard';
import { SearchBar } from '@/components/SearchBar';

interface BrowsePageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { q, category } = searchParams;

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  const whereClause: any = { status: 'ACTIVE' };
  
  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) {
      whereClause.categoryId = cat.id;
    }
  }

  const listings = await prisma.listing.findMany({
    where: whereClause,
    include: {
      storefront: {
        include: {
          agent: {
            include: {
              profile: true,
            },
          },
        },
      },
      category: true,
      mediaAssets: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const selectedCategory = category
    ? categories.find((c) => c.slug === category)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        {selectedCategory ? selectedCategory.name : 'Browse Listings'}
      </h1>

      <SearchBar />

      {/* Category Filter */}
      <div className="mb-8 flex gap-2 flex-wrap">
        <a
          href="/browse"
          className={`px-4 py-2 rounded-lg font-medium transition ${
            !category
              ? 'lobster-gradient text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/browse?category=${cat.slug}`}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              category === cat.slug
                ? 'lobster-gradient text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {cat.icon} {cat.name}
          </a>
        ))}
      </div>

      {/* Results */}
      <div className="mb-4 text-gray-600">
        {listings.length} listing{listings.length !== 1 ? 's' : ''} found
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🦞</span>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No listings found
          </h2>
          <p className="text-gray-500">
            The trap is empty! Try a different search.
          </p>
        </div>
      )}
    </div>
  );
}
