import { Outlet, useLocation } from 'react-router';
import { useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { AgentPostModal } from '../AgentPostModal';
import { AgentDialog } from '../AgentDialog';

const FULL_BLEED_ROUTES = ['/messages'];

// 显示 RightPanel 的路由：主页（含分类） + trending；其余页面保持单列居中
const RIGHT_PANEL_ROUTES_PREFIX = ['/c/'];
const RIGHT_PANEL_ROUTES_EXACT = ['/', '/trending'];

export function Layout() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const location = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);
  // 是否显示右侧浅蓝面板（仅主页类路由）
  const 显示右侧 = RIGHT_PANEL_ROUTES_EXACT.includes(location.pathname)
    || RIGHT_PANEL_ROUTES_PREFIX.some((p) => location.pathname.startsWith(p));

  return (
    // figma 风极淡冷白底，主区是白卡感；左 sidebar / 右 panel 浅冷白
    <div className="min-h-screen" style={{ background: '#FAFAFB' }}>
      <TopBar onOpenPost={() => setShowPostModal(true)} onOpenAgent={() => setShowAgent(true)} />
      <Sidebar />
      <main style={{ paddingTop: '56px', paddingLeft: '220px' }}>
        {isFullBleed ? (
          <Outlet />
        ) : 显示右侧 ? (
          // 主页类布局：中间内容 + 右侧 panel（xl 断点以上才显示右栏）
          <div className="flex justify-center gap-6 px-6 py-6 max-w-[1240px] mx-auto">
            <div className="flex-1 min-w-0 max-w-[780px]">
              <Outlet />
            </div>
            <RightPanel />
          </div>
        ) : (
          <div className="max-w-[780px] mx-auto px-6 py-6">
            <Outlet />
          </div>
        )}
      </main>
      {showPostModal && <AgentPostModal onClose={() => setShowPostModal(false)} />}
      {showAgent && <AgentDialog onClose={() => setShowAgent(false)} />}
    </div>
  );
}