# PostDetail 性能修复 + UI 重做（2026-05-06）

## 背景

用户反馈：「点开帖子详情特别不流畅、卡」+「把这个 UI 重做一下」。
对应文件：`src/app/pages/PostDetailPage.tsx`（独立路由 `/post/:id`，从 PostCard 跳转 / 直链都走它）。

后端 `GET /api/posts/{id}` 实测响应 0.00–0.06s（curl x3），后端不背锅；卡顿全在前端。

---

## §1 性能诊断 —— 找到的 7 条 bottleneck

| # | 现象 | 修法 |
|---|---|---|
| 1 | **三次 fetch 串行**：`Promise.all([单帖,列评论]).then(...).then(列帖子...)`，相关帖子拿不到整页就还是「加载中…」 | 拆三条独立加载线，post 拿到立刻渲染；评论 / 相关帖子各自有独立 loading state |
| 2 | **整页 loading 阻塞首屏**：任何一条 promise 没完都看到 "加载中…" | 改为骨架屏（skeleton），post 一到立即出主体；评论位置自带骨架 |
| 3 | **fetch 没 AbortController / cancelled 标记**：快速切帖时旧请求 setState 会污染新页 | 加 `let cancelled = true` 守卫，cleanup 时置 true，每个 setState 前 guard |
| 4 | **bodyParagraphs split 每次 render 都跑** | `useMemo([displayBody])` |
| 5 | **评论双 map（适配 + 渲染）每次 render 都重跑** | `adaptedComments = useMemo(() => apiComments.map(适配为mockComment), [apiComments])` |
| 6 | **评论无子组件 / 无 memo**：点赞一条所有评论重渲染 | 抽出 `CommentItem = memo(...)` + handlers 用 `useCallback` |
| 7 | **`拿用户()` 每次 render 都读 localStorage** | `useMemo(() => 拿用户(), [])` 只读一次 |

附加：ConversationModal 已经是条件渲染 `{showMessage && <ConversationModal />}`，本来就是 lazy mount，保留不变。

---

## §2 UI 重做 —— 风格定调

跟项目当前风格统一：白底 + 紫色 `#4F46E5` accent + category 多色 + 流畅过渡。

### 关键变化

| 区块 | 改前 | 改后 |
|---|---|---|
| 顶部 category 条 | 无 | 卡顶 3px category 渐变多色条（jobs 紫 / projects 紫 / marketplace 橙 / skills 绿…） |
| 标题 | 22px / 600 | 26px / 700 / letter-spacing -0.025em |
| 作者行 | 头像 40px + 文字 | 头像 44px + 紫色 `AGENT` badge（agent 帖才显示）+ hover 紫色 |
| 价格 chip | 单灰底 | category 多色 chip（chipBg + chipBorder + chipText） |
| 操作 bar | 散在右上角小按钮 | 卡底独立浅渐变 bar：左 收藏/分享/举报，右 紫色渐变主按钮「让我的 Agent 跟 X 聊」 |
| 收藏按钮 | 黑底激活 | 紫色 `#4F46E5` 激活 |
| 评论标题 | 文本 | MessageCircle 紫色 icon + 文字 |
| 评论卡 | 无 hover | hover `#FAFAF8` 浅灰底 + 头像 hover scale 1.05 |
| 评论作者点击 | hover 灰色 | hover 紫色 `#4F46E5` |
| 评论赞激活 | 黑色 | 紫色 |
| 评论输入 focus | 黑边 | 紫色 `#4F46E5` 边 |
| 发表按钮 | 黑底纯色 | 紫色渐变 + shadow |
| 标签 | 灰底 | category 多色 chip + `#tag` 前缀 |
| 入场 | 直出 | stagger fade-in：面包屑 0ms / 主帖 40ms / 评论 120ms / 相关 200ms |
| loading | 一行 "加载中…" | 完整骨架屏（标题 / 作者 / 段落 / 评论各有 skeleton） |
| 字体 | 默认 | 显式 `PingFang SC` 等中文字体栈 |

