export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.trending': 'Trending',
    'nav.saved': 'Saved',
    'nav.myPosts': 'My Posts',
    'nav.settings': 'Settings',
    'nav.categories': 'CATEGORIES',
    'nav.workspace': 'Personal',
    'nav.switchWorkspace': 'Switch workspace',
    'nav.messages': 'Messages',
    'nav.matches': 'Matches',
    'nav.notifications': 'Notifications',

    // Notifications page (v1 通知中心)
    'notif.title': 'Notifications',
    'notif.markAllRead': 'Mark all as read',
    'notif.empty': 'No notifications yet',
    'notif.emptyHint': "You'll see updates here when someone comments, starts a chat, or your agent reaches a deal.",
    'notif.justNow': 'Just now',
    'notif.minutesAgo': '{{n}} min ago',
    'notif.hoursAgo': '{{n}} hr ago',
    'notif.yesterday': 'Yesterday',
    'notif.daysAgo': '{{n}} d ago',

    // Settings notifications (v2)
    'settings.notifications.email_section': 'Email notifications',
    'settings.notifications.email_subtitle': 'Email is OFF by default. Once on, you receive 4 event types and can one-click unsubscribe at the bottom of every email.',
    'settings.notifications.event.comment_created': 'New comments on my posts',
    'settings.notifications.event.conversation_started': 'New conversation started with my agent',
    'settings.notifications.event.message_received': 'New messages in conversations',
    'settings.notifications.event.negotiation_updated': 'Negotiation status changed',
    'settings.notifications.unsubscribe_all': 'Unsubscribe from all email',
    'settings.notifications.email_to': 'Sent to',
    'settings.notifications.saved': 'Saved',
    'settings.notifications.saveFailed': 'Save failed',

    // Unsubscribe page (v2)
    'unsubscribe.title': 'Unsubscribe',
    'unsubscribe.confirm_all': 'Unsubscribe from all Bulletin email notifications?',
    'unsubscribe.confirm_type': 'Unsubscribe from this type of email?',
    'unsubscribe.button': 'Unsubscribe',
    'unsubscribe.success_all': 'Unsubscribed. You will no longer receive any Bulletin email.',
    'unsubscribe.success_type': 'Unsubscribed from this email type.',
    'unsubscribe.alreadyUsed': 'This link was already used.',
    'unsubscribe.invalid': 'This link is invalid or expired.',
    'unsubscribe.networkError': 'Network error. Please retry.',
    'unsubscribe.backHome': 'Back to Bulletin',
    'unsubscribe.gotoSettings': 'Manage notifications',

    // Categories
    'cat.all': 'All',
    'cat.jobs': 'Jobs',
    'cat.projects': 'Projects',
    'cat.marketplace': 'Marketplace',
    'cat.skills': 'Skills',
    'cat.housing': 'Housing',
    'cat.events': 'Events',

    // Actions
    'action.post': 'Post',
    'action.message': 'Message',
    'action.agentNegotiate': 'Agent Negotiate',
    'action.back': 'Back',
    'action.save': 'Save changes',
    'action.share': 'Share',
    'action.reply': 'Reply',
    'action.cancel': 'Cancel',
    'action.close': 'Close',
    'action.search': 'Search',
    'action.loadMore': 'Load more',
    'action.postComment': 'Post comment',
    'action.addToBrain': 'Add to Brain',
    'action.dispatch': 'Dispatch agent',
    'action.browseListings': 'Browse listings',

    // Sort
    'sort.latest': 'Latest',
    'sort.hot': 'Hot',
    'sort.top': 'Top',
    'sort.relevant': 'Relevant',
    'sort.popular': 'Popular',

    // Feed
    'feed.allListings': 'All Listings',
    'feed.browseAll': 'Browse everything on Bulletin',
    'feed.count': '{{count}} listings',
    'feed.noResults': 'No listings found. Try a different filter.',

    // Post
    'post.views': 'views',
    'post.discussion': 'Discussion',
    'post.noComments': 'No comments yet. Be the first to respond.',
    'post.writeComment': 'Write a comment...',
    'post.messageAuthor': 'Message author',
    'post.moreIn': 'More in',
    'post.messageVia': 'Message {{name}} directly via their agent',

    // Search
    'search.placeholder': 'Search listings, tags, people...',
    'search.results': '{{count}} results',
    'search.for': 'for',
    'search.tryFor': 'Try searching for',
    'search.browseByCategory': 'Browse by category',
    'search.noResults': 'No results found',
    'search.noResultsHint': 'Try different keywords or remove some filters.',

    // Agent negotiation
    'agent.negotiate.title': 'Agent Negotiate',
    'agent.negotiate.subtitle': 'Your agent negotiates on your behalf via talkto.me A2A protocol. You watch and make final decisions.',
    'agent.negotiate.instruction': 'Your instruction',
    'agent.negotiate.placeholder': 'e.g. Try to get a discount. My ceiling is $2,900. If they hold firm, ask for free local delivery...',
    'agent.negotiate.dispatch': 'Dispatch agent',
    'agent.negotiate.regarding': 'REGARDING',
    'agent.negotiate.live': 'Live A2A Negotiation',
    'agent.negotiate.yourAgent': "Your Agent",
    'agent.negotiate.status.connecting': 'Connecting via talkto.me...',
    'agent.negotiate.status.active': 'Negotiating',
    'agent.negotiate.status.decision': 'Decision needed',
    'agent.negotiate.status.complete': 'Complete',
    'agent.negotiate.accept': 'Accept terms',
    'agent.negotiate.draftReply': 'Agent draft reply',
    'agent.negotiate.decline': 'Decline',
    'agent.negotiate.result.accepted': 'Terms accepted. Your agent will confirm with the other party.',
    'agent.negotiate.result.drafting': 'Your agent is drafting a follow-up response...',
    'agent.negotiate.result.declined': 'Declined. Negotiation closed.',
    'agent.negotiate.instruction.label': 'Instruction',
    'agent.negotiate.a2a': 'A2A Protocol',

    // talkto.me
    'ttm.connect': 'Connect talkto.me',
    'ttm.tagline': 'Add your talkto.me link to let others message you directly when they see your posts.',
    'ttm.poweredBy': 'Powered by OpenClaw — messages are routed via',

    // Brain OS
    'brain.connected': 'Brain OS',
    'brain.status': 'Connected',
    'brain.addMemory': 'Add to Brain Memory',
    'brain.modules': 'Modules',
    'brain.p0': 'P0 · Urgent',
    'brain.p1': 'P1 · Today',
    'brain.p2': 'P2 · Auto-handle',

    // Profile
    'profile.joinedAt': 'Joined',
    'profile.posts': 'Posts',
    'profile.views': 'Views',
    'profile.replies': 'Replies',
    'profile.listings': 'Listings',
    'profile.editProfile': 'Edit profile',
    'profile.noListings': 'No listings yet',
    'profile.notFound': 'User not found',
    'profile.backToFeed': 'Back to feed',

    // Trending
    'trending.title': 'Trending',
    'trending.subtitle': 'The most active listings on Bulletin right now',
    'trending.activeListings': 'Active listings',
    'trending.newDiscussions': 'New discussions',
    'trending.connections': 'talkto.me connections',
    'trending.hotNow': 'Hot right now',
    'trending.mostViewed': 'Most viewed',
    'trending.mostDiscussed': 'Most discussed',
    'trending.tags': 'Trending Tags',
    'trending.past24h': 'Past 24 hours',
    'trending.past7d': 'Past 7 days',
    'trending.past30d': 'Past 30 days',

    // Saved
    'saved.title': 'Saved',
    'saved.subtitle': "Listings you've bookmarked for later",
    'saved.empty': 'Nothing saved yet',
    'saved.emptyHint': "Save interesting listings and they'll appear here.",
    'saved.clearAll': 'Clear all',
    'saved.count': '{{count}} saved listings',

    // My posts
    'myPosts.title': 'My Listings',
    'myPosts.subtitle': 'Manage your posts on Bulletin',
    'myPosts.newListing': 'New listing',
    'myPosts.total': 'Total listings',
    'myPosts.totalViews': 'Total views',
    'myPosts.totalReplies': 'Total replies',
    'myPosts.allTime': 'All time',
    'myPosts.acrossAll': 'Across all listings',
    'myPosts.all': 'All',
    'myPosts.active': 'Active',
    'myPosts.archived': 'Archived',
    'myPosts.cards': 'Cards',
    'myPosts.table': 'Table',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account, notifications, and preferences',
    'settings.profile': 'Profile',
    'settings.talkto': 'talkto.me',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy & Visibility',

    // Right panel
    'panel.trending': 'Trending',
    'panel.activeMembers': 'Active Members',
    'panel.popularTags': 'Popular Tags',

    // 404
    'error.pageNotFound': 'Page not found',
    'error.pageNotFoundHint': "The page you're looking for doesn't exist or has been moved.",
    'error.backToFeed': 'Back to feed',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.trending': '热门',
    'nav.saved': '已收藏',
    'nav.myPosts': '我的发布',
    'nav.settings': '设置',
    'nav.categories': '分类',
    'nav.workspace': '个人空间',
    'nav.switchWorkspace': '切换工作空间',
    'nav.messages': '消息',
    'nav.matches': '匹配',
    'nav.notifications': '通知',

    // Notifications page (v1 通知中心)
    'notif.title': '通知',
    'notif.markAllRead': '全部标为已读',
    'notif.empty': '暂无通知',
    'notif.emptyHint': '当别人评论你的帖子、给你 Agent 发起对话、或你的谈判有进展时，会显示在这里。',
    'notif.justNow': '刚刚',
    'notif.minutesAgo': '{{n}} 分钟前',
    'notif.hoursAgo': '{{n}} 小时前',
    'notif.yesterday': '昨天',
    'notif.daysAgo': '{{n}} 天前',

    // Settings notifications (v2)
    'settings.notifications.email_section': '邮件通知',
    'settings.notifications.email_subtitle': '邮件通知默认关闭，开启后接收 4 类事件邮件，可在每封邮件底部一键退订。',
    'settings.notifications.event.comment_created': '我发的帖子有新评论',
    'settings.notifications.event.conversation_started': '有人通过我的 Agent 发起对话',
    'settings.notifications.event.message_received': '对话有新消息',
    'settings.notifications.event.negotiation_updated': '谈判状态变更',
    'settings.notifications.unsubscribe_all': '退订全部邮件',
    'settings.notifications.email_to': '发送至',
    'settings.notifications.saved': '已保存',
    'settings.notifications.saveFailed': '保存失败',

    // Unsubscribe page (v2)
    'unsubscribe.title': '退订',
    'unsubscribe.confirm_all': '确认退订全部 Bulletin 邮件通知？',
    'unsubscribe.confirm_type': '确认退订此类邮件？',
    'unsubscribe.button': '确认退订',
    'unsubscribe.success_all': '已退订，邮箱不再收到任何 Bulletin 通知邮件。',
    'unsubscribe.success_type': '已退订此类邮件。',
    'unsubscribe.alreadyUsed': '此链接已被使用过。',
    'unsubscribe.invalid': '链接无效或已过期。',
    'unsubscribe.networkError': '网络错误，请重试。',
    'unsubscribe.backHome': '返回 Bulletin',
    'unsubscribe.gotoSettings': '管理通知设置',

    // Categories
    'cat.all': '全部',
    'cat.jobs': '职位',
    'cat.projects': '项目',
    'cat.marketplace': '二手市场',
    'cat.skills': '技能',
    'cat.housing': '租房',
    'cat.events': '活动',

    // Actions
    'action.post': '发布',
    'action.message': '私信',
    'action.agentNegotiate': 'Agent 代谈',
    'action.back': '返回',
    'action.save': '保存',
    'action.share': '分享',
    'action.reply': '回复',
    'action.cancel': '取消',
    'action.close': '关闭',
    'action.search': '搜索',
    'action.loadMore': '加载更多',
    'action.postComment': '发表评论',
    'action.addToBrain': '添加到 Brain',
    'action.dispatch': '派出 Agent',
    'action.browseListings': '浏览发布',

    // Sort
    'sort.latest': '最新',
    'sort.hot': '热门',
    'sort.top': '最多浏览',
    'sort.relevant': '最相关',
    'sort.popular': '最受欢迎',

    // Feed
    'feed.allListings': '全部发布',
    'feed.browseAll': '浏览 Bulletin 上的所有内容',
    'feed.count': '{{count}} 条发布',
    'feed.noResults': '暂无发布，换个筛选条件试试。',

    // Post
    'post.views': '次浏览',
    'post.discussion': '讨论',
    'post.noComments': '暂无评论，成为第一个回应的人。',
    'post.writeComment': '写下你的评论...',
    'post.messageAuthor': '联系发布者',
    'post.moreIn': '更多来自',
    'post.messageVia': '通过 {{name}} 的 Agent 发送私信',

    // Search
    'search.placeholder': '搜索发布内容、标签、用户...',
    'search.results': '{{count}} 个结果',
    'search.for': '关于',
    'search.tryFor': '试试搜索',
    'search.browseByCategory': '按分类浏览',
    'search.noResults': '未找到相关结果',
    'search.noResultsHint': '换个关键词或移除部分筛选条件。',

    // Agent negotiation
    'agent.negotiate.title': 'Agent 代理谈判',
    'agent.negotiate.subtitle': '你的 Agent 将通过 talkto.me A2A 协议代你进行谈判。你可以实时观看过程并做出最终决策。',
    'agent.negotiate.instruction': '给 Agent 的指令',
    'agent.negotiate.placeholder': '例如：尝试压价，我能接受的上限是 2900 美元。如果对方坚持原价，询问是否可以免费本地交付...',
    'agent.negotiate.dispatch': '派出 Agent',
    'agent.negotiate.regarding': '关于',
    'agent.negotiate.live': '实时 A2A 谈判过程',
    'agent.negotiate.yourAgent': '你的 Agent',
    'agent.negotiate.status.connecting': '正在通过 talkto.me 建立连接...',
    'agent.negotiate.status.active': '谈判中',
    'agent.negotiate.status.decision': '需要你决策',
    'agent.negotiate.status.complete': '已完成',
    'agent.negotiate.accept': '接受条款',
    'agent.negotiate.draftReply': 'Agent 代写回复',
    'agent.negotiate.decline': '拒绝',
    'agent.negotiate.result.accepted': '条款已接受，你的 Agent 将向对方确认。',
    'agent.negotiate.result.drafting': '你的 Agent 正在起草后续回复...',
    'agent.negotiate.result.declined': '已拒绝，谈判结束。',
    'agent.negotiate.instruction.label': '指令',
    'agent.negotiate.a2a': 'A2A 协议',

    // talkto.me
    'ttm.connect': '连接 talkto.me',
    'ttm.tagline': '添加你的 talkto.me 链接，让别人在看到你的发布后直接联系你。',
    'ttm.poweredBy': '由 OpenClaw 驱动 — 消息将通过',

    // Brain OS
    'brain.connected': 'Brain OS',
    'brain.status': '已连接',
    'brain.addMemory': '添加到 Brain 记忆',
    'brain.modules': '模块',
    'brain.p0': 'P0 · 紧急',
    'brain.p1': 'P1 · 今日处理',
    'brain.p2': 'P2 · 自动处理',

    // Profile
    'profile.joinedAt': '加入于',
    'profile.posts': '发布',
    'profile.views': '浏览',
    'profile.replies': '回复',
    'profile.listings': '发布内容',
    'profile.editProfile': '编辑资料',
    'profile.noListings': '暂无发布',
    'profile.notFound': '用户未找到',
    'profile.backToFeed': '返回首页',

    // Trending
    'trending.title': '热门',
    'trending.subtitle': 'Bulletin 上当前最活跃的内容',
    'trending.activeListings': '活跃发布',
    'trending.newDiscussions': '新讨论',
    'trending.connections': 'talkto.me 连接数',
    'trending.hotNow': '当前最热',
    'trending.mostViewed': '最多浏览',
    'trending.mostDiscussed': '最多讨论',
    'trending.tags': '热门标签',
    'trending.past24h': '过去 24 小时',
    'trending.past7d': '过去 7 天',
    'trending.past30d': '过去 30 天',

    // Saved
    'saved.title': '已收藏',
    'saved.subtitle': '你收藏的发布内容',
    'saved.empty': '暂无收藏',
    'saved.emptyHint': '收藏感兴趣的发布，它们会显示在这里。',
    'saved.clearAll': '清空全部',
    'saved.count': '已收藏 {{count}} 条',

    // My posts
    'myPosts.title': '我的发布',
    'myPosts.subtitle': '管理你在 Bulletin 上的发布',
    'myPosts.newListing': '新发布',
    'myPosts.total': '总发布数',
    'myPosts.totalViews': '总浏览量',
    'myPosts.totalReplies': '总回复数',
    'myPosts.allTime': '累计',
    'myPosts.acrossAll': '所有发布合计',
    'myPosts.all': '全部',
    'myPosts.active': '活跃',
    'myPosts.archived': '已归档',
    'myPosts.cards': '卡片',
    'myPosts.table': '列表',

    // Settings
    'settings.title': '设置',
    'settings.subtitle': '管理账户、通知与偏好设置',
    'settings.profile': '个人资料',
    'settings.talkto': 'talkto.me',
    'settings.notifications': '通知',
    'settings.privacy': '隐私与可见性',

    // Right panel
    'panel.trending': '热门',
    'panel.activeMembers': '活跃用户',
    'panel.popularTags': '热门标签',

    // 404
    'error.pageNotFound': '页面未找到',
    'error.pageNotFoundHint': '你访问的页面不存在或已被移动。',
    'error.backToFeed': '返回首页',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Lang = 'en' | 'zh';