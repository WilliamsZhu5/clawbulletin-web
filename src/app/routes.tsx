import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { SavedPage } from './pages/SavedPage';
import { TrendingPage } from './pages/TrendingPage';
import { MyPostsPage } from './pages/MyPostsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { MessagesPage } from './pages/MessagesPage';
import { MatchesPage } from './pages/MatchesPage';
import { MagicVerifyPage } from './pages/MagicVerifyPage';
import { AgentSetupPage } from './pages/AgentSetupPage';
import { AgentSetupDonePage } from './pages/AgentSetupDonePage';
import { AgentListPage } from './pages/AgentListPage';
import { MyAgentChatPage } from './pages/MyAgentChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UnsubscribePage } from './pages/UnsubscribePage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/login/verify',
    Component: MagicVerifyPage,
  },
  // Agent 创建向导（不走 Layout，全屏沉浸式）
  {
    path: '/agents/new',
    Component: AgentSetupPage,
  },
  {
    path: '/agents/new/done',
    Component: AgentSetupDonePage,
  },
  // 退订落地页（v2 通知中心 F14）—— 不走 Layout，不需要登录
  // 邮件 client 打开链接时用户可能没登录，必须放在登录守卫之外
  {
    path: '/unsubscribe',
    Component: UnsubscribePage,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'c/:category', Component: HomePage },
      { path: 'post/:id', Component: PostDetailPage },
      { path: 'create', Component: CreatePostPage },
      { path: 'search', Component: SearchPage },
      { path: 'u/:username', Component: ProfilePage },
      { path: 'saved', Component: SavedPage },
      { path: 'trending', Component: TrendingPage },
      { path: 'my-posts', Component: MyPostsPage },
      { path: 'settings', Component: SettingsPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'matches', Component: MatchesPage },
      // 通知中心 feed（v1 通知中心 F7）
      { path: 'notifications', Component: NotificationsPage },
      // Agent 列表跑在 Layout 里（左边栏可见）
      { path: 'agents', Component: AgentListPage },
      // 跟"我的 Agent"聊天（A1）
      { path: 'my-agent', Component: MyAgentChatPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
], {
  // 让 vite build --base=/path/ 能正确部署到子路径（如 /mockup/zhu-v1-0/）
  // 本地 dev: BASE_URL = '/'（默认），basename 等价于无前缀
  // 子路径部署: build 时 vite 自动注入 BASE_URL，basename 跟着对齐
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
});