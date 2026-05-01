import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Search, SlidersHorizontal, X, ArrowUpRight } from 'lucide-react';
import { posts, categories } from '../data/mockData';
import { PostCard } from '../components/PostCard';
import { CategoryBadge } from '../components/CategoryBadge';
import type { CategoryId } from '../data/mockData';

type SortMode = 'relevant' | 'latest' | 'popular';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') ?? '';

  const [localQuery, setLocalQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [sort, setSort] = useState<SortMode>('relevant');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = useMemo(() => {
    const q = query.toLowerCase().trim();

    let result = posts.filter((p) => {
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.author.displayName.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      );
    });

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (sort === 'latest') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sort === 'popular') {
      result.sort((a, b) => b.viewCount - a.viewCount);
    }
    // 'relevant' = default order (matches first)

    return result;
  }, [query, selectedCategory, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: localQuery });
  };

  // Suggested searches when no query
  const suggestions = ['Co-founder', 'Remote', 'San Francisco', 'AI', 'Designer', 'Rust', 'Sublease', 'Workshop'];

  return (
    <div>
      <div>
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#141414] bg-white">
            <Search className="w-4.5 h-4.5 text-[#666660] shrink-0" style={{ width: '18px', height: '18px' }} />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search listings, tags, people..."
              autoFocus
              className="flex-1 bg-transparent outline-none text-[#141414] placeholder:text-[#BBBBB6]"
              style={{ fontSize: '15px' }}
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => { setLocalQuery(''); setSearchParams({}); }}
                className="text-[#999994] hover:text-[#666660] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#141414] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors shrink-0"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              Search
            </button>
          </div>
        </form>

        {!query ? (
          /* No query state */
          <div>
            <p className="text-[#999994] mb-4" style={{ fontSize: '13px' }}>
              Try searching for
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setLocalQuery(s); setSearchParams({ q: s }); }}
                  className="px-3.5 py-2 rounded-full border border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] hover:bg-[#FAFAF8] transition-all"
                  style={{ fontSize: '13px' }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Category quick access */}
            <p className="text-[#141414] mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
              Browse by category
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {categories.filter((c) => c.id !== 'all').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/c/${cat.id}`)}
                  className="flex items-center justify-between p-4 bg-white border border-[#E8E8E4] rounded-xl hover:border-[#C8C8C4] hover:shadow-sm transition-all text-left group"
                >
                  <div>
                    <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {cat.label}
                    </p>
                    <p className="text-[#999994]" style={{ fontSize: '12px' }}>
                      {cat.description}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#CCCCCA] group-hover:text-[#141414] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Results */
          <div>
            {/* Result summary + filters */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[#141414]" style={{ fontSize: '15px', fontWeight: 600 }}>
                  {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
                </span>
                {query && (
                  <span className="text-[#999994] ml-2" style={{ fontSize: '14px' }}>
                    for "{query}"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="flex items-center gap-1 p-1 bg-[#F4F4F2] rounded-xl">
                  {(['relevant', 'latest', 'popular'] as SortMode[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        sort === s ? 'bg-white text-[#141414] shadow-sm' : 'text-[#666660] hover:text-[#141414]'
                      }`}
                      style={{ fontSize: '12px', fontWeight: sort === s ? 600 : 400 }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    showFilters || selectedCategory !== 'all'
                      ? 'border-[#141414] bg-[#141414] text-white'
                      : 'border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414]'
                  }`}
                  style={{ fontSize: '12px' }}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                  {selectedCategory !== 'all' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="mb-4 p-4 bg-white border border-[#E8E8E4] rounded-xl">
                <p className="text-[#141414] mb-2.5" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-full border transition-all ${
                      selectedCategory === 'all'
                        ? 'border-[#141414] bg-[#141414] text-white'
                        : 'border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414]'
                    }`}
                    style={{ fontSize: '12px' }}
                  >
                    All
                  </button>
                  {categories.filter((c) => c.id !== 'all').map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full border transition-all ${
                        selectedCategory === cat.id
                          ? 'border-[#141414] bg-[#141414] text-white'
                          : 'border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414]'
                      }`}
                      style={{ fontSize: '12px' }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category filter chips (quick) */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full border transition-all ${
                    selectedCategory === cat.id
                      ? 'border-[#141414] bg-[#141414] text-white'
                      : 'border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414]'
                  }`}
                  style={{ fontSize: '12px' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-[#F4F4F2] flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-[#BBBBB6]" />
                </div>
                <p className="text-[#141414]" style={{ fontSize: '15px', fontWeight: 600 }}>
                  No results found
                </p>
                <p className="text-[#999994] mt-1" style={{ fontSize: '13px' }}>
                  Try different keywords or remove some filters.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}