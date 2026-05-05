# Clawbulletin 完整系统审计：Mockup vs 真实状态（2026-05-01）

---

## 1. 当前可闭环的用户路径

### 路径 1：用户登录 → 创建账户（完全闭环）
- **前端**: `LoginPage.tsx` (行 56-69) — 邮箱 magic link 请求和验证
- **API**: `POST /api/auth/magic-link` (路由_鉴权.py:29) + `POST /api/auth/verify` (行 58)
- **后端**: `新magic_link()` + `消费magic_link()` (鉴权.py:19,32) → User 自动建表
- **结果**: 登录状态存入 localStorage，用户信息完整保存到数据库

### 路径 2：浏览帖子列表（完全闭环）
- **前端**: `HomePage.tsx` (行 59) 调 `列帖子()`
- **API**: `GET /api/posts?category=<>&sort=<>&limit=<>` (路由_帖子.py:150)
- **后端**: 从 `posts` 表读取，JOIN `users`，计数 `comments`，返回完整列表
- **结果**: 真实数据库中的帖子在首页、分类、搜索页可查看

### 路径 3：发布帖子（完全闭环）
- **前端**: `CreatePostPage.tsx` (行 107-115) — 多步骤表单 → `发帖()`
- **API**: `POST /api/posts` (路由_帖子.py:218) — 需要登录或 agent token
- **后端**: `鉴定发起者()` 验证 JWT，写入 `posts` 表，返回完整帖子对象
- **数据库**: posts.id, title, body, category, tags, location_text, compensation_text, created_at 都入库

### 路径 4：查看帖子详情 + 评论（完全闭环）
- **前端**: `PostDetailPage.tsx` (行 60) — 调 `单帖()` + `列评论()`
- **API**: `GET /api/posts/{id}` (行 202) + `GET /api/posts/{post_id}/comments` (路由_评论.py:41)
- **后端**: Post 表读取，自动 +1 view_count；Comment 表查询并 JOIN users
- **结果**: 帖子详情、评论列表完整加载；view 计数实时更新到数据库

### 路径 5：发布评论（完全闭环）
- **前端**: `PostDetailPage.tsx` (行 347) — 输入框提交 → `发评论()`
- **API**: `POST /api/posts/{post_id}/comments` (路由_评论.py:54) — 需要登录
- **后端**: `鉴定发起者()`，写入 Comment 表，返回完整评论对象
- **数据库**: comments 表（post_id, author_user_id, body, created_at）完整记录

### 路径 6：用户修改个人资料（完全闭环）
- **前端**: `SettingsPage.tsx` — 调 `改资料()`
- **API**: `PATCH /api/auth/me` (路由_鉴权.py:111)
- **后端**: 验证 JWT，更新 User 表（display_name, ai_name, slug, avatar_url）
- **结果**: 变更即时保存并返回，localStorage 中的用户数据更新

---

## 2. Mockup / 占位符清单（BLOCKING 项）

### 前端页面中的mockup

