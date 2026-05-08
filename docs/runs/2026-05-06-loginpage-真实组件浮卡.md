# LoginPage 右栏装饰 — 接入真实业务组件

日期：2026-05-06
范围：`src/app/pages/LoginPage.tsx` 右栏（紫色装饰区）

## 改动摘要

把右栏 3 个浮卡从手写 fake HTML 替换成**真实 Bulletin 业务组件 + mock data**，与产品视觉 100% 一致；浮卡尺寸全部加大；外层 `pointer-events: none` 防误点。

## 真实组件复用清单

| 组件 | 路径 | 用途 |
|---|---|---|
| `PostCard` | `src/app/components/PostCard.tsx` | 浮卡 1 整体（marketplace 需求帖） |
| `CategoryBadge` | `src/app/components/CategoryBadge.tsx` | PostCard 内部 + 浮卡 3 内嵌（skills / marketplace 多色 badge） |
| `MessageBubble` | `src/app/components/chat/MessageBubble.tsx` | 浮卡 2 三条 chat 气泡（user / agent 双向） |
| `TypingIndicator` | `src/app/components/chat/TypingIndicator.tsx` | 浮卡 2 底部"Your Agent 正在回复…" |

## 3 个浮卡内容

1. **顶部左偏（rotate -3deg / 380px）** — 真实 `PostCard` 渲染 mock `Post`：Translit 招翻译，skills 类目，$700 budget，verified author。带左侧 category 染色 stripe + chip + tags + footer stats，与 /trending 视觉完全一致。
2. **中部右偏（rotate +2deg / 400px）** — 真实 `MessageBubble` 三条议价对话（Translit → Your Agent → Translit）+ `TypingIndicator`；外面套白卡 + Handshake 顶栏，模拟 ConversationModal 的 negotiation 容器。
3. **底部居中偏左（rotate -1deg / 380px）** — Deal closed 成交卡：内嵌真实 `CategoryBadge`（skills + marketplace），双方头像 + ⇄ 箭头 + 成交价 + 自动签合同行。

## 框 / 尺寸调整

- 浮卡 1：300px → **380px**
- 浮卡 2：280px → **400px**
- 浮卡 3：320px → **380px**
- 阴影加深：`0 24px 48px rgba(0,0,0,0.22), 0 10px 20px rgba(0,0,0,0.12)`
- 内 padding 加大（16 → 20-22）
- 浮卡位置略调以避免互相遮挡

## 防误点策略

3 个浮卡的最外层 `<div>` 都加 `pointerEvents: 'none'`，所以 `PostCard` 内部的 `useNavigate` / 弹窗 / talkto.me 按钮 / tag 跳搜索都**不会触发**。访客点右栏不会跳走。

## Context 依赖兼容

- `PostCard` 依赖 `LanguageContext` 和 `useNavigate` —— LoginPage 已被 `LanguageProvider` 和 `BrowserRouter` 包裹（App.tsx 验证），直接渲染 OK。
- `MessageBubble` 用 `motion/react`，原本就在项目里。
- 所有真实组件不需要额外 Provider。

## 功能保留

- 左栏 form / state / handler / API 调用 / redirect / 错误处理 / magic link step 全部未动
- 紫色 brand 渐变 / 装饰圆点 / 顶部光晕保留
- `< lg` 断点仍隐藏右栏

## 验证

- `vite build` 通过，无 type / import error，2126 modules transformed
- Vite dev server 5173 编译 LoginPage.tsx 返回 200 / 137KB
- 无新依赖
- 未 commit / push
