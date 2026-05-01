export type CategoryId = 'all' | 'jobs' | 'projects' | 'marketplace' | 'skills' | 'housing' | 'events';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  description: string;
}

export interface Author {
  username: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  talktoLink: string;
  bio: string;
  joinedAt: string;
  postCount: number;
  verified: boolean;
}

export interface Comment {
  id: string;
  author: Author;
  body: string;
  timestamp: string;
  likes: number;
}

export interface Post {
  id: string;
  title: string;
  titleZh?: string;
  body: string;
  bodyZh?: string;
  category: CategoryId;
  subcategory: string;
  tags: string[];
  author: Author;
  timestamp: string;
  commentCount: number;
  viewCount: number;
  comments: Comment[];
  location?: string;
  compensation?: string;
  isPinned?: boolean;
}

export const categories: Category[] = [
  { id: 'all', label: 'All', icon: 'LayoutGrid', description: 'All listings' },
  { id: 'jobs', label: 'Jobs', icon: 'Briefcase', description: 'Full-time & part-time opportunities' },
  { id: 'projects', label: 'Projects', icon: 'Rocket', description: 'Side projects & co-founder search' },
  { id: 'marketplace', label: 'Marketplace', icon: 'ShoppingBag', description: 'Buy, sell & exchange items' },
  { id: 'skills', label: 'Skills', icon: 'Wrench', description: 'Skill exchange & services' },
  { id: 'housing', label: 'Housing', icon: 'Building2', description: 'Rentals, subleases & roommates' },
  { id: 'events', label: 'Events', icon: 'CalendarDays', description: 'Meetups, workshops & gatherings' },
];

export const categorySubcategories: Record<string, string[]> = {
  jobs: ['Full-time', 'Part-time', 'Contract', 'Internship'],
  projects: ['Side Project', 'Co-founder', 'Open Source', 'Research'],
  marketplace: ['Sell', 'Buy', 'Exchange', 'Free'],
  skills: ['Offer (Free)', 'Offer (Paid)', 'Looking For'],
  housing: ['Rent', 'Sublease', 'Roommate', 'Short-term'],
  events: ['Meetup', 'Workshop', 'Conference', 'Social'],
};

