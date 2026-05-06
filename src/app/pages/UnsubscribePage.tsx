// 退订落地页（v2 通知中心 F13）—— 不需要登录态
// URL 形如 /unsubscribe?token=<hex>&done=1（done=1 表示后端 GET 已经退订生效，仅展示成功）
// 或 /unsubscribe?token=<hex>&error=invalid（后端 GET 解析 token 失败）
// 或 /unsubscribe?token=<hex>（用户先到落地页，再点按钮 POST 触发退订）
//
// 流程：
//  - 进入页：解析 query。如果 done=1 → 直接显示成功；error=invalid → 显示无效
//  - 否则展示「确认退订」按钮，点击 → POST /api/退订/{token} → 渲染结果
//  - 成功后展示「返回 Bulletin」（→ /）+ 「管理通知设置」（→ /settings）

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { 退订, 已登录, type 退订查询结果 } from '../data/api';

const 紫 = '#4F46E5';
const 字深 = '#141414';
const 字浅 = '#666660';
const 字超浅 = '#999994';
const 描边 = '#E8E8E4';
const 成功绿 = '#16A34A';
const 错红 = '#DC2626';

type 阶段 = 'idle' | '处理中' | '成功' | '已用过' | '无效' | '网络错';

export function UnsubscribePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const done = searchParams.get('done') === '1';
  const errorParam = searchParams.get('error');

  // 后端返回的 type（None → 全部退订；具体 type → 单类退订）
  const [结果, set结果] = useState<退订查询结果 | null>(null);
  const [阶段, set阶段] = useState<阶段>(() => {
    if (errorParam === 'invalid' || !token) return '无效';
    if (done) return '成功'; // 后端 GET 已退订成功；进入落地页只是展示
    return 'idle';
  });
  const [错文案, set错文案] = useState<string | null>(null);

  // 如果是 done=1 但 GET 后端已经处理过，可能想拿到 type 信息回显
  // 这里简化：done=1 时直接展示通用「已退订」文案，不再调 POST（避免幂等竞争）
  useEffect(() => {
    // intentional no-op；保留 effect 以便将来加 GET 查询接口（v2 plan 没暴露查询，仅 POST）
  }, [token]);

  const 处理确认退订 = async () => {
    if (!token || 阶段 === '处理中') return;
    set阶段('处理中');
    set错文案(null);
    try {
      const r = await 退订(token);
      set结果(r);
      if (r.已用过) set阶段('已用过');
      else set阶段('成功');
    } catch (e: any) {
      const msg = e?.message || String(e);
      // 后端 404 → 无效；其它 → 网络错
      if (/404|无效|过期|不存在/.test(msg)) {
        set阶段('无效');
      } else {
        set错文案(msg);
        set阶段('网络错');
      }
    }
  };

  const 头 = useMemo(() => {
    if (阶段 === '成功' || 阶段 === '已用过') {
      return { icon: <CheckCircle2 style={{ width: 36, height: 36, color: 成功绿 }} />, color: 成功绿 };
    }
    if (阶段 === '无效' || 阶段 === '网络错') {
      return { icon: <AlertCircle style={{ width: 36, height: 36, color: 错红 }} />, color: 错红 };
    }
    return { icon: <Mail style={{ width: 36, height: 36, color: 紫 }} strokeWidth={1.75} />, color: 紫 };
  }, [阶段]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFB 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 20px 40px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          border: `1px solid ${描边}`,
          borderRadius: 18,
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* 顶部 logo + 头 */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 字超浅,
            marginBottom: 18,
          }}
        >
          BULLETIN
        </div>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#F8F8F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          {头.icon}
        </div>

        {/* idle / 处理中 —— 让用户确认退订 */}
        {(阶段 === 'idle' || 阶段 === '处理中') && (
          <>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: 字深,
                letterSpacing: '-0.01em',
              }}
            >
              退订邮件通知
            </h1>
            <p
              style={{
                margin: '12px 0 24px',
                fontSize: 13,
                color: 字浅,
                lineHeight: 1.6,
              }}
            >
              点击下方按钮即可一键退订。退订后你的邮箱将不再收到此类 Bulletin 通知邮件。
            </p>
            <button
              onClick={处理确认退订}
              disabled={阶段 === '处理中' || !token}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 紫,
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 阶段 === '处理中' ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.28)',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (阶段 !== '处理中') {
                  (e.currentTarget as HTMLButtonElement).style.background = '#3F37C9';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 紫;
              }}
            >
              {阶段 === '处理中' ? '处理中…' : '确认退订'}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: 12,
                background: 'transparent',
                border: 'none',
                color: 字浅,
                fontSize: 12,
                cursor: 'pointer',
                padding: '6px 12px',
              }}
            >
              算了，返回 Bulletin
            </button>
          </>
        )}

        {/* 成功（首次）or done=1 重定向跳进来 */}
        {阶段 === '成功' && (
          <>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: 字深,
                letterSpacing: '-0.01em',
              }}
            >
              已退订
            </h1>
            <p
              style={{
                margin: '12px 0 8px',
                fontSize: 13,
                color: 字浅,
                lineHeight: 1.6,
              }}
            >
              {结果?.全部
                ? '邮箱不再收到任何 Bulletin 通知邮件。'
                : 结果?.type
                ? `已退订此类邮件（${结果.type}）。其他类型仍按你的设置发送。`
                : '邮箱不再收通知邮件。'}
            </p>
            {结果?.用户邮箱_前缀 && (
              <p style={{ margin: '0 0 24px', fontSize: 11, color: 字超浅 }}>
                影响邮箱：{结果.用户邮箱_前缀}
              </p>
            )}
            {!结果?.用户邮箱_前缀 && <div style={{ height: 16 }} />}
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                padding: '11px 20px',
                background: 紫,
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.22)',
              }}
            >
              返回 Bulletin
            </button>
            {已登录() && (
              <button
                onClick={() => navigate('/settings')}
                style={{
                  marginTop: 10,
                  background: 'transparent',
                  border: 'none',
                  color: 紫,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                管理通知设置
                <ArrowRight style={{ width: 12, height: 12 }} />
              </button>
            )}
          </>
        )}

        {/* 已用过 */}
        {阶段 === '已用过' && (
          <>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 字深 }}>链接已使用</h1>
            <p style={{ margin: '12px 0 24px', fontSize: 13, color: 字浅, lineHeight: 1.6 }}>
              此退订链接已经被点击过。你的偏好已经按上次操作生效，无需再次确认。
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                padding: '11px 20px',
                background: 紫,
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              返回 Bulletin
            </button>
          </>
        )}

        {/* 无效 */}
        {阶段 === '无效' && (
          <>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 字深 }}>链接无效</h1>
            <p style={{ margin: '12px 0 24px', fontSize: 13, color: 字浅, lineHeight: 1.6 }}>
              此退订链接可能已经过期、被复制错误，或不属于任何 Bulletin 邮件。
            </p>
            <button
              onClick={() => navigate(已登录() ? '/settings' : '/')}
              style={{
                width: '100%',
                padding: '11px 20px',
                background: 紫,
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {已登录() ? '前往设置' : '返回 Bulletin'}
            </button>
          </>
        )}

        {/* 网络错 */}
        {阶段 === '网络错' && (
          <>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 字深 }}>网络错误</h1>
            <p style={{ margin: '12px 0 8px', fontSize: 13, color: 字浅, lineHeight: 1.6 }}>
              退订请求失败，请重试。
            </p>
            {错文案 && (
              <p
                style={{
                  margin: '0 0 18px',
                  fontSize: 11,
                  color: 错红,
                  background: '#FEF2F2',
                  padding: '6px 10px',
                  borderRadius: 8,
                  maxWidth: '100%',
                  wordBreak: 'break-all',
                }}
              >
                {错文案}
              </p>
            )}
            <button
              onClick={处理确认退订}
              style={{
                width: '100%',
                padding: '11px 20px',
                background: 紫,
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              重试
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: 10,
                background: 'transparent',
                border: 'none',
                color: 字浅,
                fontSize: 12,
                cursor: 'pointer',
                padding: '6px 12px',
              }}
            >
              算了，返回 Bulletin
            </button>
          </>
        )}
      </div>
    </div>
  );
}