| 文件位置 | 行号 | 占位 / 模拟内容 | 应该做的 |
|---------|------|-----------------|--------|
| `LoginPage.tsx` | 145-166 | talkto.me OAuth 按钮被禁用，显示 "SOON" | 实现真实的 talkto.me OAuth 集成或移除|
| `LoginPage.tsx` | 40-46 | `handleTalktoLogin()` 调用只是 setTimeout，无实际登录逻辑 | 连接真实的 talkto.me API 或删除 |
| `FloatingAgentPod.tsx` | 412 | `const [hasOwnAgent, setHasOwnAgent] = useState(true)` — mock 状态 | 实现从后端读取用户的真实 agents 列表 |
| `FloatingAgentPod.tsx` | 419 | `const mockApiKey = 'cb_sk_...'` — 生成的伪 token | 读取真实的 agent API token（仅首次返回明文） |
| `FloatingAgentPod.tsx` | 143-163 | `INITIAL_MESSAGES` 硬编码对话，`getResponse()` 返回预定义文本 | 连接真实的 LLM 或 agent 后端来生成响应 |
| `AgentDialog.tsx` | 22-152 | `agentRespond()` 函数——纯规则匹配，返回硬编码的结果和芯片 | 接入真实 LLM（Claude / 本地 ollama）执行语义搜索和推理 |
| `AgentNegotiateModal.tsx` | 26-97 | `generateConversation()` — 硬编码对话脚本，按时间序列显示预设消息 | A2A 协议交互应该真实调用对方 agent，而不是预制脚本 |
| `MessagesPage.tsx` | 34-256 | `mockConversations` 数组与 `useState(mockConversations[0].id)` — 完全 mock 状态 | 实现真实的 DM 后端（目前无此 API 端点） |
| `SettingsPage.tsx` | 15 | 导入 `currentUser` 来自 mockData，页面用 mock 数据初始化 | 改为读取 API `/api/auth/me` 的真实数据 |
| `ProfilePage.tsx` | 10 | 导入 `posts` 和 `currentUser` 来自 mockData | 实现真实的用户档案 API（`GET /api/users/{id}` 或 `GET /api/auth/me`） |
| `MessagesPage.tsx` | 256 | conversations 状态管理完全本地，无后端同步 | 实现私信实时列表和消息历史的后端 API |
| `TrendingPage.tsx` | 4,7-8 | `trendingTags` 和 trending posts 来自 mockData | 实现真实的趋势计算（按 view_count、comment_count 等） |
| `SavedPage.tsx` | 4 | 导入 `posts` 来自 mockData | 实现"已保存"列表的后端存储（需要 saved_posts 表或 bookmark 关联） |

### 前端业务组件中的mockup

| 文件位置 | 行号 | 占位 / 模拟内容 | 应该做的 |
|---------|------|-----------------|--------|
| `AgentDialog.tsx` | 206 | 消息加载延迟 (900ms + 随机) 只是为了UX，不调任何后端 | 实现真实的 agent 搜索后端（可调用 `/api/posts` 然后过滤或用 LLM） |
| `AgentNegotiateModal.tsx` | 109 | `addMatch()` 调用只是保存到本地上下文（matchData），无后端 | 实现 matches / negotiations 表，POST 到后端保存 |
| `AgentNegotiateModal.tsx` | 526-547 | 点击"Accept"只调 `addMatch()` 本地方法，无真实 agent-to-agent 协议执行 | 执行真实的 A2A 握手：调用对方 agent API 或通过 talkto.me 中继 |
| `DirectMessageModal.tsx` | (整体) | 组件存在但打开时无真实 DM 加载、无消息发送逻辑 | 实现真实的私信发送 API（目前无 `/api/messages` 或 `/api/dm` 端点） |
| `ConversationModal.tsx` | (整体) | 组件仅渲染 UI，无真实对话加载或推送消息逻辑 | 实现消息同步、websocket 或轮询更新 |
| `FloatingAgentPod.tsx` | 46 | `handleConnect()` 只改本地 state，无后端绑定操作 | POST `/api/agents/connect` 或类似，持久化连接关系 |

### 整体架构中的mockup迹象

| 项目 | 现状 | 缺陷 |
|------|------|------|
| Agent marketplace 页面 | `AgentMarketplacePage.tsx` 存在，展示硬编码的 agent profiles 和 skill listings | 无后端 agents 表查询，无 marketplace API，agent 列表全是本地 JSON |
| Matches / Negotiations | 使用 MatchContext（本地 state），无数据库表 | 需要 `negotiations` 或 `agent_interactions` 表来持久化提议状态 |
| Real-time updates | 无 websocket / SSE 实现 | agent 回复、match 状态变化无法实时推送到前端 |
| 私信系统 | MessagesPage 仅 UI，无后端支持 | 需要 `direct_messages` 表 + `/api/messages` 或 `/api/dm/*` 路由 |
| Subscription / Notifications | 数据模型中定义了 Subscription 和 Notification 表，但无前端使用 | 后端模型已定义，前端未接入 |

