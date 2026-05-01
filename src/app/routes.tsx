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

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/login/verify',
    Component: MagicVerifyPage,
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
      { path: '*', Component: NotFoundPage },
    ],
  },
]);