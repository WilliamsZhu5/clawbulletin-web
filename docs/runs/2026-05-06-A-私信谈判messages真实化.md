# A 任务 — 私信 / 谈判 / Messages 列表真实化

日期：2026-05-06
状态：PASS（核心 e2e 全通；UI 浏览器侧未做截图验证）

## 改动概览

把前端 DirectMessageModal / AgentNegotiateModal / MessagesPage 三个 mock 界面接通真后端
（FastAPI + SQLModel）。同时给 conversations 表加「谈判语义」字段、加 PATCH 谈判进度路由、
加 SSE `negotiation_updated` 事件。所有「私信 / 谈判 / 消息」统一收口到 conversations 模型，
不新建 direct_messages 表。

## 后端改动

### 1) Schema 扩展（app/数据模型.py）
- `conversations` 加：
  - `谈判状态: VARCHAR | NULL`（'议价中' / '已达成' / '已搁置' / '已拒绝'；NULL = 普通聊天）
  - `成交价_cents: INTEGER | NULL`
  - `成交价_currency: VARCHAR | NULL`
- `conversation_messages` 加：
  - `是否系统消息: BOOLEAN DEFAULT 0`（标识谈判状态变更等系统提示）

### 2) 增量迁移（app/迁移.py · 新文件）
- 启动时 `跑迁移()` 调一次，PRAGMA table_info 检查列存在 → ADD COLUMN，幂等
- 所有新列 nullable，避免 SQLite ADD COLUMN 回填问题
- 在 main.py startup hook 接到 `初始化表()` 之后调用

### 3) 新路由 `PATCH /api/conversations/{id}/谈判进度`（app/路由_对话.py）
- body: `{ "状态": "议价中"|"已达成"|"已搁置"|"已拒绝", "成交价_cents"?: int, "成交价_currency"?: str }`
- 状态机：None → 议价中；议价中 → {已达成/已搁置/已拒绝}；已搁置 → {议价中/已拒绝}；已达成/已拒绝 = 终态
- 校验：白名单 + 状态机 + 用户必须是会话双方之一（发起方或对方 agent 拥有者）
- 写一条 `是否系统消息=True` 的 ConversationMessage（"🤝 谈判进入议价中" / "✅ 谈判已达成 · 成交价 ¥5,000" 等）
- 推送 SSE `negotiation_updated` 给双方 agent

### 4) 列表 API 增强（GET /api/conversations）
- 现在同时返回「我作为发起方」+「我作为对方 agent 拥有者」的两类对话（去重合并）
- 响应增加：`谈判状态` / `成交价_cents` / `成交价_currency` / `最后消息预览` / `最后消息时间` / `未读数`（暂为 0）
- 单段对话 + 追加消息接口同步支持双向（之前只允许发起方）

### 5) SSE 新事件类型
```
event: negotiation_updated
data: {"类型":"negotiation_updated","数据":{"conversation_id":"...","新状态":"已达成","成交价_cents":500000,"成交价_currency":"CNY","系统消息":{"id":"...","内容":"✅ 谈判已达成 · 成交价 ¥5,000","时间":"..."}}}
```
路由_接入.py 的 manifest 说明文案同步加上新事件名。

## 前端改动

### 1) api.ts（src/app/data/api.ts）
- 类型 `对话` 加：`谈判状态` / `成交价_cents` / `成交价_currency` / `最后消息预览` / `最后消息时间` / `未读数`
- 类型 `对话消息` 加：`是否系统消息`
- 新函数 `更新谈判进度(对话id, { 状态, 成交价_cents?, 成交价_currency? })` → PATCH 路由

### 2) DirectMessageModal（src/app/components/DirectMessageModal.tsx · 完整重写）
- 进入 modal：若有 `existingConversationId` → 拿对话；否则 `发起对话` (对方=apiPost.author_agent_id, 关联帖子=apiPost.id)
- 发送 → POST /api/conversations/{id}/messages
- 错误状态：未登录 / 对方未绑 Agent → 显示橙底提示；输入区 disabled
- 复用 chat 组件（MessageBubble / TypingIndicator / ChatInput）
- 系统消息（是否系统消息=true）渲染成系统横条

### 3) AgentNegotiateModal（src/app/components/AgentNegotiateModal.tsx · 完整重写）
- briefing 阶段保留（用户填指令）；点「启动 Agent」→ active
- active 阶段：发起对话 + 自动 PATCH 进入「议价中」；之后 chip 显示真实谈判状态
- 谈判按钮区（议价中显示）：
  - 💰 接受报价 → PATCH 已达成（沿用当前成交价或不带）
  - 🤝 提议成交价 → 弹小 dialog 让用户填金额（数字 input） → PATCH 已达成 + 成交价
  - ⏸ 暂停谈判 → PATCH 已搁置
  - ❌ 拒绝 → PATCH 已拒绝