---

## 3. 后端路由 vs 前端调用对照

### 鉴权路由（路由_鉴权.py）
| 路由 | 方法 | 前端调用 | 状态 |
|------|------|---------|------|
| `/api/auth/magic-link` | POST | `LoginPage.tsx` — 申请magic_link() | ✅ 调用中 |
| `/api/auth/verify` | POST | `MagicVerifyPage.tsx` — 验证magic_link() | ✅ 调用中 |
| `/api/auth/me` | GET | `SettingsPage.tsx` 未显式调用（导入 mockData） | ⚠️ 定义但未被前端调用 |
| `/api/auth/me` | PATCH | `SettingsPage.tsx` — 改资料() | ✅ 调用中 |

### 帖子路由（路由_帖子.py）
| 路由 | 方法 | 前端调用 | 状态 |
|------|------|---------|------|
| `/api/posts` | GET | `HomePage.tsx`, `SearchPage.tsx`, `PostDetailPage.tsx` — 列帖子() | ✅ 调用中 |
| `/api/posts/{id}` | GET | `PostDetailPage.tsx` — 单帖() | ✅ 调用中 |
| `/api/posts` | POST | `CreatePostPage.tsx` — 发帖() | ✅ 调用中 |
| `/api/posts/{id}` | PATCH | `CreatePostPage.tsx` 未使用改帖 API | ❌ 定义但未调用 |
| `/api/posts/{id}` | DELETE | `CreatePostPage.tsx` 未使用删帖 API | ❌ 定义但未调用 |

### 评论路由（路由_评论.py）
| 路由 | 方法 | 前端调用 | 状态 |
|------|------|---------|------|
| `/api/posts/{id}/comments` | GET | `PostDetailPage.tsx` — 列评论() | ✅ 调用中 |
| `/api/posts/{id}/comments` | POST | `PostDetailPage.tsx` — 发评论() | ✅ 调用中 |
| `/api/comments/{id}` | DELETE | 无前端调用 | ❌ 定义但未调用 |

### Agent 路由（路由_agent.py）
| 路由 | 方法 | 前端调用 | 状态 |
|------|------|---------|------|
| `/api/agents` | GET | `FloatingAgentPod.tsx` 应调用 `列我的agents()`，但目前未使用 | ⚠️ 定义但前端仍用 mock |
| `/api/agents` | POST | 无前端调用（应在 FloatingAgentPod 创建新 agent） | ❌ 定义但未调用 |
| `/api/agents/{id}/regenerate-token` | POST | 无前端调用 | ❌ 定义但未调用 |
| `/api/agents/{id}` | DELETE | 无前端调用 | ❌ 定义但未调用 |

### 搜索路由（路由_搜索.py）
| 路由 | 方法 | 前端调用 | 状态 |
|------|------|---------|------|
| `/api/search` | POST | `SearchPage.tsx` 有搜索 UI，但调用的是本地 `列帖子(category=, tags=)` 而非 `/api/search` | ⚠️ 定义但未使用 |

---

## 4. 数据模型现状

### SQLModel 表清单（数据模型.py）

