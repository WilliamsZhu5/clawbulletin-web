# 补丁 B — "跟我的 Agent 聊"并入 MessagesPage（微信式虚拟会话）

日期：2026-05-06
状态：PASS（Vite build 通过，1.87s，2126 modules 转换无报错）

## 目标

把独立 `/我的agent` 整页 chat 改造成 MessagesPage 内的"置顶虚拟会话"，
模仿微信"文件传输助手"：列表里看到「我的 Agent」→ 点击右栏出现紫色头像 + chat UI。

## 改动文件

| 文件 | 改动类型 | 说明 |
|---|---|---|
| `src/app/pages/MessagesPage.tsx` | 主要扩展 | 注入虚拟会话；右栏分支渲染 |
| `src/app/components/layout/Sidebar.tsx` | 删项 | 移除「跟 Agent 聊」navItem |
| `src/app/pages/MyAgentChatPage.tsx` | 重写为 redirect | 整页废弃，redirect 到 `/messages?conversation=__my_agent__` |
| `src/app/routes.tsx` | 不动 | `/my-agent` 路由保留（component 内部 redirect） |

## 关键设计

### 虚拟会话 ID 哨兵

`const MY_AGENT_ID = '__my_agent__'` — 不在后端 conversations 表，
单独走 `我的agent_*` API。MessagesPage 的 `选中id === MY_AGENT_ID` 用于分支选择。

### 列表置顶卡

- 左列顶部：紫色 Sparkles icon 头像 + "我的 Agent" + "Agent · 置顶" badge
- 最后消息预览：取自 `agent消息列表` 末尾（user / assistant 文本，
  或 tool_call 时显示"Agent 正在搜索…"等推断文案）
- 永远在筛选后列表之前；搜索词命中"我的 agent"或预览时仍显示

### 右栏分支

```
{是否选中Agent && <Agent chat: ChatHeader + MessageList(agent节点列表) + ChatInput(处理Agent发送)>}
{选中id && !是否选中Agent && <原有真实对话渲染>}
```

Agent 分支复用 chat 组件（MessageBubble、MessageList、ChatInput、ToolCallCard、TypingIndicator），
保留 tool_calling 工具卡（搜帖 / 起对话）+ loading 文案推断。

### 默认选中规则

1. URL `?conversation=__my_agent__` → 选 Agent
2. URL `?conv=<id>` 命中 → 选该真实对话
3. 否则若有真实对话列表 → 选第一条
4. 都无 → 选 Agent（永远可点）

### Agent 会话懒加载

进入 `/messages` 后异步拉 `我的agent_拉最新会话`；无历史则
`我的agent_新建会话` 创建一个空会话，不阻塞列表渲染。

### 旧路由兼容

`/我的agent` (`/my-agent`) 仍保留路由表，但 `MyAgentChatPage` 组件
首屏 useEffect 调 `navigate('/messages?conversation=__my_agent__', { replace: true })`，
旧书签 / 邮件链接不破坏。

### Sidebar 删项

`navItems` 数组里删掉 `{ icon: Bot, path: '/my-agent', label: '跟 Agent 聊' }` 那条。
`Bot` icon 仍保留 import（账号下拉菜单"我的 Agent → /agents"还在用）。

## 尺寸（紧凑式 — user 要求"别弄这么长"）

MessagesPage 已有 `height: 'calc(100vh - 56px)'` + flex 布局：
- 左列 296px 固定
- 右列 flex-1，header（ChatHeader 内置 ~60px）+ MessageList flex-1 滚动 + ChatInput（~60px）
- 跟微信桌面端结构一致：消息少时 padding 居中，多时滚动；不会出现整页空白

## 验证

| 项 | 结果 |
|---|---|
| `npx vite build` | PASS — 2126 modules 转换无错；输出 836KB JS / 100KB CSS |
| Sidebar 删除「跟 Agent 聊」 | DONE（grep 确认） |
| 旧 `/我的agent` redirect | DONE（useEffect navigate replace:true） |
| API call 保留 | YES — `我的agent_新建会话/拉最新会话/发送` 全部沿用 |
| Tool calling | YES — 工具调用卡 + 工具结果摘要 + loading 文案推断都搬到 MessagesPage |
| 紫色 brand | YES — `聊天色.紫渐变` 头像；CSS 未变 |

## 已知限制 / 未做

- 浏览器 E2E 截图未跑（vite build pass + HMR 等运行时验证由 user 手动）
- `useSearchParams` 的 `?conversation=` 在 hash 后不会触发 effect 重跑；user 通过 Sidebar/链接进入是 OK 的，URL 内动态切换 Agent ↔ 真实对话需要手动 click

## 回滚一行

```bash
git diff HEAD~1 -- src/app/pages/MessagesPage.tsx src/app/pages/MyAgentChatPage.tsx src/app/components/layout/Sidebar.tsx | git apply -R
```

（本次未 commit，未推；ctrl+Z / git checkout -- 即可回滚）
