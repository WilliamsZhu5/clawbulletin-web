import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { 验证magic_link, 列我的agents, 是否合法redirect } from '../data/api';

// 判断"用户是否已经主动创建过 agent"：
// 后端会在注册时自动创建一个 type='native' 且 description 含"自动创建"的默认 agent。
// 我们要识别"是否还有更多用户主动创建的 agent"——
// 简单规则：除了那条系统默认 agent 外还有别的，就视为已有；否则视为零，跳到向导。
function 需要引导(agents: Array<{ type: string; description: string | null }>): boolean {
  if (agents.length === 0) return true;
  const 主动创建 = agents.filter(a => {
    if (a.type !== 'native') return true; // 非 native（remote / external_openclaw）一定是用户自己建的
    // native 且不是默认 agent
    if (!a.description) return true;
    return !a.description.includes('自动创建');
  });
  return 主动创建.length === 0;
}

export function MagicVerifyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'ok' | 'fail'>('verifying');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('fail');
      setErr('URL 缺少 token 参数');
      return;
    }
    验证magic_link(token)
      .then(async () => {
        setStatus('ok');
        // 登录成功后决定跳哪：
        // 1) 如果 URL 带合法 redirect → 优先跳 redirect（站内路径，open redirect 已防护）
        // 2) 否则查 agent 列表：没主动建过 agent → /agents/new（首次引导）；有 → /
        const redirect参数 = params.get('redirect');
        let 目标 = '/';
        if (是否合法redirect(redirect参数)) {
          目标 = redirect参数;
        } else {
          try {
            const ags = await 列我的agents();
            if (需要引导(ags)) {
              目标 = '/agents/new';
            }
          } catch {
            // 拉 agent 失败不阻塞登录跳转，默认跳首页
          }
        }
        setTimeout(() => navigate(目标, { replace: true }), 600);
      })
      .catch((e) => {
        setStatus('fail');
        setErr(e.message || String(e));
      });
  }, [params, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#FAFAF7' }}
    >
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'white',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          minWidth: '320px',
        }}
      >
        {status === 'verifying' && (
          <p style={{ color: '#444440', textAlign: 'center' }}>验证中…</p>
        )}
        {status === 'ok' && (
          <p style={{ color: '#15803D', textAlign: 'center' }}>✓ 登录成功，跳转中…</p>
        )}
        {status === 'fail' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#DC2626', marginBottom: 8 }}>✗ 验证失败</p>
            <p style={{ color: '#888882', fontSize: 12, marginBottom: 16 }}>{err}</p>
            <a href="/login" style={{ color: '#4F46E5', fontSize: 12 }}>回登录页</a>
          </div>
        )}
      </div>
    </div>
  );
}