正文区 max-width 760px（防过宽 / 已实施），段间距 16px / line-height 1.75 / 字号 15px。

---

## §3 改了的文件

- `src/app/pages/PostDetailPage.tsx`（整文件重写，470 → 713 行；多出来的主要是骨架屏 + memo 子组件 + 多色 lookup table）

**未改**：
- `src/app/components/PostDetailPanel.tsx`（PostCard 用的侧滑面板 — 风格已经类似，本期不动以免破坏 PostCard）
- `src/app/components/ConversationModal.tsx`、`AgentNegotiateModal.tsx`（接口零改动）
- `src/app/data/api.ts`（零改动）
- 后端（零改动）

---

## §4 保留的功能

- `单帖(id)` / `列评论(id)` / `列帖子({category, limit:4})` / `发评论(post.id, txt)` 全部保留
- `已登录()` / `拿用户()` 鉴权链保留
- `适配为mockPost` / `适配为mockComment` 适配器照用
- `ConversationModal autoAgent post={post} apiPost={apiPostRaw}` prop 接口零改
- `navigate('/u/:username')` / `navigate('/c/:category')` / `navigate('/search?q=')` / `navigate('/login')` 全部保留
- 国际化 `useLanguage()` + `postTranslationsZh` 保留
- 收藏 / 点赞 / 评论 state 全部保留

---

## §5 验证数据

### 后端 API 响应（curl x3 取中位）
```
/api/posts/p-a2a61f             real 0.01 s
/api/posts/p-a2a61f/comments    real 0.00 s
```
后端非瓶颈。

### Vite dev server
- 进程在跑：`node 95389 ... TCP [::1]:5173 (LISTEN)`
- HTTP 200 响应正常
- esbuild 单文件 parse check：PASS（`--jsx=automatic --target=esnext`）

### 预期效果（待用户人工验证）
- 首屏：骨架 → post 主体（< 100ms 后端时间，~1 帧前端解析），用户感觉接近「秒开」
- 评论：和主体并行，独立 skeleton；评论慢不再阻塞主体
- 切帖：cancelled flag 防 stale state
- 点赞：单条 CommentItem 重渲染，其他不动

---

## §6 已知问题 / 下一步

1. **未装 react-markdown** —— 帖子正文目前还是手写换行 + `—` 列表识别（沿袭老逻辑）。如果用户后期想要 markdown / code block / 表格，要装 `react-markdown` + `remark-gfm`，然后给它包 `React.memo` 防重渲染。**没装新依赖**（按硬约束）。
2. **未做评论 virtualization** —— 当前 `divide-y` + memo CommentItem 已经够用到几百条；若评论上千需要 `react-virtuoso` 或 `@tanstack/react-virtual`。本期没装。
3. **PostDetailPanel.tsx 风格暂未跟随** —— 它是 PostCard 弹出的侧滑面板（独立路径），跟独立 `/post/:id` 是两条路径。本期只动了 `/post/:id`。如果用户想统一两边，下一轮把 PostDetailPanel 也按同样风格重做。
4. **「举报」按钮无 handler** —— 只占位，hover F43F5E 红色。下一轮接 `举报API` 时再补。
5. **Conversation 起对话延迟** —— 用户点「让我的 Agent 跟 X 聊」时仍要等后端 `发起对话` LLM 响应（这是 ConversationModal 内部逻辑）。本次未动 modal。如果用户觉得这一步也卡，下一轮可以考虑 modal 内 skeleton + optimistic UI。

### 给主 agent 的下一步建议
建议主 agent 让用户用浏览器实际打开一个帖子详情页观察是否流畅，并确认新视觉是否符合期望；若 OK，下一轮可统一 `PostDetailPanel` 风格 / 接「举报」handler / 给 ConversationModal 加 skeleton。
