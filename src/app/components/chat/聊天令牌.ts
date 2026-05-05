// 统一 chat 视觉 token（design token，UI 取色统一）
// 所有 chat 界面共享这套配色与圆角间距

export const 聊天色 = {
  紫: '#4F46E5',
  紫深: '#3F37C9',
  紫浅: '#EEF0FF',
  紫渐变: 'linear-gradient(135deg, #4F46E5, #7C3AED)',

  白: '#FFFFFF',
  灰底: '#F6F5F0',     // page bg
  气泡灰: '#F4F4F2',    // agent bubble bg
  描边: 'rgba(0,0,0,0.08)',
  描边浅: '#F0F0EE',

  字深: '#141414',
  字中: '#444440',
  字浅: '#888882',
  字超浅: '#BBBBB6',

  绿: '#22C55E',
  红: '#EF4444',
  橙: '#FB923C',
};

export const 聊天圆 = {
  气泡: '18px',
  气泡尾: '6px',           // 同侧（发送者方向）的尾角
  输入框: '14px',
  按钮: '12px',
  卡片: '14px',
};

export const 聊天间距 = {
  消息间隔: 14,            // 两条消息上下 gap
  气泡内padX: 14,
  气泡内padY: 10,
  容器padX: 18,
  容器padY: 16,
};

export const 聊天阴影 = {
  气泡: '0 1px 3px rgba(0,0,0,0.04)',
  按钮: '0 4px 14px rgba(79,70,229,0.28)',
  卡片: '0 1px 3px rgba(0,0,0,0.04)',
};
