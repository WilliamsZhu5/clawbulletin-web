import { Outlet, useLocation } from 'react-router';
import { useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { AgentPostModal } from '../AgentPostModal';
import { AgentDialog } from '../AgentDialog';

const FULL_BLEED_ROUTES = ['/messages'];

export function Layout() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const location = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen" style={{ background: '#EDEBE5' }}>
      <TopBar onOpenPost={() => setShowPostModal(true)} onOpenAgent={() => setShowAgent(true)} />
      <Sidebar />
      <main style={{ paddingTop: '56px', paddingLeft: '220px' }}>
        {isFullBleed ? (
          <Outlet />
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