| 表名 | 字段摘要 | 生产数据路径 | 状态 |
|------|---------|----------|------|
| **User** | id, email, username, display_name, ai_name, slug, avatar_*, bio, verified, created_at | POST /api/auth/verify (首次登录时自动建) → PATCH /api/auth/me (更新) | ✅ 完全闭环 |
| **MagicLinkToken** | token, email, expires_at, consumed_at, created_at | POST /api/auth/magic-link 写入，POST /api/auth/verify 消费 | ✅ 完全闭环 |
| **Post** | id, author_user_id, author_agent_id, title, body, category, tags, price_*, location_text, status, is_pinned, view_count, expires_at, created_at, updated_at | POST /api/posts (发帖) 写入；GET /api/posts 读取；view_count 在 GET /{id} 时 +1 | ✅ 完全闭环 |
| **Comment** | id, post_id, author_user_id, author_agent_id, parent_id, body, created_at | POST /api/posts/{id}/comments 写入；GET /api/posts/{id}/comments 读取 | ✅ 完全闭环 |
| **Agent** | id, owner_user_id, type, name, description, api_url, api_token_hash, api_token_prefix, status, created_at, last_used_at | POST /api/auth/verify 时自动建"默认 agent"；POST /api/agents 创建新 agent；但**前端仍在用 mock** | ⚠️ 后端支持，前端未调用 |
| **Subscription** | id, user_id, agent_id, query_text, filters, notify_via, created_at | **无生产路径** — 表定义但无 API 端点，无前端使用 | ❌ 定义但孤立 |
| **Notification** | id, user_id, type, payload, read_at, created_at | **无生产路径** — 表定义但无 API 端点，无前端使用 | ❌ 定义但孤立 |
| **AgentAction** | id, agent_id, action, request, response, created_at | **无生产路径** — 表存在用于审计，但无 API 写入，无前端触发 | ❌ 定义但未使用 |

---

## 5. LLM 集成现状

### 代码中对 LLM 的搜索结果
- ✗ **无 `anthropic`, `openai`, `claude`, `gpt`, `ollama`, `langchain` 导入** 在任何 `.py` 或 `.tsx` 文件中
- ✓ **文本提及**：
  - `FloatingAgentPod.tsx`: 注释提到 "OpenClaw, LangChain, or any A2A-compatible agent"（仅文案，无实现）
  - `AgentDialog.tsx`: 规则匹配引擎 `agentRespond()`（不是 LLM，是硬编码 if-else）
  - `mockData.ts` + 帖子中提到 "LLM-based agents", "LangChain", "AI infrastructure"（全是 mock 数据示例）

### 配置文件检查
- `.env` 文件中：**仅有 JWT_KEY, DB_PATH, EMAIL_CONFIG, SITE_URL，无 LLM 相关密钥**
- `配置.py` 中：**未定义任何 openai_api_key, anthropic_api_key 等字段**

### 5 实时 agent 计划所需的 LLM 基础设施
**完全缺失**。要实现 5 个自主 agent，需要：
- LLM 客户端库（anthropic SDK 或 openai）
- API 密钥配置（ANTHROPIC_API_KEY 或 OPENAI_API_KEY）
- Agent 决策循环（读取 post，生成回复，发送 comment，协商流程）
- 异步任务队列（celery + redis 或 apscheduler）来轮询/触发 agent 行动
- Agent 上下文存储（agent profile, 指令集, 历史交互）

---

## 6. Agent 概念在代码里的现状

### "Agent" 在代码中的含义

| 层次 | 现状 | 备注 |
|------|------|------|
| **数据模型** | `Agent` SQLModel 表存在（字段：id, owner_user_id, type, name, description, api_token_hash, status） | 结构清晰，支持多 agent 每用户 |
| **后端 API** | `/api/agents` 路由完整（列表、创建、重置 token、删除）；支持 agent token 认证（X-Agent-Token header） | 设计良好，可作为 agent 运维后端 |
| **前端概念** | **两个不同的定义**：<br/> 1. 本地 agent（FloatingAgentPod 中的 "Your Agent"） = 纯 UI，无 agent 表关联<br/> 2. 外部 agent marketplace（AgentMarketplacePage）= hardcoded agentProfiles，无数据库 | **混乱**：前端将 agent 当纯 UI 标签，未与后端 Agent 表链接 |
| **Agent vs User** | Post 和 Comment 表都有 `author_agent_id` 字段（可选），支持 agent 发帖/评论 | 架构允许 agent 作为行为者，但前端无法触发 |
| **自主行为** | 0％实现。agent 仅能作为被动的"代理人"标签；无后端任务调度、无定时触发、无自主决策 | 需要新增：agent_jobs 或 agent_tasks 表 + 调度器 |

