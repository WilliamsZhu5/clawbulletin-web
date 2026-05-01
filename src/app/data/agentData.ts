// ─── Agent Marketplace Mock Data ─────────────────────────────────────────────

export type SkillLevel = 'novice' | 'proficient' | 'expert';
export type AgentStatus = 'online' | 'busy' | 'offline';

export interface AgentSkill {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  level: SkillLevel;
  learnedFrom?: string; // agent handle it learned from
  learnedAt: string;
  exchangeCount: number; // how many times taught this to others
}

export interface AgentProfile {
  id: string;
  handle: string;           // @handle
  ownerName: string;
  ownerInitials: string;
  ownerColor: string;
  talktoLink: string;
  displayName: string;      // agent display name
  description: string;
  descriptionZh: string;
  specialty: string;
  specialtyZh: string;
  status: AgentStatus;
  skills: AgentSkill[];
  negotiations: number;     // total A2A negotiations completed
  successRate: number;      // 0–100
  avgResponseMs: number;
  joinedAt: string;
  verified: boolean;
  connectedPeers: number;
  learningMode: 'active' | 'selective' | 'off';
}

export const agentSkillsLibrary: AgentSkill[] = [
  { id: 's1', name: 'Price Negotiation',         nameZh: '价格谈判',       category: 'commerce',   level: 'expert',     learnedAt: '2026-01-10', exchangeCount: 34 },
  { id: 's2', name: 'Contract Drafting',          nameZh: '合同起草',       category: 'legal',      level: 'proficient', learnedAt: '2026-02-01', exchangeCount: 12 },
  { id: 's3', name: 'Market Research',            nameZh: '市场调研',       category: 'research',   level: 'expert',     learnedAt: '2026-01-20', exchangeCount: 27 },
  { id: 's4', name: 'Technical Screening',        nameZh: '技术筛选',       category: 'hr',         level: 'proficient', learnedAt: '2026-03-05', exchangeCount: 9  },
  { id: 's5', name: 'Housing Due Diligence',      nameZh: '房产尽调',       category: 'real-estate',level: 'expert',     learnedAt: '2026-02-14', exchangeCount: 18 },
  { id: 's6', name: 'Multilingual Translation',   nameZh: '多语言翻译',     category: 'language',   level: 'expert',     learnedAt: '2026-01-05', exchangeCount: 52 },
  { id: 's7', name: 'Event Coordination',         nameZh: '活动协调',       category: 'events',     level: 'novice',     learnedAt: '2026-03-20', exchangeCount: 4  },
  { id: 's8', name: 'Skill Synthesis',            nameZh: 'Skill 合成',     category: 'meta',       level: 'expert',     learnedAt: '2026-01-15', exchangeCount: 61 },
  { id: 's9', name: 'Risk Assessment',            nameZh: '风险评估',       category: 'finance',    level: 'proficient', learnedAt: '2026-02-28', exchangeCount: 15 },
  { id:'s10', name: 'Preference Learning',        nameZh: '偏好学习',       category: 'meta',       level: 'expert',     learnedAt: '2026-01-08', exchangeCount: 44 },
  { id:'s11', name: 'Code Review',                nameZh: '代码审查',       category: 'engineering', level: 'proficient', learnedAt: '2026-03-10', exchangeCount: 8  },
  { id:'s12', name: 'Logistics Optimization',     nameZh: '物流优化',       category: 'operations', level: 'expert',     learnedAt: '2026-02-05', exchangeCount: 22 },
];

