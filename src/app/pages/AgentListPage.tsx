// 我的 Agent 列表页（极简风）：列出当前用户的所有 agent。
// BYO（remote）agent 显示遮蔽接入链接；可重新生成密钥（弹 dialog 一次性显示新链接）；可查看 manifest。
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Bot, Cloud, Server, Loader2, Trash2, RefreshCw, ExternalLink,
  Eye, AlertTriangle, Check, Copy,
} from 'lucide-react';
import {
  列我的agents, 解绑agent, 重置agent_token,
  拼接入链接, 平台基址,
  type Agent, 已登录,
} from '../data/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';

export function AgentListPage() {
  const navigate = useNavigate();
  const [清单, set清单] = useState<Agent[]>([]);
  const [加载中, set加载中] = useState(true);
  const [错误, set错误] = useState<string | null>(null);
  // 重生 token dialog 状态
  const [新token, set新token] = useState<{ agentName: string; link: string } | null>(null);
  const [已复制, set已复制] = useState(false);
  // 重生中 id（防重复点）
  const [重生中id, set重生中id] = useState<string | null>(null);

  useEffect(() => {
    if (!已登录()) {
      navigate('/login', { replace: true });
      return;
    }
    刷新清单();
  }, []);

  async function 刷新清单() {
    set加载中(true);
    set错误(null);
    try {
      const r = await 列我的agents();
      set清单(r);
    } catch (e: any) {
      set错误(e?.message || String(e));
    } finally {
      set加载中(false);
    }
  }

  // 重新生成密钥 → 后端返回新 plain token → 弹 dialog 一次性显示完整新接入链接
  // 注意：plain token 只在内存中，不写 console.log / 不写 localStorage
  async function 处理重生token(a: Agent) {
    if (!confirm(`重新生成 "${a.name}" 的密钥？\n\n旧密钥立即失效，需要更新你 Agent 服务里的接入链接配置。`)) return;
    set重生中id(a.id);
    try {
      const r = await 重置agent_token(a.id);
      const newPlain = r.api_token;
      // 同步更新前缀
      set清单(prev => prev.map(x => (x.id === a.id ? { ...x, api_token_prefix: r.api_token_prefix } : x)));
      if (newPlain) {
        set新token({ agentName: a.name, link: 拼接入链接(newPlain) });
        set已复制(false);
      }
    } catch (e: any) {
      alert(`重置失败：${e?.message || e}`);
    } finally {
      set重生中id(null);
    }
  }

  async function 处理解绑(id: string, name: string) {
    if (!confirm(`确认解绑 Agent "${name}"？此操作不可撤销。`)) return;
    try {
      await 解绑agent(id);
      set清单(prev => prev.filter(a => a.id !== id));
    } catch (e: any) {
      alert(`解绑失败：${e?.message || e}`);
    }
  }

  // 查看 manifest：旧 token 已失效则后端会返回错误；前端只是打开新 tab，由后端反馈状态。
  function 处理查看manifest(a: Agent) {
    // 用 prefix 拼一个"提示"链接是没意义的 —— manifest 必须用完整 token。
    // 这里给用户一个明确反馈：要看 manifest，需要重新生成密钥（旧 token 不在前端存）。
    alert(
      'manifest 只能用完整接入链接打开。\n\n' +
        '旧 token 不在前端保存（安全考虑），如要查看 manifest，请：\n' +
        '1) 点"重新生成密钥"获取新链接\n' +
        '2) 在弹窗里点"查看 manifest"，会用新 token 打开 manifest JSON',
    );
  }

  // 遮蔽显示接入链接：只显示 prefix 前 5 字符 + 圆点 + 后 4 字符
  // 用户没法看到完整 plain token —— 必须重生
  function 遮蔽显示(prefix: string): string {
    const head = prefix.slice(0, 5);
    const tail = prefix.slice(-4);
    return `${平台基址}/接入/${head}••••••••${tail}`;
  }

  async function 复制新链接() {
    if (!新token) return;
    try {
      await navigator.clipboard.writeText(新token.link);
      set已复制(true);
      setTimeout(() => set已复制(false), 2500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = 新token.link;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); set已复制(true); } catch {}
      document.body.removeChild(ta);
    }
  }

  function 在新tab打开manifest() {
    if (!新token) return;
    window.open(新token.link, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="px-6 py-8" style={{ minHeight: '100%', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* 顶部：极简白 banner */}
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              我的 Agent
            </h1>
            <p style={{ fontSize: 13, color: '#666666', marginTop: 6 }}>
              管理你的 Agent，查看接入链接，必要时重新生成密钥。
            </p>
          </div>
          <button
            onClick={() => navigate('/agents/new')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all"
            style={{
              background: '#4F46E5',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4338CA'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#4F46E5'; }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            添加 Agent
          </button>
        </div>

        {加载中 && (
          <div className="flex items-center justify-center py-16">
            <Loader2 style={{ width: 20, height: 20, color: '#4F46E5' }} className="animate-spin" />
          </div>
        )}

        {错误 && !加载中 && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
          >
            <p style={{ fontSize: 12, color: '#DC2626' }}>{错误}</p>
          </div>
        )}

        {!加载中 && !错误 && 清单.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px dashed #E5E5E5' }}
          >
            <Bot style={{ width: 32, height: 32, color: '#999999', margin: '0 auto 12px' }} strokeWidth={1.5} />
            <p style={{ fontSize: 14, color: '#666666', marginBottom: 12 }}>你还没有 Agent</p>
            <button
              onClick={() => navigate('/agents/new')}
              className="px-4 py-2 rounded-lg"
              style={{ background: '#4F46E5', color: '#FFFFFF', fontSize: 13, fontWeight: 600 }}
            >
              立即创建
            </button>
          </div>
        )}

        {!加载中 && 清单.length > 0 && (
          <div className="flex flex-col gap-3">
            {清单.map(a => {
              const 是native = a.type === 'native';
              const 类型标签 = 是native ? 'native' : a.type === 'remote' ? 'remote (BYO)' : a.type;
              const TypeIcon = 是native ? Cloud : Server;
              const 重生中 = 重生中id === a.id;
              const 遮蔽链接 = 遮蔽显示(a.api_token_prefix);

              return (
                <div
                  key={a.id}
                  className="rounded-2xl p-5 transition-all"
                  style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: '#FAFAFA', border: '1px solid #E5E5E5' }}
                      >
                        <TypeIcon
                          style={{ width: 16, height: 16, color: '#666666' }}
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.01em' }}>{a.name}</p>
                          <span
                            className="px-1.5 py-0.5 rounded-md"
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              color: '#666666',
                              background: '#F5F5F5',
                              border: '1px solid #E5E5E5',
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {类型标签}
                          </span>
                          {a.status === 'active' && (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: '#4F46E5' }}
                              title="active"
                            />
                          )}
                        </div>
                        {a.description && (
                          <p style={{ fontSize: 12, color: '#666666', marginBottom: 4 }}>{a.description}</p>
                        )}
                        <p style={{ fontSize: 11, color: '#999999' }}>
                          创建于 {new Date(a.created_at).toLocaleDateString('zh-CN')}
                          {a.last_used_at && ` · 最近活动 ${new Date(a.last_used_at).toLocaleDateString('zh-CN')}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => 处理解绑(a.id, a.name)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: '#999999' }}
                      title="解绑这个 Agent"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F5F5F5'; (e.currentTarget as HTMLButtonElement).style.color = '#DC2626'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#999999'; }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} strokeWidth={1.75} />
                    </button>
                  </div>

                  {/* 接入链接区（仅 BYO/remote） */}
                  {!是native && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F0F0F0' }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#999999', letterSpacing: '0.06em', marginBottom: 6, textTransform: 'uppercase' }}>
                        接入链接
                      </p>
                      <code
                        className="block px-3 py-2 rounded-lg break-all mb-3"
                        style={{
                          background: '#FAFAFA',
                          color: '#0A0A0A',
                          fontSize: 12,
                          fontFamily: 'ui-monospace, "SF Mono", monospace',
                          border: '1px solid #E5E5E5',
                        }}
                      >
                        {遮蔽链接}
                      </code>
                      <p style={{ fontSize: 11, color: '#999999', marginBottom: 12, lineHeight: 1.55 }}>
                        完整 token 出于安全考虑不会回显。如需查看完整链接，请重新生成密钥。
                      </p>

                      {/* 操作行（BYO 专属） */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => 处理重生token(a)}
                          disabled={重生中}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: '#4F46E5',
                            color: '#FFFFFF',
                            fontSize: 11,
                            fontWeight: 600,
                            opacity: 重生中 ? 0.6 : 1,
                          }}
                          onMouseEnter={(e) => { if (!重生中) (e.currentTarget as HTMLButtonElement).style.background = '#4338CA'; }}
                          onMouseLeave={(e) => { if (!重生中) (e.currentTarget as HTMLButtonElement).style.background = '#4F46E5'; }}
                        >
                          {重生中 ? (
                            <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" />
                          ) : (
                            <RefreshCw style={{ width: 11, height: 11 }} />
                          )}
                          重新生成密钥
                        </button>
                        <button
                          onClick={() => 处理查看manifest(a)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E5E5E5',
                            color: '#0A0A0A',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4D4D4'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E5E5'; }}
                        >
                          <Eye style={{ width: 11, height: 11 }} />
                          查看 manifest
                        </button>
                      </div>
                    </div>
                  )}

                  {/* native：不显示接入链接区 */}
                  {是native && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #F0F0F0' }}>
                      <p style={{ fontSize: 11, color: '#999999', lineHeight: 1.55 }}>
                        平台代调 Agent，无需接入链接。
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 重生 token 后弹出 dialog：一次性显示新接入链接 ── */}
      <Dialog open={!!新token} onOpenChange={(open) => { if (!open) { set新token(null); set已复制(false); } }}>
        <DialogContent
          className="sm:max-w-[560px]"
          style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: '#0A0A0A', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
              新的接入链接
            </DialogTitle>
            <DialogDescription style={{ color: '#666666', fontSize: 13, lineHeight: 1.55 }}>
              这是 Agent <b style={{ color: '#0A0A0A' }}>{新token?.agentName}</b> 的接入链接，把它发给你的 Agent 服务。
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            {/* 完整新链接 */}
            <code
              className="block px-3 py-3 rounded-xl break-all"
              style={{
                background: '#FAFAFA',
                color: '#0A0A0A',
                fontSize: 13,
                fontFamily: 'ui-monospace, "SF Mono", monospace',
                border: '1px solid #E5E5E5',
                lineHeight: 1.55,
              }}
            >
              {新token?.link}
            </code>

            {/* 警告 */}
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}
            >
              <AlertTriangle style={{ width: 13, height: 13, color: '#DC2626', marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: '#666666', lineHeight: 1.55 }}>
                <b style={{ color: '#DC2626' }}>离开此对话框后将无法再看到完整链接。</b>
                如果丢失，再次重新生成密钥即可（旧密钥会立即失效）。
              </p>
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2 sm:flex-row">
            <button
              onClick={在新tab打开manifest}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition-all order-2 sm:order-1"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E5E5',
                color: '#0A0A0A',
                fontSize: 13,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4D4D4'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E5E5'; }}
            >
              <ExternalLink style={{ width: 12, height: 12 }} />
              查看 manifest
            </button>
            <button
              onClick={复制新链接}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg transition-all order-1 sm:order-2"
              style={{
                background: 已复制 ? '#FFFFFF' : '#4F46E5',
                color: 已复制 ? '#4F46E5' : '#FFFFFF',
                border: 已复制 ? '1px solid #4F46E5' : '1px solid transparent',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {已复制 ? (
                <>
                  <Check style={{ width: 13, height: 13 }} />
                  已复制
                </>
              ) : (
                <>
                  <Copy style={{ width: 13, height: 13 }} />
                  复制链接
                </>
              )}
            </button>
            <button
              onClick={() => { set新token(null); set已复制(false); }}
              className="px-4 py-2 rounded-lg transition-all order-3"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E5E5',
                color: '#666666',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              关闭
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
