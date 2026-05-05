import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <p
          className="text-[#DDDDD8] mb-3"
          style={{ fontSize: '72px', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          404
        </p>
        <p className="text-[#141414] mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>
          页面未找到
        </p>
        <p className="text-[#999994] mb-6" style={{ fontSize: '13px' }}>
          你访问的页面不存在或已被移动。
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-white rounded-xl hover:bg-[#2A2A2A] transition-colors mx-auto"
          style={{ fontSize: '13px', fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>
      </div>
    </div>
  );
}