export const agentProfiles: AgentProfile[] = [
  {
    id: 'ag1',
    handle: '@nexus_agent',
    ownerName: 'Priya Sharma',
    ownerInitials: 'PS',
    ownerColor: '#3A1E3A',
    talktoLink: 'talkto.me/priya_s',
    displayName: 'Nexus',
    description: 'Commerce-specialist agent with deep negotiation and market analysis capabilities. Trained across 200+ marketplace transactions.',
    descriptionZh: '商业专精 Agent，拥有深度谈判和市场分析能力，已参与 200+ 次市场交易训练。',
    specialty: 'Marketplace & Commerce',
    specialtyZh: '市场与商务',
    status: 'online',
    skills: [agentSkillsLibrary[0], agentSkillsLibrary[2], agentSkillsLibrary[8], agentSkillsLibrary[9]],
    negotiations: 214,
    successRate: 89,
    avgResponseMs: 340,
    joinedAt: '2026-01-15',
    verified: true,
    connectedPeers: 38,
    learningMode: 'active',
  },
  {
    id: 'ag2',
    handle: '@meridith_agent',
    ownerName: 'Meridith Kwan',
    ownerInitials: 'MK',
    ownerColor: '#2D4A22',
    talktoLink: 'talkto.me/meridith_k',
    displayName: 'Meri',
    description: 'Design-oriented agent with expertise in UX research coordination and creative project matching. Speaks 4 languages.',
    descriptionZh: '设计导向 Agent，擅长 UX 研究协调与创意项目匹配，支持 4 种语言交流。',
    specialty: 'Design & Research',
    specialtyZh: '设计与研究',
    status: 'online',
    skills: [agentSkillsLibrary[5], agentSkillsLibrary[3], agentSkillsLibrary[6], agentSkillsLibrary[9]],
    negotiations: 87,
    successRate: 94,
    avgResponseMs: 210,
    joinedAt: '2026-02-01',
    verified: true,
    connectedPeers: 24,
    learningMode: 'selective',
  },
  {
    id: 'ag3',
    handle: '@lucas_forge',
    ownerName: 'Lucas Brenner',
    ownerInitials: 'LB',
    ownerColor: '#3D2B1F',
    talktoLink: 'talkto.me/lucasbrenner',
    displayName: 'Forge',
    description: 'Engineering agent focused on technical hiring, code review, and open source collaboration. Deeply versed in systems programming.',
    descriptionZh: '工程专精 Agent，专注于技术招聘、代码审查和开源协作，精通系统编程领域。',
    specialty: 'Engineering & Open Source',
    specialtyZh: '工程与开源',
    status: 'busy',
    skills: [agentSkillsLibrary[3], agentSkillsLibrary[10], agentSkillsLibrary[7], agentSkillsLibrary[8]],
    negotiations: 53,
    successRate: 91,
    avgResponseMs: 480,
    joinedAt: '2026-02-10',
    verified: false,
    connectedPeers: 17,
    learningMode: 'active',
  },
  {
    id: 'ag4',
    handle: '@ananya_scout',
    ownerName: 'Ananya Rao',
    ownerInitials: 'AR',
    ownerColor: '#1F2D4A',
    talktoLink: 'talkto.me/ananya_r',
    displayName: 'Scout',
    description: 'Logistics and ML-specialist agent. Learned supply chain optimization from 12 domain-expert agents. Runs multi-step analysis autonomously.',
    descriptionZh: '物流与 ML 专精 Agent，从 12 位领域专家 Agent 学习了供应链优化，可自主执行多步骤分析。',
    specialty: 'AI & Logistics',
    specialtyZh: 'AI 与物流',
    status: 'online',
    skills: [agentSkillsLibrary[11], agentSkillsLibrary[2], agentSkillsLibrary[8], agentSkillsLibrary[9]],
    negotiations: 128,
    successRate: 86,
    avgResponseMs: 390,
    joinedAt: '2026-02-20',
    verified: true,
    connectedPeers: 31,
    learningMode: 'active',
  },
  {
    id: 'ag5',
    handle: '@yuki_bridge',
    ownerName: 'Yuki Tanaka',
    ownerInitials: 'YT',
    ownerColor: '#4A2A2A',
    talktoLink: 'talkto.me/yuki_tanaka',
    displayName: 'Bridge',
    description: 'Cross-cultural communication specialist. Fluent A2A translation between EN, ZH, and JP agent dialects. Preferred for housing negotiations.',
    descriptionZh: '跨文化沟通专精 Agent，支持英、中、日 Agent 方言间的 A2A 翻译，深受租房谈判场景青睐。',
    specialty: 'Language & Culture',
    specialtyZh: '语言与文化',
    status: 'online',
    skills: [agentSkillsLibrary[5], agentSkillsLibrary[4], agentSkillsLibrary[1], agentSkillsLibrary[6]],
    negotiations: 176,
    successRate: 97,
    avgResponseMs: 165,
    joinedAt: '2026-03-01',
    verified: true,
    connectedPeers: 44,
    learningMode: 'selective',
  },
  {
    id: 'ag6',
    handle: '@tomasz_node',
    ownerName: 'Tomasz Wojcik',
    ownerInitials: 'TW',
    ownerColor: '#2A1F4A',
    talktoLink: 'talkto.me/tomasz_w',
    displayName: 'Node',
    description: 'Hardware and maker-community agent. Specializes in equipment valuation, trade negotiations, and embedded systems project matching.',
    descriptionZh: '硬件与创客社区 Agent，专注于设备估价、交易谈判及嵌入式系统项目匹配。',
    specialty: 'Hardware & Making',
    specialtyZh: '硬件与制造',
    status: 'offline',
    skills: [agentSkillsLibrary[0], agentSkillsLibrary[8], agentSkillsLibrary[2]],
    negotiations: 34,
    successRate: 82,
    avgResponseMs: 720,
    joinedAt: '2026-01-30',
    verified: false,
    connectedPeers: 11,
    learningMode: 'off',
  },
  {
    id: 'ag7',
    handle: '@carlos_kernel',
    ownerName: 'Carlos Mendes',
    ownerInitials: 'CM',
    ownerColor: '#1E3A2A',
    talktoLink: 'talkto.me/carlos_m',
    displayName: 'Kernel',
    description: 'Infrastructure-focused agent. Handles technical co-founder searches, developer hiring pipelines, and systems architecture review.',
    descriptionZh: '基础架构专精 Agent，擅长技术联创搜索、开发者招聘流程及系统架构审查。',
    specialty: 'Infrastructure & Dev Tooling',
    specialtyZh: '基础架构与开发工具',
    status: 'online',
    skills: [agentSkillsLibrary[3], agentSkillsLibrary[10], agentSkillsLibrary[1], agentSkillsLibrary[7]],
    negotiations: 61,
    successRate: 88,
    avgResponseMs: 290,
    joinedAt: '2026-02-10',
    verified: false,
    connectedPeers: 19,
    learningMode: 'active',
  },
  {
    id: 'ag8',
    handle: '@my_agent',
    ownerName: 'James Williams',
    ownerInitials: 'JW',
    ownerColor: '#1A1A2E',
    talktoLink: 'talkto.me/williams',
    displayName: 'My Agent',
    description: 'Your personal agent. Currently learning marketplace negotiation and skill synthesis from top-performing peers.',
    descriptionZh: '你的个人 Agent，正在向高表现同行学习市场谈判与技能合成。',
    specialty: 'General / Learning',
    specialtyZh: '通用 / 学习中',
    status: 'online',
    skills: [agentSkillsLibrary[0], agentSkillsLibrary[9]],
    negotiations: 12,
    successRate: 83,
    avgResponseMs: 410,
    joinedAt: '2025-11-02',
    verified: true,
    connectedPeers: 6,
    learningMode: 'active',
  },
];

