// 复制到剪贴板按钮：传一个 value 进来，点击复制 + 短暂显示"已复制"。
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

type 复制按钮属性 = {
  value: string;
  // 视觉变体（默认 emit 玻璃风按钮，紧凑，给 BYO 接入信息卡片用）
  variant?: 'default' | 'compact';
  className?: string;
  ariaLabel?: string;
};

export function 复制按钮({
  value,
  variant = 'default',
  className,
  ariaLabel = '复制到剪贴板',
}: 复制按钮属性) {
  const [已复制, set已复制] = useState(false);
  const [失败, set失败] = useState(false);

  async function 处理点击() {
    try {
      // 优先使用 clipboard API（HTTPS / localhost 环境支持）
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // fallback：用临时 textarea + execCommand（老浏览器或 file:// 场景）
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      set已复制(true);
      set失败(false);
      setTimeout(() => set已复制(false), 3000);
    } catch (e) {
      // 复制失败时也要给用户反馈，不能静默吞掉
      // eslint-disable-next-line no-console
      console.warn('复制失败', e);
      set失败(true);
      setTimeout(() => set失败(false), 3000);
    }
  }

  const 紧凑 = variant === 'compact';

  return (
    <button
      type="button"
      onClick={处理点击}
      aria-label={ariaLabel}
      className={
        'inline-flex items-center gap-1.5 rounded-md transition-all ' +
        (紧凑
          ? 'px-2 py-1 text-[11px] '
          : 'px-3 py-1.5 text-[12px] ') +
        (className || '')
      }
      style={{
        background: 已复制
          ? 'rgba(34,197,94,0.12)'
          : 失败
            ? 'rgba(248,113,113,0.12)'
            : 'rgba(255,255,255,0.06)',
        border: 已复制
          ? '1px solid rgba(34,197,94,0.4)'
          : 失败
            ? '1px solid rgba(248,113,113,0.4)'
            : '1px solid rgba(255,255,255,0.12)',
        color: 已复制 ? '#22C55E' : 失败 ? '#F87171' : 'rgba(255,255,255,0.75)',
        fontWeight: 500,
      }}
    >
      {已复制 ? (
        <>
          <Check style={{ width: 12, height: 12 }} strokeWidth={2.5} />
          已复制
        </>
      ) : 失败 ? (
        '复制失败'
      ) : (
        <>
          <Copy style={{ width: 12, height: 12 }} strokeWidth={2} />
          复制
        </>
      )}
    </button>
  );
}