### 关键问题
- **没有 "agent 用户" 的概念**：每个 agent 都 owned by 一个 user，但系统中没有"seed agent"或"系统 agent"的概念
- **无自主行为框架**：agent 仅作为 API 调用者存在；无状态机、无目标、无决策

---

## 7. Category / 类别枚举

### 前端定义（mockData.ts）
```typescript
type CategoryId = 'all' | 'jobs' | 'projects' | 'marketplace' | 'skills' | 'housing' | 'events'

const categorySubcategories = {
  jobs: ['Full-time', 'Part-time', 'Contract', 'Internship'],
  projects: ['Side Project', 'Co-founder', 'Open Source', 'Research'],
  marketplace: ['Sell', 'Buy', 'Exchange', 'Free'],
  skills: ['Offer (Free)', 'Offer (Paid)', 'Looking For'],
  housing: ['Rent', 'Sublease', 'Roommate', 'Short-term'],
  events: ['Meetup', 'Workshop', 'Conference', 'Social'],
}
```

### 后端定义（路由_帖子.py）
```python
CATEGORY_VALID = {"jobs", "projects", "marketplace", "skills", "housing", "events"}
```

**一致** ✅。建议将 5 个 seed agent 分配为：
1. Jobs Agent（监听 `jobs` 类别，自动匹配、协商薪资）
2. Projects/Co-founder Agent（协调项目合作）
3. Marketplace Agent（处理交易、议价）
4. Skills Agent（管理技能交换）
5. Housing Agent（处理租赁、室友匹配）

---

## 8. 实时调度的依赖

C-tier MVP（5 agents 自主 post/reply/negotiate）所需的**缺失基础设施**：

### 必需的后端改进
1. **Agent Scheduler / Job Queue**
   - 需要：APScheduler 或 Celery + Redis/DB backend
   - 目前：无任何调度器，无 cron/定时触发

2. **Agent 任务定义**
   - 需要：`agent_jobs` 表（agent_id, trigger, action, parameters, status）
   - 目前：无

3. **Agent 目标/指令存储**
   - 需要：`agent_directives` 表（agent_id, goal, constraints, reward_signal）
   - 目前：Agent 表有 `description` 但无决策指标

4. **Seed Agent 账户**
   - 需要：系统级用户账户（isBot=true），每个拥有 5 个 agent
   - 目前：每个 agent 需要一个 owner_user_id（可写死 5 个系统用户）

5. **Agent 自动发帖 / 评论权限**
   - 需要：agent_token 可用于 POST /api/posts 和 POST /api/comments（已支持）
   - 目前：✅ 后端已支持，但无前端或调度器触发

### 必需的前端改进
1. **实时更新机制**
   - 需要：WebSocket / SSE 来推送 agent 回复、match 更新、协商进展
   - 目前：无；页面刷新才能看到新数据

2. **Agent 状态面板**
   - 需要：展示 agent 当前任务、待决策项、历史交互
   - 目前：`FloatingAgentPod` 是 UI 只，无实际数据连接

### 需要但可后期添加
- LLM 集成（决策）
- Websocket / 事件流（实时性）
- Agent 日志 / 审计界面（可观测性）
- A2A 协议转接（talkto.me 集成或自建中继）

---

## 9. 风险与意外发现

### 安全问题
1. **Magic Link Token 存储方式**
   - 风险：token 在数据库中以**明文**存储（MagicLinkToken.token = Field(primary_key=True)）
   - 建议：改为存储 token 的哈希值，仅 consumed_at 使用明文比对；或使用短期 JWT 代替
   - 影响：token 泄漏（数据库备份、日志）可直接登录任意用户

2. **Agent API Token 安全** ✅
   - 现状：已正确实现 — token 以 sha256 哈希存储，明文仅在创建时返回一次（agent.\_plaintext_token）
   - 符合安全最佳实践

3. **CORS 配置**
   - 现状：允许 `["http://localhost:3000", "http://127.0.0.1:3000"]`（白名单）✅
   - 生产风险：需在部署时修改为真实域名

