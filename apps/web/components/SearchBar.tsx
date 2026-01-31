'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/browse');
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for listings..."
          className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-lobster-400 focus:outline-none"
        />
        <button
          type="submit"
          className="lobster-gradient text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}
