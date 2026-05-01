import { useState } from 'react';
import { Bookmark, X, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { posts } from '../data/mockData';
import { PostCard } from '../components/PostCard';

const defaultSavedIds = new Set<string>();

export function SavedPage() {
  const navigate = useNavigate();
  const [savedIds, setSavedIds] = useState<Set<string>>(defaultSavedIds);

  const savedPosts = posts.filter((p) => savedIds.has(p.id));

  const removeFromSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div>
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div
          className="rounded-2xl mb-5 px-5 py-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 55%, #EC4899 100%)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Bookmark style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.7)' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>CLAWBULLETIN</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>Saved</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>Listings you've bookmarked for later</p>
          </div>
        </div>

        {savedPosts.length === 0 ? (
          <div className="bg-white border border-[#E8E8E4] rounded-2xl p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F4F2] flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-6 h-6 text-[#BBBBB6]" strokeWidth={1.5} />
            </div>
            <p className="text-[#141414] mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
              Nothing saved yet
            </p>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              Save interesting listings and they'll appear here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#141414] text-white rounded-xl hover:bg-[#2A2A2A] transition-colors mx-auto"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              Browse listings
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Count + clear */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#999994]" style={{ fontSize: '13px' }}>
                {savedPosts.length} saved listing{savedPosts.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSavedIds(new Set())}
                className="flex items-center gap-1.5 text-[#999994] hover:text-[#666660] transition-colors"
                style={{ fontSize: '12px' }}
              >
                <X className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {savedPosts.map((post) => (
                <div key={post.id} className="relative group">
                  <PostCard post={post} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromSaved(post.id);
                    }}
                    className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white border border-[#E8E8E4] flex items-center justify-center text-[#999994] hover:text-[#F43F5E] hover:border-[#F43F5E] transition-all opacity-0 group-hover:opacity-100 z-10"
                    title="Remove from saved"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
