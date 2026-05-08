// 跟"我的 Agent"聊天 — 已并入 /messages 作为虚拟会话（微信"文件传输助手"式）
// 旧路由 /my-agent 保留但 redirect 到 /messages?conversation=__my_agent__，
// 兼容既有书签 / 通知 / 邮件链接，不破坏外部入口。
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function MyAgentChatPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/messages?conversation=__my_agent__', { replace: true });
  }, [navigate]);
  return null;
}

export default MyAgentChatPage;