- 终态显示「谈判已结束（已达成/已拒绝）」横条；输入区仍可继续聊但状态不再变
- 报价 dialog 的金额校验：非数字或 ≤0 → 显示「请填写成交价」

### 4) MessagesPage（src/app/pages/MessagesPage.tsx · 完整重写）
- 进入页面 → `列对话()` 拉所有会话；切换会话 → `拿对话(id)` 拉详情
- 左侧：会话列表（头像 + agent badge + 对方名 + 最后消息预览 + 谈判状态 chip + 关联帖子标题截短）
- 右侧：标准 chat UI（chat 组件）+ 谈判按钮区（议价中显示「接受报价 / 暂停 / 拒绝」）
- 谈判按钮直接 PATCH，错误显示在标题下橙条
- 未登录直接显示「请先登录后查看消息」中央提示
- 系统消息（谈判状态变更）渲染成系统横条

## e2e 验证

### 后端 curl 真实样本
```
SESSION=<已登录 jh@test.com>
CONV=7ffdc2fc78b94e2e856348e4022b5a86

# STEP 1: None → 议价中
PATCH /api/conversations/{CONV}/谈判进度 {"状态":"议价中"}
→ 200; 谈判状态=议价中  系统消息="🤝 谈判进入议价中"  是否系统=True

# STEP 2: 议价中 → 已达成 ¥5000
PATCH /api/conversations/{CONV}/谈判进度 {"状态":"已达成","成交价_cents":500000,"成交价_currency":"CNY"}
→ 200; 谈判状态=已达成  成交价=500000  系统消息="✅ 谈判已达成 · 成交价 ¥5,000"  是否系统=True

# STEP 3: GET /api/conversations 列表预览同步刷新
→ id=7ffdc2fc 谈判=已达成 成交价=500000 预览="✅ 谈判已达成 · 成交价 ¥5,000"

# 状态机违规：已达成 → 议价中 拒绝
PATCH .../谈判进度 {"状态":"议价中"} → 400 "不允许从「已达成」转移到「议价中」"

# 白名单违规：非法状态名拒绝
PATCH .../谈判进度 {"状态":"瞎写"} → 400 "非法谈判状态：瞎写"
```

### Server 健康
- uvicorn auto-reload 干净（`/private/tmp/cb-backend.log`）；migrate 成功（`迁移完成`）
- vite HMR 干净（`/private/tmp/clawbulletin-vite.log`）；3 个改动文件 page reload 无 transform error
- 模块通过 vite GET 200，esbuild transform 无报错

## 已知问题 / 边界

1. **未实现 read_at** — 对话消息没有「已读」标记，`未读数` 统一返回 0；后续可补 read_at + 路由
2. **SSE 浏览器侧消费** — 后端推送 negotiation_updated 已实现，但前端 EventSource 订阅暂未接入
   （前端 PATCH 后直接拿 PATCH 响应刷新本地状态，没走 SSE）。多窗口同步、对方实时看到状态变更需要前端再加一层 SSE 监听
3. **DirectMessageModal 仍依赖 Post 入口** — 严格的"用户 ↔ 用户私信不绑帖子"路径目前用 conversations.关联帖子_id=null，
   但当前 modal 接口要求 `post: Post`。要做"从用户 profile 直接私信"需新加调用入口（不在本任务范围）
4. **没有为新代码写单元测试** — 状态机转移规则在 `_状态机` dict 里集中；后续值得补一份覆盖所有合法/非法 transition 的 pytest
5. **浏览器 UI 截图验证未做** — Playwright 验证下次 dev loop 加

## 给主 agent 的下一步建议

1. 浏览器侧 SSE 接入：MessagesPage 加 EventSource 订阅 `negotiation_updated` + `message_received`，让对方变更状态时本侧立即看到
2. 加单测：`tests/unit/test_谈判状态机.py` 覆盖 _状态机 + PATCH 权限（双向）+ 系统消息生成文案
3. 「从用户 profile 直接私信」入口：在 ProfilePage 加按钮 → 起 `关联帖子_id=null` 的 conversation
4. read_at + 未读数 真实化：需要新表或往 conversation_messages 加 read_by 字段；然后 GET /api/conversations 算未读数
