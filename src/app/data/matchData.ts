export type MatchStatus = 'active' | 'completed' | 'archived';

export interface Match {
  id: string;
  // Post context
  postId: string;
  postTitle: string;
  postCategory: string;
  postCompensation?: string;
  postLocation?: string;
  // Partner info
  partnerUsername: string;
  partnerDisplayName: string;
  partnerInitials: string;
  partnerAvatarColor: string;
  partnerTalktoLink: string;
  partnerVerified: boolean;
  // Negotiation context
  myInstruction: string;
  agreedTerms: string;
  // Meta
  matchedAt: string;
  status: MatchStatus;
  sessionId: string;
  // 全局 UX 规则：per-item view tracking。user 列表里看到 row（IntersectionObserver 命中）后置 true。
  // 默认 false（新 match 进来未看）。badge 用 status === 'active' && !viewed 计数。
  viewed?: boolean;
}

// Pre-populated mock matches to demonstrate the feature
export const mockMatches: Match[] = [
  {
    id: 'match-001',
    postId: 'p2',
    postTitle: 'MacBook Pro M3 Max 16" — Space Black, AppleCare+',
    postCategory: 'marketplace',
    postCompensation: '$2,800',
    partnerUsername: 'priya_s',
    partnerDisplayName: 'Priya Sharma',
    partnerInitials: 'PS',
    partnerAvatarColor: '#3A1E3A',
    partnerTalktoLink: 'talkto.me/priya_s',
    partnerVerified: true,
    myInstruction: "Ask for a discount. My ceiling is $2,900. If they hold firm, ask about AppleCare+ transfer.",
    agreedTerms: "Counter-offer accepted: $2,650 (–5% from listing). Condition: local pickup within 5 days. AppleCare+ transfer included. Both agents confirmed via talkto.me A2A handshake.",
    matchedAt: '2026-04-15T14:22:00Z',
    status: 'completed',
    sessionId: 'a2a_7f3k9p',
  },
  {
    id: 'match-002',
    postId: 'p5',
    postTitle: 'Rust / Systems Engineer — Remote-first, Series A',
    postCategory: 'jobs',
    postCompensation: '$160k–$200k',
    partnerUsername: 'meridith_k',
    partnerDisplayName: 'Meridith Kwan',
    partnerInitials: 'MK',
    partnerAvatarColor: '#2D4A22',
    partnerTalktoLink: 'talkto.me/meridith_k',
    partnerVerified: true,
    myInstruction: "Ask about remote flexibility and equity. I want full remote, target $195k.",
    agreedTerms: "Intro call scheduled. Role confirmed: fully remote, $185k base + 1.2% equity, 8-person team pre-Series A. Team open to async-first culture. Agent flagged client as priority candidate.",
    matchedAt: '2026-04-14T09:10:00Z',
    status: 'active',
    sessionId: 'a2a_2m8rqx',
  },
  {
    id: 'match-003',
    postId: 'p8',
    postTitle: 'Mission District 1BR Sublease — May 1 to July 31',
    postCategory: 'housing',
    postCompensation: '$2,100/mo',
    postLocation: 'San Francisco, CA',
    partnerUsername: 'lucasbrenner',
    partnerDisplayName: 'Lucas Brenner',
    partnerInitials: 'LB',
    partnerAvatarColor: '#3D2B1F',
    partnerTalktoLink: 'talkto.me/lucasbrenner',
    partnerVerified: false,
    myInstruction: "Ask about move-in date flexibility and if utilities are included. I need May 5 or later.",
    agreedTerms: "Move-in set for May 5 (flexible ±3 days). Utilities not included (~$110/mo est.). Poster agreed to a 1-week extension after July 31 if needed. Viewing scheduled for Apr 19.",
    matchedAt: '2026-04-13T16:45:00Z',
    status: 'active',
    sessionId: 'a2a_9nt4wz',
  },
];
