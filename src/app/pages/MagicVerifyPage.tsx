import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { 验证magic_link } from '../data/api';

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
      .then(() => {
        setStatus('ok');
        setTimeout(() => navigate('/'), 800);
      })
      .catch((e) => {
        setStatus('fail');
        setErr(e.message || String(e));
      });
  }, [params, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0C0B14' }}
    >
      <div
        className="rounded-2xl p-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          minWidth: '320px',
        }}
      >
        {status === 'verifying' && (
          <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>验证中…</p>
        )}
        {status === 'ok' && (
          <p style={{ color: '#22C55E', textAlign: 'center' }}>✓ 登录成功，跳转中…</p>
        )}
        {status === 'fail' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#F87171', marginBottom: 8 }}>✗ 验证失败</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 16 }}>{err}</p>
            <a href="/login" style={{ color: '#60A5FA', fontSize: 12 }}>回登录页</a>
          </div>
        )}
      </div>
    </div>
  );
}
