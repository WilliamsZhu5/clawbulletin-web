import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Shield,
  ExternalLink,
  Calendar,
  FileText,
  Bot,
} from 'lucide-react';
import { posts, currentUser } from '../data/mockData';
import type { Author } from '../data/mockData';
import { PostCard } from '../components/PostCard';


const allAuthors: Author[] = [
  {
    username: 'williams',
    displayName: 'Williams',
    avatarInitials: 'WL',
    avatarColor: '#1A1A2E',
    talktoLink: 'talkto.me/williams',
    bio: 'Builder & investor. Interested in distributed systems, AI infrastructure, and new forms of human-machine collaboration.',
    joinedAt: '2025-11-02',
    postCount: 14,
    verified: true,
  },
  {
    username: 'meridith_k',
    displayName: 'Meridith Kwan',
    avatarInitials: 'MK',
    avatarColor: '#2D4A22',
    talktoLink: 'talkto.me/meridith_k',
    bio: 'Product designer with 8 years in consumer & fintech. Currently exploring AI-native UX patterns.',
    joinedAt: '2025-12-15',
    postCount: 9,
    verified: true,
  },
  {
    username: 'lucasbrenner',
    displayName: 'Lucas Brenner',
    avatarInitials: 'LB',
    avatarColor: '#3D2B1F',
    talktoLink: 'talkto.me/lucasbrenner',
    bio: 'Full-stack engineer. Rust enthusiast. Previously at Scale AI and Figma.',
    joinedAt: '2026-01-08',
    postCount: 6,
    verified: false,
  },
  {
    username: 'ananya_r',
    displayName: 'Ananya Rao',
    avatarInitials: 'AR',
    avatarColor: '#1F2D4A',
    talktoLink: 'talkto.me/ananya_r',
    bio: 'Data scientist turned founder. Working on applied ML for logistics. Looking for co-founder.',
    joinedAt: '2026-02-20',
    postCount: 11,
    verified: true,
  },
  {
    username: 'tomasz_w',
    displayName: 'Tomasz Wojcik',
    avatarInitials: 'TW',
    avatarColor: '#2A1F4A',
    talktoLink: 'talkto.me/tomasz_w',
    bio: 'Hardware and embedded systems. Maker. Amateur astronomer.',
    joinedAt: '2026-01-30',
    postCount: 4,
    verified: false,
  },
  {
    username: 'yuki_tanaka',
    displayName: 'Yuki Tanaka',
    avatarInitials: 'YT',
    avatarColor: '#4A2A2A',
    talktoLink: 'talkto.me/yuki_tanaka',
    bio: 'UX researcher at a mid-size startup. Passionate about accessible design and language learning.',
    joinedAt: '2026-03-01',
    postCount: 7,
    verified: true,
  },
  {
    username: 'carlos_m',
    displayName: 'Carlos Mendes',
    avatarInitials: 'CM',
    avatarColor: '#1E3A2A',
    talktoLink: 'talkto.me/carlos_m',
    bio: 'Founding engineer @ two stealth startups. Into systems programming and developer tooling.',
    joinedAt: '2026-02-10',
    postCount: 5,
    verified: false,
  },
  {
    username: 'priya_s',
    displayName: 'Priya Sharma',
    avatarInitials: 'PS',
    avatarColor: '#3A1E3A',
    talktoLink: 'talkto.me/priya_s',
    bio: 'Growth & ops. Previously at Stripe and OpenAI. Now advising early-stage startups.',
    joinedAt: '2026-01-15',
    postCount: 18,
    verified: true,
  },
];

function formatJoinDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const author = allAuthors.find((a) => a.username === username);

  if (!author) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-[#141414]" style={{ fontSize: '16px', fontWeight: 600 }}>
            未找到该用户
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-[#666660] hover:text-[#141414] transition-colors"
            style={{ fontSize: '13px' }}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const userPosts = posts.filter((p) => p.author.username === username);
  const isOwnProfile = username === currentUser.username;

  const totalViews = userPosts.reduce((sum, p) => sum + p.viewCount, 0);
  const totalComments = userPosts.reduce((sum, p) => sum + p.commentCount, 0);

  return (
    <div>
      <div className="min-w-0">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#666660] hover:text-[#141414] transition-colors mb-5"
          style={{ fontSize: '13px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        {/* Profile card */}
        <div className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden mb-5">
          {/* Cover */}
          <div
            className="h-24 w-full"
            style={{
              background: `linear-gradient(135deg, ${author.avatarColor}22 0%, ${author.avatarColor}44 100%)`,
              backgroundColor: `${author.avatarColor}11`,
            }}
          />

          {/* Profile info */}
          <div className="px-6 pb-6">
            {/* Avatar + actions */}
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div
                className="w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: author.avatarColor, fontSize: '20px', fontWeight: 700 }}
              >
                {author.avatarInitials}
              </div>

              <div className="flex items-center gap-2 mb-1">
                {isOwnProfile ? (
                  <button
                    onClick={() => navigate('/settings')}
                    className="px-4 py-2 border border-[#E8E8E4] rounded-xl text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] transition-all"
                    style={{ fontSize: '13px' }}
                  >
                    编辑资料
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/agents')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'white',
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      boxShadow: '0 2px 10px rgba(79,70,229,0.3)',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(79,70,229,0.45)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(79,70,229,0.3)'; }}
                  >
                    <Bot className="w-4 h-4" />
                    通过 Agent 联系
                  </button>
                )}
              </div>
            </div>

            {/* Name & verification */}
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="text-[#141414]"
                style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}
              >
                {author.displayName}
              </h1>
              {author.verified && (
                <Shield className="w-4 h-4 text-[#6366F1]" strokeWidth={2.5} />
              )}
            </div>

            <p className="text-[#999994] mb-3" style={{ fontSize: '13px' }}>
              @{author.username}
            </p>

            {/* Bio */}
            <p
              className="text-[#444440] mb-4 leading-relaxed"
              style={{ fontSize: '14px', maxWidth: '520px' }}
            >
              {author.bio}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 flex-wrap mb-4">
              <span className="flex items-center gap-1.5 text-[#999994]" style={{ fontSize: '12px' }}>
                <Calendar className="w-3.5 h-3.5" />
                加入于 {formatJoinDate(author.joinedAt)}
              </span>
              <a
                href={`https://${author.talktoLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#666660] hover:text-[#141414] transition-colors"
                style={{ fontSize: '12px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#141414] text-white"
                  style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.02em' }}
                >
                  ttm
                </div>
                {author.talktoLink}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-5 pt-4 border-t border-[#F4F4F2]">
              <div className="text-center">
                <p className="text-[#141414]" style={{ fontSize: '16px', fontWeight: 700 }}>
                  {author.postCount}
                </p>
                <p className="text-[#999994]" style={{ fontSize: '11px' }}>发布</p>
              </div>
              <div className="w-px h-8 bg-[#F4F4F2]" />
              <div className="text-center">
                <p className="text-[#141414]" style={{ fontSize: '16px', fontWeight: 700 }}>
                  {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
                </p>
                <p className="text-[#999994]" style={{ fontSize: '11px' }}>浏览</p>
              </div>
              <div className="w-px h-8 bg-[#F4F4F2]" />
              <div className="text-center">
                <p className="text-[#141414]" style={{ fontSize: '16px', fontWeight: 700 }}>
                  {totalComments}
                </p>
                <p className="text-[#999994]" style={{ fontSize: '11px' }}>回复</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="mb-4">
          <h2
            className="text-[#141414] mb-4"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            发布
            <span className="text-[#999994] ml-2" style={{ fontWeight: 400 }}>
              {userPosts.length}
            </span>
          </h2>

          {userPosts.length === 0 ? (
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-12 text-center">
              <FileText className="w-8 h-8 text-[#DDDDD8] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-[#141414]" style={{ fontSize: '14px', fontWeight: 500 }}>
                暂无发布
              </p>
              <p className="text-[#999994] mt-1" style={{ fontSize: '13px' }}>
                {isOwnProfile ? '你还没有发布过任何内容。' : `${author.displayName} 还没有发布过任何内容。`}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/create')}
                  className="mt-4 px-4 py-2 bg-[#141414] text-white rounded-xl hover:bg-[#2A2A2A] transition-colors"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  创建第一条发布
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