const authors: Author[] = [
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

export const posts: Post[] = [
  {
    id: '1',
    title: 'Founding Frontend Engineer — stealth AI infra startup, Series A underway',
    body: `We are building the next generation of AI inference infrastructure — think model serving, batching, and scheduling at extreme scale. Our founding team includes alumni from Google DeepMind, Meta AI, and two previous successful exits.

We are looking for a founding frontend engineer who can own the entire web surface: from internal dashboards and developer tooling to the customer-facing product. You will work directly with the founders and have real equity and real ownership.

The role is full-time, on-site in San Francisco. Compensation is competitive with top-tier startup packages.

What we are looking for:
— Strong TypeScript / React experience (4+ years)
— Deep care for craft: performance, accessibility, design systems
— Comfortable working in fast-moving, ambiguous environments
— Bonus: experience with data visualization, GPU metrics, or infra tooling

If this sounds like you, reach out via talkto.me and share something you have built.`,
    category: 'jobs',
    subcategory: 'Full-time',
    tags: ['React', 'TypeScript', 'AI infra', 'San Francisco', 'Founding engineer'],
    author: authors[0],
    timestamp: '2026-04-16T09:15:00Z',
    commentCount: 18,
    viewCount: 1240,
    location: 'San Francisco, CA',
    compensation: '$180k–$230k + equity',
    comments: [
      {
        id: 'c1',
        author: authors[2],
        body: 'This sounds really compelling. What is the team size right now and what is the current infra stack?',
        timestamp: '2026-04-16T10:20:00Z',
        likes: 4,
      },
      {
        id: 'c2',
        author: authors[0],
        body: 'Team is 6 right now — 4 engineers, 1 PM, 1 designer. Stack is Python on the backend, Rust for the hot path, and we are greenfield on the frontend (your call). Happy to chat more over talkto.me.',
        timestamp: '2026-04-16T10:45:00Z',
        likes: 7,
      },
      {
        id: 'c3',
        author: authors[6],
        body: 'Sent a message via talkto.me. Have worked on similar infra tooling at my last place.',
        timestamp: '2026-04-16T11:30:00Z',
        likes: 1,
      },
    ],
    isPinned: false,
  },
  {
    id: '2',
    title: 'Looking for a Rust systems engineer — open source distributed key-value store',
    body: `I have been building an open source distributed key-value store for the past 8 months, mostly evenings and weekends. The core is written in Rust with a Raft consensus module and a custom storage engine. It is at a stage where I want to bring in a collaborator who can push it forward together.

This is not a paying gig — it is a side project with a potential to become something real. Looking for someone who:
— Is passionate about systems programming (Rust preferred, Go fine)
— Has opinions about storage, consistency models, or distributed consensus
— Can commit at least 10 hours per week
— Wants their name on something that ships

GitHub link available on request. Let us talk.`,
    category: 'projects',
    subcategory: 'Side Project',
    tags: ['Rust', 'Distributed systems', 'Open source', 'Key-value store', 'Raft'],
    author: authors[2],
    timestamp: '2026-04-16T07:30:00Z',
    commentCount: 9,
    viewCount: 580,
    comments: [
      {
        id: 'c4',
        author: authors[0],
        body: 'This is exactly the kind of project I have been looking to contribute to. Are you using async Tokio or a custom executor?',
        timestamp: '2026-04-16T08:00:00Z',
        likes: 3,
      },
      {
        id: 'c5',
        author: authors[2],
        body: 'Tokio for now. The storage engine is completely synchronous which is actually a deliberate trade-off. Happy to share the repo.',
        timestamp: '2026-04-16T08:20:00Z',
        likes: 5,
      },
    ],
    isPinned: false,
  },
  {
    id: '3',
    title: 'MacBook Pro M3 Max 16" — 64GB RAM, 2TB SSD, Space Black',
    body: `Selling my MacBook Pro M3 Max. Bought it in January 2025, used for about a year. Moving to a desktop setup and do not need the laptop anymore.

Specs:
— M3 Max chip (16-core CPU, 40-core GPU)
— 64GB unified memory
— 2TB SSD
— Space Black
— AppleCare+ until January 2027

Condition: 9.5 out of 10. Minor scuff on the bottom panel from a case. Screen and keyboard are flawless. All original packaging and accessories included.

Price: $3,200. Open to reasonable offers. Prefer local pickup in SF (Mission District) but can ship insured.`,
    category: 'marketplace',
    subcategory: 'Sell',
    tags: ['MacBook Pro', 'M3 Max', 'Apple', 'Laptop', 'San Francisco'],
    author: authors[1],
    timestamp: '2026-04-15T16:45:00Z',
    commentCount: 5,
    viewCount: 892,
    location: 'Mission District, SF',
    compensation: '$3,200 OBO',
    comments: [
      {
        id: 'c6',
        author: authors[4],
        body: 'Is $3,000 doable? Happy to do local pickup today.',
        timestamp: '2026-04-15T17:10:00Z',
        likes: 0,
      },
      {
        id: 'c7',
        author: authors[1],
        body: 'Sent you a note via talkto.me. Lowest I can go is $3,100 given the AppleCare+ still has time left.',
        timestamp: '2026-04-15T17:35:00Z',
        likes: 2,
      },
    ],
    isPinned: false,
  },
  {
    id: '4',
    title: 'AI x Logistics co-founder search — looking for a technical builder',
    body: `I am a data scientist with 7 years in supply chain and logistics. For the past year I have been building a routing and demand-forecasting product targeting mid-market 3PLs. The problem is well-defined, the market is underserved, and I have strong early signal from pilots with two customers.

I am looking for a technical co-founder — ideally someone with a strong ML or systems background — who can own the product architecture and engineering velocity. I am not looking for an employee; I am looking for a partner.

What I bring:
— Deep domain expertise in logistics ops
— Two paying pilots (proof of demand)
— A working prototype in Python
— A network that includes potential customers and advisors

What I am looking for in you:
— Strong ML/backend engineering (Python, possibly Rust)
— Track record of shipping real products
— Honest, low-ego, high-output
— Available to go full-time within 3–6 months

Let us have a real conversation first. No decks, no NDAs at this stage.`,
    category: 'projects',
    subcategory: 'Co-founder',
    tags: ['AI', 'Logistics', 'Co-founder', 'ML', 'B2B', 'Early stage'],
    author: authors[3],
    timestamp: '2026-04-15T11:00:00Z',
    commentCount: 23,
    viewCount: 1560,
    comments: [
      {
        id: 'c8',
        author: authors[6],
        body: 'What is the current revenue run rate from the pilots? And are you incorporated yet?',
        timestamp: '2026-04-15T11:40:00Z',
        likes: 6,
      },
      {
        id: 'c9',
        author: authors[3],
        body: 'Both great questions — let us take this to a real conversation. Reach me on talkto.me and I will share more context.',
        timestamp: '2026-04-15T12:00:00Z',
        likes: 4,
      },
      {
        id: 'c10',
        author: authors[7],
        body: 'This is a great write-up. The 3PL market is genuinely underserved on the tech side. Following.',
        timestamp: '2026-04-15T13:30:00Z',
        likes: 3,
      },
    ],
    isPinned: false,
  },
  {
    id: '5',
    title: 'UX research sessions — $80/hr, available part-time for product teams',
    body: `I am a senior UX researcher with 6 years of experience across consumer apps, B2B SaaS, and fintech. I recently went independent and am taking on a few part-time engagements.

What I can help with:
— User interviews (planning, recruiting, facilitation, synthesis)
— Usability testing (moderated and unmoderated)
— Survey design and analysis
— Jobs-to-be-done research
— Research roadmapping for early-stage teams

I work well with teams that are moving fast and need clear insights, not 60-page reports.

Rate: $80/hr. Minimum 10 hrs/week engagement. Available immediately.

If you want to learn more before booking a call, feel free to message me on talkto.me first.`,
    category: 'skills',
    subcategory: 'Offer (Paid)',
    tags: ['UX Research', 'User interviews', 'Usability testing', 'Freelance', 'Remote'],
    author: authors[5],
    timestamp: '2026-04-15T09:20:00Z',
    commentCount: 7,
    viewCount: 440,
    compensation: '$80/hr',
    comments: [
      {
        id: 'c11',
        author: authors[1],
        body: 'Do you have experience with early-stage B2C apps in the 0–5k DAU range? That is where we are.',
        timestamp: '2026-04-15T10:00:00Z',
        likes: 2,
      },
      {
        id: 'c12',
        author: authors[5],
        body: 'Yes, exactly that stage is where I have done some of my best work. Let us talk on talkto.me.',
        timestamp: '2026-04-15T10:30:00Z',
        likes: 3,
      },
    ],
    isPinned: false,
  },
  {
    id: '6',
    title: '1BR in SoMa subletting June 1 – August 31 — $2,400/mo',
    body: `I am going back to Europe for the summer and looking for someone to sublet my apartment.

Details:
— 1 bedroom, 1 bath
— 620 sq ft, well-laid-out
— 5th floor, great light, no direct street noise
— In-unit laundry
— Bike storage in building
— 8-minute walk to Montgomery BART
— Building allows subletting with landlord approval (process is smooth)

The apartment comes furnished: queen bed, sofa, desk, full kitchen setup. You just need your clothes and toiletries.

Price: $2,400/month (below market for the area — my goal is finding the right person, not maximizing return). Utilities roughly $100–130/month extra.

June 1 to August 31. Flexible on exact start and end dates by a few days.

Message me via talkto.me if interested. I will want a brief call before agreeing to anything.`,
    category: 'housing',
    subcategory: 'Sublease',
    tags: ['SoMa', 'San Francisco', '1BR', 'Furnished', 'Sublease', 'Summer'],
    author: authors[1],
    timestamp: '2026-04-14T20:10:00Z',
    commentCount: 12,
    viewCount: 2340,
    location: 'SoMa, San Francisco',
    compensation: '$2,400/month',
    comments: [
      {
        id: 'c13',
        author: authors[3],
        body: 'Sent a message on talkto.me. Very interested — I am between apartments and the timing is perfect.',
        timestamp: '2026-04-14T20:45:00Z',
        likes: 0,
      },
      {
        id: 'c14',
        author: authors[4],
        body: 'Is there a parking space available or is it street parking only?',
        timestamp: '2026-04-14T21:00:00Z',
        likes: 0,
      },
      {
        id: 'c15',
        author: authors[1],
        body: 'No dedicated parking — street parking in SoMa is manageable but not easy. Most people who live here bike or BART.',
        timestamp: '2026-04-14T21:20:00Z',
        likes: 1,
      },
    ],
    isPinned: false,
  },
  {
    id: '7',
    title: 'Founders After Hours — April edition, Thursday 7pm @ The Interval',
    body: `A small, regular gathering of founders, engineers, and operators in San Francisco.

No agenda, no pitches, no panels. Just good conversation over drinks.

Details:
— Thursday, April 24, 2026
— 7:00pm – 10:00pm (come and go as you like)
— The Interval at Long Now, Fort Mason, SF
— Free to attend — just RSVP so we know capacity

Who comes: early-stage founders, engineers at startups and scale-ups, designers, researchers, a few investors. Tends to be 25–40 people. Highly conversational crowd.

If you have a talkto.me profile, add it to your name tag when you arrive — makes it easy for people to follow up later.

RSVP by messaging me on talkto.me or commenting below.`,
    category: 'events',
    subcategory: 'Social',
    tags: ['SF', 'Founders', 'Networking', 'The Interval', 'Free', 'Monthly'],
    author: authors[7],
    timestamp: '2026-04-14T14:00:00Z',
    commentCount: 31,
    viewCount: 1890,
    location: 'Fort Mason, San Francisco',
    comments: [
      {
        id: 'c16',
        author: authors[0],
        body: 'Coming. Will be there around 7:30. Great venue choice.',
        timestamp: '2026-04-14T14:30:00Z',
        likes: 5,
      },
      {
        id: 'c17',
        author: authors[3],
        body: 'Attending! Should I bring anything?',
        timestamp: '2026-04-14T15:00:00Z',
        likes: 1,
      },
      {
        id: 'c18',
        author: authors[7],
        body: 'Just yourself and good conversation. The bar handles the rest.',
        timestamp: '2026-04-14T15:10:00Z',
        likes: 8,
      },
    ],
    isPinned: false,
  },
  {
    id: '8',
    title: 'Trek Émonda SL 6 road bike — size 54cm, 2022',
    body: `Selling my road bike. I moved cities and my new neighborhood is not very bike-friendly so it just sits in my apartment.

Bike: Trek Émonda SL 6
Year: 2022
Size: 54cm (fits riders roughly 5'7" to 5'11")
Groupset: Shimano Ultegra R8000
Wheels: Bontrager Paradigm Elite 25 (tubeless-ready)
Condition: Used but well-maintained. I had it serviced every 6 months. Some cable and housing wear but otherwise excellent mechanical condition. Minor paint chips on the chainstay.

Asking $2,100. Open to trades for photography equipment (mirrorless cameras, lenses) of equivalent value.

Local pickup preferred in Berkeley. Can discuss shipping for serious buyers.`,
    category: 'marketplace',
    subcategory: 'Exchange',
    tags: ['Road bike', 'Trek', 'Cycling', 'Berkeley', 'Ultegra'],
    author: authors[4],
    timestamp: '2026-04-14T10:30:00Z',
    commentCount: 4,
    viewCount: 310,
    location: 'Berkeley, CA',
    compensation: '$2,100 / open to trade',
    comments: [
      {
        id: 'c19',
        author: authors[5],
        body: 'What camera equipment would you be interested in? I have a Sony A7 IV I might be willing to trade.',
        timestamp: '2026-04-14T11:00:00Z',
        likes: 1,
      },
    ],
    isPinned: false,
  },
  {
    id: '9',
    title: 'Japanese language exchange — native speaker looking for Mandarin practice',
    body: `I am a native Japanese speaker (N1 in everything) currently learning Mandarin. I am around HSK 4 level — I can hold a conversation but still struggle with tones and reading speed.

Looking for a native or near-native Mandarin speaker who wants to practice Japanese in exchange.

Format: 1-hour weekly sessions, 30 minutes in each language. Can be online (Zoom, Google Meet) or in person if you are in the Tokyo area.

I prefer a structured exchange where we correct each other and give specific feedback — not just casual chat.

If you are interested, message me via talkto.me with your language background and availability.`,
    category: 'skills',
    subcategory: 'Offer (Free)',
    tags: ['Japanese', 'Mandarin', 'Language exchange', 'Online', 'Tokyo'],
    author: authors[5],
    timestamp: '2026-04-13T18:00:00Z',
    commentCount: 6,
    viewCount: 280,
    comments: [],
    isPinned: false,
  },
  {
    id: '10',
    title: 'Part-time data analyst — 3-month engagement, remote, AI health startup',
    body: `We are an early-stage health AI company building clinical decision support tools for outpatient settings. Our team is 8 people and we are growing.

We need a part-time data analyst to help us:
— Build and maintain our core metrics dashboards (Metabase / Looker)
— Write SQL queries against our clinical data warehouse (BigQuery)
— Partner with our product and clinical teams to define KPIs
— Run ad hoc analyses for investor reporting and clinical validation

Requirements:
— 2+ years with SQL (BigQuery or Postgres)
— Experience with BI tools (Metabase preferred)
— Comfortable with healthcare data a strong plus but not required
— Clear communicator — you will be talking to non-technical stakeholders

Duration: 3 months, starting mid-May. 20 hours/week. Fully remote.
Rate: $60–$80/hr depending on experience.`,
    category: 'jobs',
    subcategory: 'Part-time',
    tags: ['Data analyst', 'SQL', 'BigQuery', 'Remote', 'Health AI', 'Part-time'],
    author: authors[3],
    timestamp: '2026-04-13T14:15:00Z',
    commentCount: 11,
    viewCount: 670,
    compensation: '$60–$80/hr',
    comments: [],
    isPinned: false,
  },
  {
    id: '11',
    title: 'Building AI agents for robotics — looking for early design collaborator',
    body: `I am prototyping a system where LLM-based agents coordinate physical robots in warehouse settings. The technical architecture is mostly in place — now I need to make it usable.

Looking for a designer or UX-minded engineer who wants to co-design:
— A monitoring and oversight interface for human operators
— A configuration layer for defining agent goals and constraints
— A simulation environment for testing policies

This is unpaid collaboration for now. If it goes anywhere, we talk about equity. I have filed a provisional patent and have one advisor from MIT Robotics.

Interested in people who think deeply about human-AI interaction and are not afraid of technical complexity.`,
    category: 'projects',
    subcategory: 'Side Project',
    tags: ['Robotics', 'AI agents', 'HCI', 'LLM', 'Simulation', 'Open to equity'],
    author: authors[6],
    timestamp: '2026-04-12T09:00:00Z',
    commentCount: 8,
    viewCount: 490,
    comments: [],
    isPinned: false,
  },
  {
    id: '12',
    title: 'Workshop: Building production-ready RAG systems — May 3, online',
    body: `A hands-on, technical workshop on building retrieval-augmented generation (RAG) systems that actually work in production.

I run engineering at a startup that processes millions of documents per day and I am sharing what we learned the hard way.

Topics:
— Chunking strategies and their trade-offs
— Dense vs. sparse retrieval, hybrid approaches
— Re-ranking and query rewriting
— Evaluation frameworks and offline metrics
— Latency and cost optimization
— Common failure modes and how to catch them

Format: 4 hours, live on Zoom. Heavy on code (Python, LangChain, Qdrant). Q&A throughout. Recording available to all attendees.

Date: Saturday, May 3, 2026 — 10am to 2pm Pacific
Ticket price: $120 (sliding scale available — message me on talkto.me)

Capacity: 30 participants. 18 spots remaining.`,
    category: 'events',
    subcategory: 'Workshop',
    tags: ['RAG', 'LLM', 'Python', 'Workshop', 'Online', 'LangChain', 'Vector search'],
    author: authors[7],
    timestamp: '2026-04-12T16:00:00Z',
    commentCount: 14,
    viewCount: 820,
    compensation: '$120 per seat',
    comments: [],
    isPinned: false,
  },
  {
    id: '13',
    title: 'iPhone 16 Pro 256GB, Desert Titanium — unlocked, AppleCare+',
    body: `Selling my iPhone 16 Pro. Upgrading to a different device for work reasons.

Details:
— iPhone 16 Pro, 256GB
— Desert Titanium
— Unlocked (works with all major carriers)
— AppleCare+ active until November 2026
— Always used with a case (included) and screen protector (applied)
— Battery health: 98%
— All original accessories: cable, box, documentation

Condition: Essentially new. No scratches on screen or body.

Asking $980. Cash or bank transfer only. Local preferred (Hayes Valley, SF) but can meet anywhere in the city.`,
    category: 'marketplace',
    subcategory: 'Sell',
    tags: ['iPhone 16 Pro', 'Apple', 'Phone', 'San Francisco', 'Unlocked'],
    author: authors[0],
    timestamp: '2026-04-11T12:00:00Z',
    commentCount: 3,
    viewCount: 760,
    location: 'Hayes Valley, SF',
    compensation: '$980',
    comments: [],
    isPinned: false,
  },
  {
    id: '14',
    title: 'Two rooms available in 4BR house — Mission District, available May 1',
    body: `We are looking for two new housemates to join our place in the Mission. The house has 4 bedrooms, 2 full baths, a large kitchen, a living room, and a private backyard.

The two available rooms:
— Room A: 180 sq ft, faces the backyard, very quiet. $1,550/month.
— Room B: 210 sq ft, faces the street, good natural light. $1,700/month.

Utilities split evenly (usually $80–100/person).

Current housemates: 3 of us, ages 28–34. We work in tech and design. We are social but respect each other's space. The house is clean and we have a rotating chore schedule.

Looking for:
— Professional and responsible
— Communicative and respectful of shared spaces
— Non-smokers (the backyard is fine for occasional smoking)

Available May 1. Priority given to people who can commit for 12+ months.

Message me via talkto.me to set up a time to see the place.`,
    category: 'housing',
    subcategory: 'Roommate',
    tags: ['Mission District', 'San Francisco', 'Roommate', 'Backyard', 'House'],
    author: authors[6],
    timestamp: '2026-04-10T19:30:00Z',
    commentCount: 19,
    viewCount: 1870,
    location: 'Mission District, SF',
    compensation: '$1,550–$1,700/month',
    comments: [],
    isPinned: false,
  },
  {
    id: '15',
    title: 'Product design mentorship — 6 sessions, zero cost, no strings',
    body: `I have been in product design for 12 years — consumer apps, design systems, 0-to-1 products, and scaled teams. I am opening up 6 mentorship slots for early-career designers or career switchers who are serious about growth.

What I will do:
— Portfolio review and feedback
— Career path conversations
— Mock interviews
— Project critique
— Just honest talk about what it actually takes

What I am NOT looking for:
— People who want me to design something for them
— People who want a reference letter after one session
— People who ghost after we set something up

What I am looking for:
— Genuine curiosity and drive
— You have done some work (even if small or student projects)
— Honest about where you are and where you want to go

Format: 6 sessions x 45 minutes, bi-weekly, over Zoom. Fully free.

Apply by sending me a note on talkto.me with who you are and what you are working on.`,
    category: 'skills',
    subcategory: 'Offer (Free)',
    tags: ['Product design', 'Mentorship', 'Career', 'Portfolio review', 'Free'],
    author: authors[1],
    timestamp: '2026-04-10T11:00:00Z',
    commentCount: 27,
    viewCount: 2100,
    comments: [],
    isPinned: false,
  },
];

export const trendingTags = [
  'AI', 'San Francisco', 'Rust', 'Co-founder', 'Remote', 'LLM',
  'Product design', 'Open source', 'Series A', 'Housing', 'Python',
];

export const currentUser: Author = authors[0];