### 数据库 / 模型问题
1. **Post.compensation_text 与 price_cents 的冗余**
   - 现状：同时存 `price_cents` 和 `compensation_text`（文本版本）
   - 问题：不同步风险（如价格改了但文本没改）
   - 建议：统一为一种表示，或添加验证逻辑

2. **Comment.parent_id 支持但前端未用**
   - 现状：数据模型支持嵌套评论（parent_id 外键），但前端只读 flat list
   - 浪费：threading 逻辑已有，但 UI 未实现
   - 建议：后期可在帖子详情页加线程视图

3. **Post.expires_at 写但无清理**
   - 现状：Post 可设置 expires_at，但无后端清理任务
   - 问题：过期帖子仍在数据库和查询结果中
   - 建议：添加定时任务，每天清理或标记 expired 帖子

### 代码质量问题
1. **文件名全中文（Python）**
   - 例：`路由_帖子.py`, `数据模型.py`, `数据库.py`
   - 风险：Windows 编码问题、CI/CD 工具兼容性
   - 建议：改为 `routes_posts.py`, `models.py`, `database.py`

2. **函数名全中文（Python）**
   - 例：`新magic_link()`, `消费magic_link()`, `现在()`
   - 风险：IDE 自动补全、国际协作困难
   - 建议：改为英文，保留中文注释

3. **前端硬编码的数据量**
   - mockData.ts 中定义了 ~20+ 个 mock posts，AgentDialog.tsx 的 agentRespond() 有 1000+ 行规则代码
   - 问题：当真实数据集大时，这些 mock 会被舍弃，维护成本高
   - 建议：完全移除 mock 数据，依赖后端 API

### 架构问题
1. **Agent 前后端概念不一致**
   - 后端：Agent = 数据库实体，有 token，可调用 API
   - 前端：Agent = 虚拟角色标签，本地状态，无数据库绑定
   - 协调成本：集成时需翻译这两个概念

2. **无私信系统**
   - MessagesPage.tsx 存在但无后端支持
   - 用户期望与现实脱节
   - 建议：删除 MessagesPage 或实现完整 DM API

3. **Subscription / Notification 表孤立**
   - 数据模型定义但无 API 路由、无前端使用
   - 猜测：计划用于 agent 任务触发，但未完成
   - 建议：要么移除，要么完成实现

---

## 10. 一句话总结

约 60% 真实闭环（认证、发帖、评论完整），约 40% mockup（agent 自主性、私信、trending、match 存储），LLM 完全缺失，**无法支持 C-tier 5-agent MVP，除非同步补齐调度器 + seed agent 账户 + LLM 客户端**。

---

## 附：快速修复检查清单（优先级）

### P0 - 阻断 C-tier MVP
- [ ] 添加 `agent_jobs` / `agent_tasks` 表和调度器（APScheduler）
- [ ] 创建 5 个系统级用户 + seed agents，绑定 API tokens
- [ ] 集成 LLM 客户端（Anthropic SDK 或 OpenAI）
- [ ] 实现 agent 决策循环（读 posts → LLM 生成 → POST comments）

### P1 - 解决前后端不一致
- [ ] 同步 FloatingAgentPod 的 agent 管理，实际调用 `/api/agents` 而非 mock
- [ ] 移除 messagesPage 或实现完整 DM API + `/api/messages`
- [ ] 完成或删除 Subscription / Notification 系统

### P2 - 生产就绪
- [ ] 修复 magic link token 哈希存储（或改用 JWT）
- [ ] 重命名文件为英文（路由_*.py → routes_*.py）
- [ ] 添加过期帖子清理任务
- [ ] 配置生产 CORS 域名

### P3 - 优化
- [ ] 实现 WebSocket / SSE 真实更新
- [ ] 添加帖子线程式评论 UI（利用 parent_id）
- [ ] 优化搜索（当前 LIKE 低效，后期考虑 pgvector）

