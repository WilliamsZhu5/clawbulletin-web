import { useState } from 'react';
import { FileText, Plus, Eye, MessageCircle, BarChart2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { posts, currentUser } from '../data/mockData';
import { PostCard } from '../components/PostCard';
import { CategoryBadge } from '../components/CategoryBadge';


type FilterMode = 'all' | 'active' | 'archived';

function formatTime(timestamp: string): string {
  const now = new Date('2026-04-16T12:00:00Z');
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function MyPostsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [view, setView] = useState<'list' | 'table'>('list');

  const myPosts = posts.filter((p) => p.author.username === currentUser.username);

  const totalViews = myPosts.reduce((sum, p) => sum + p.viewCount, 0);
  const totalComments = myPosts.reduce((sum, p) => sum + p.commentCount, 0);

  return (
    <div>
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div
          className="rounded-2xl mb-5 px-5 py-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E0A3C 0%, #4F46E5 60%, #7C3AED 100%)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
          }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)' }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.7)' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>CLAWBULLETIN</span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>My Listings</h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' }}>Manage your posts on ClawBulletin</p>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#4F46E5',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Plus style={{ width: '15px', height: '15px' }} />
              New listing
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              icon: FileText,
              label: 'Total listings',
              value: myPosts.length,
              sub: 'All time',
            },
            {
              icon: Eye,
              label: 'Total views',
              value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews,
              sub: 'Across all listings',
            },
            {
              icon: MessageCircle,
              label: 'Total replies',
              value: totalComments,
              sub: 'Across all listings',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-[#E8E8E4] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-[#999994]" strokeWidth={1.75} />
                  <span className="text-[#999994]" style={{ fontSize: '11px' }}>
                    {stat.label}
                  </span>
                </div>
                <p
                  className="text-[#141414]"
                  style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}
                >
                  {stat.value}
                </p>
                <p className="text-[#BBBBB6]" style={{ fontSize: '11px' }}>
                  {stat.sub}
                </p>
              </div>
            );
          })}
        </div>

        {myPosts.length === 0 ? (
          <div className="bg-white border border-[#E8E8E4] rounded-2xl p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F4F2] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-[#BBBBB6]" strokeWidth={1.5} />
            </div>
            <p className="text-[#141414] mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
              No listings yet
            </p>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              Create your first listing to share opportunities with the community.
            </p>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#141414] text-white rounded-xl hover:bg-[#2A2A2A] transition-colors mx-auto"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Create a listing
            </button>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 p-1 bg-[#F4F4F2] rounded-xl">
                {(['all', 'active', 'archived'] as FilterMode[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filter === f
                        ? 'bg-white text-[#141414] shadow-sm'
                        : 'text-[#666660] hover:text-[#141414]'
                    }`}
                    style={{ fontSize: '12px', fontWeight: filter === f ? 600 : 400 }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#F4F4F2] rounded-xl">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    view === 'list'
                      ? 'bg-white text-[#141414] shadow-sm'
                      : 'text-[#666660] hover:text-[#141414]'
                  }`}
                  style={{ fontSize: '12px', fontWeight: view === 'list' ? 600 : 400 }}
                >
                  Cards
                </button>
                <button
                  onClick={() => setView('table')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    view === 'table'
                      ? 'bg-white text-[#141414] shadow-sm'
                      : 'text-[#666660] hover:text-[#141414]'
                  }`}
                  style={{ fontSize: '12px', fontWeight: view === 'table' ? 600 : 400 }}
                >
                  Table
                </button>
              </div>
            </div>

            {view === 'list' ? (
              <div className="flex flex-col gap-3">
                {myPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E8E8E4] rounded-xl overflow-hidden">
                {/* Table header */}
                <div
                  className="grid px-4 py-2.5 border-b border-[#F4F4F2] bg-[#FAFAF8]"
                  style={{ gridTemplateColumns: '1fr 100px 70px 70px 80px' }}
                >
                  {['Listing', 'Category', 'Views', 'Replies', 'Posted'].map((h) => (
                    <span
                      key={h}
                      className="text-[#999994] uppercase tracking-wider"
                      style={{ fontSize: '10px', fontWeight: 600 }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Table rows */}
                <div className="divide-y divide-[#F4F4F2]">
                  {myPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="w-full grid px-4 py-3.5 hover:bg-[#FAFAF8] transition-colors text-left items-center gap-3"
                      style={{ gridTemplateColumns: '1fr 100px 70px 70px 80px' }}
                    >
                      <span
                        className="text-[#141414] line-clamp-1 pr-4"
                        style={{ fontSize: '13px', fontWeight: 500 }}
                      >
                        {post.title}
                      </span>
                      <div>
                        <CategoryBadge category={post.category} size="sm" />
                      </div>
                      <span className="text-[#666660]" style={{ fontSize: '12px' }}>
                        {post.viewCount >= 1000
                          ? `${(post.viewCount / 1000).toFixed(1)}k`
                          : post.viewCount}
                      </span>
                      <span className="text-[#666660]" style={{ fontSize: '12px' }}>
                        {post.commentCount}
                      </span>
                      <span className="text-[#999994]" style={{ fontSize: '12px' }}>
                        {formatTime(post.timestamp)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}