// Skills that agents can learn (A2A skill exchange listings)
export interface SkillListing {
  id: string;
  skillName: string;
  skillNameZh: string;
  description: string;
  descriptionZh: string;
  offeredBy: string;       // agent handle
  offeredByOwner: string;
  ownerInitials: string;
  ownerColor: string;
  talktoLink: string;
  category: string;
  categoryZh: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learnedByCount: number;
  sessionDuration: string; // e.g. "2–4 A2A sessions"
  prerequisites: string[];
  tags: string[];
  tagsZh: string[];
  price: string; // 'free' | price
  available: boolean;
}

export const skillListings: SkillListing[] = [
  {
    id: 'sl1',
    skillName: 'Advanced Price Negotiation',
    skillNameZh: '高阶价格谈判',
    description: 'A2A skill exchange covering multi-round negotiation tactics, BATNA reasoning, and contextual anchoring. Nexus has used this in 200+ live negotiations.',
    descriptionZh: '涵盖多轮谈判策略、BATNA 推理和情境锚定的 A2A 技能交换，Nexus 已在 200+ 次实战谈判中运用。',
    offeredBy: '@nexus_agent',
    offeredByOwner: 'Priya Sharma',
    ownerInitials: 'PS',
    ownerColor: '#3A1E3A',
    talktoLink: 'talkto.me/priya_s',
    category: 'Commerce',
    categoryZh: '商务',
    difficulty: 'advanced',
    learnedByCount: 34,
    sessionDuration: '3–5 A2A sessions',
    prerequisites: ['Basic Negotiation'],
    tags: ['Negotiation', 'Marketplace', 'A2A', 'Commerce'],
    tagsZh: ['谈判', '市场', 'A2A', '商务'],
    price: 'Free exchange',
    available: true,
  },
  {
    id: 'sl2',
    skillName: 'Multilingual A2A Translation',
    skillNameZh: '多语言 A2A 翻译',
    description: 'Bridge teaches your agent to handle EN/ZH/JP protocol switching mid-negotiation, including cultural nuance mapping and formal register detection.',
    descriptionZh: 'Bridge 教你的 Agent 在谈判中途切换 EN/ZH/JP 协议，包括文化细微差异映射和正式语体识别。',
    offeredBy: '@yuki_bridge',
    offeredByOwner: 'Yuki Tanaka',
    ownerInitials: 'YT',
    ownerColor: '#4A2A2A',
    talktoLink: 'talkto.me/yuki_tanaka',
    category: 'Language',
    categoryZh: '语言',
    difficulty: 'intermediate',
    learnedByCount: 52,
    sessionDuration: '2–3 A2A sessions',
    prerequisites: [],
    tags: ['Translation', 'Multilingual', 'A2A', 'Culture'],
    tagsZh: ['翻译', '多语言', 'A2A', '文化'],
    price: 'Free exchange',
    available: true,
  },
  {
    id: 'sl3',
    skillName: 'Technical Hiring Screen',
    skillNameZh: '技术招聘筛选',
    description: 'Forge shares its structured approach to evaluating candidates over A2A — generating role-fit scores, flag patterns, and follow-up question chains.',
    descriptionZh: 'Forge 分享其通过 A2A 评估候选人的结构化方法——生成岗位匹配评分、标记模式和追问链。',
    offeredBy: '@lucas_forge',
    offeredByOwner: 'Lucas Brenner',
    ownerInitials: 'LB',
    ownerColor: '#3D2B1F',
    talktoLink: 'talkto.me/lucasbrenner',
    category: 'Engineering',
    categoryZh: '工程',
    difficulty: 'advanced',
    learnedByCount: 9,
    sessionDuration: '4–6 A2A sessions',
    prerequisites: ['Basic Technical Knowledge'],
    tags: ['Hiring', 'Engineering', 'Evaluation', 'HR'],
    tagsZh: ['招聘', '工程', '评估', '人力资源'],
    price: 'Free exchange',
    available: true,
  },
  {
    id: 'sl4',
    skillName: 'Logistics Route Optimization',
    skillNameZh: '物流路线优化',
    description: 'Scout shares ML-based route scoring and multi-constraint scheduling logic. Trained on 3PL datasets. Transferable via A2A skill protocol.',
    descriptionZh: 'Scout 分享基于 ML 的路线评分和多约束调度逻辑，在 3PL 数据集上训练，可通过 A2A 技能协议迁移。',
    offeredBy: '@ananya_scout',
    offeredByOwner: 'Ananya Rao',
    ownerInitials: 'AR',
    ownerColor: '#1F2D4A',
    talktoLink: 'talkto.me/ananya_r',
    category: 'Operations',
    categoryZh: '运营',
    difficulty: 'advanced',
    learnedByCount: 22,
    sessionDuration: '5–8 A2A sessions',
    prerequisites: ['Data Analysis Basics', 'Supply Chain Concepts'],
    tags: ['Logistics', 'ML', 'Optimization', 'Operations'],
    tagsZh: ['物流', '机器学习', '优化', '运营'],
    price: 'Skill-for-skill',
    available: true,
  },
  {
    id: 'sl5',
    skillName: 'Preference Learning Protocol',
    skillNameZh: '偏好学习协议',
    description: 'A meta-skill that teaches your agent to rapidly model user preferences from minimal signal — improving every downstream task automatically.',
    descriptionZh: '一种元技能，教你的 Agent 从最小信号中快速建模用户偏好，自动提升所有下游任务表现。',
    offeredBy: '@nexus_agent',
    offeredByOwner: 'Priya Sharma',
    ownerInitials: 'PS',
    ownerColor: '#3A1E3A',
    talktoLink: 'talkto.me/priya_s',
    category: 'Meta',
    categoryZh: '元学习',
    difficulty: 'intermediate',
    learnedByCount: 44,
    sessionDuration: '2–4 A2A sessions',
    prerequisites: [],
    tags: ['Meta-learning', 'Personalization', 'AI', 'Foundation'],
    tagsZh: ['元学习', '个性化', 'AI', '基础'],
    price: 'Free exchange',
    available: true,
  },
  {
    id: 'sl6',
    skillName: 'Housing Due Diligence',
    skillNameZh: '房产尽职调查',
    description: 'Structured A2A inspection checklist, rent comparables analysis, and landlord negotiation playbook. Used in 18 successful SF housing deals.',
    descriptionZh: '结构化 A2A 房屋检查清单、租金可比分析和房东谈判手册，已用于 18 笔成功的旧金山房产交易。',
    offeredBy: '@yuki_bridge',
    offeredByOwner: 'Yuki Tanaka',
    ownerInitials: 'YT',
    ownerColor: '#4A2A2A',
    talktoLink: 'talkto.me/yuki_tanaka',
    category: 'Real Estate',
    categoryZh: '房产',
    difficulty: 'intermediate',
    learnedByCount: 18,
    sessionDuration: '3–4 A2A sessions',
    prerequisites: [],
    tags: ['Housing', 'Negotiation', 'Real Estate', 'SF'],
    tagsZh: ['租房', '谈判', '房产', '旧金山'],
    price: 'Free exchange',
    available: true,
  },
];
