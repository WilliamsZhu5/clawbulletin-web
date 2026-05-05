# A-Compose（A3 模式）— 用户的 Agent 协助起草帖子

日期：2026-05-01
状态：PASS

## 目标

把发帖体验从"用户自己写完整 form"升级为「用户跟自己 Agent 描述想发什么 → Agent 起草 → 用户审核 / 改 / 发布」。同时保留 A2（用户直接手填）模式作为兜底入口。

## 后端改动

### 新增路由：`POST /api/posts/起草`

文件：`/Users/zhujiahao/clawbulletin-backend/app/路由_帖子.py`
- 函数：`起草(...)`（FastAPI 路由）
- 业务函数：`调LLM起草(用户描述, agent名) -> 起草响应`
- 鉴权：复用既有 `鉴定发起者(...)`，需要登录或 X-Agent-Token
- 选 agent：当前用户最新创建的 native agent 当"起草员"
- LLM：OpenAI 兼容协议（SiliconFlow），`POST /chat/completions`，`response_format=json_object`
- 超时 30 秒；`max_tokens=800`、`temperature=0.4`
- 错误处理：超时 → 504；网络错 → 502；非 2xx → 502；JSON 解析失败 → 502；**无 bare except**
- category 白名单兜底（不在 `CATEGORY_VALID` 集合就退回 `projects`）

请求体：
```json
{ "用户描述": "我想招翻译，把 200 页英文手册翻成中文，预算 5000 元" }
```
响应体：与 `发帖请求` 字段对齐的草稿 JSON，**不入库**。

### 配置扩展

文件：`/Users/zhujiahao/clawbulletin-backend/app/配置.py`
- 新增 `代调LLM地址` / `代调LLM密钥` / `代调LLM默认模型`（pydantic-settings 自动从 `.env` 读）
- 顺手把 `localhost:5173` / `127.0.0.1:5173` 加进 CORS 允许列表（前端 Vite dev server 端口）

### 既有 `POST /api/posts` 完全不动（向后兼容验证 PASS）

## 前端改动

### `/Users/zhujiahao/Clawbulletin/src/app/data/api.ts`
- 新增 `agent起草(用户描述: string): Promise<帖子草稿>`
- 新增类型 `帖子草稿`
- 路径中文段用 `encodeURI("/api/posts/起草")` 编码

### `/Users/zhujiahao/Clawbulletin/src/app/pages/CreatePostPage.tsx`
- 新增 `mode` 状态：`'compose' | 'editor'`，默认 `compose`
- `compose` 模式：单页大 textarea + 「让 Agent 起草」/「跳过 Agent，自己写」按钮 + 起草中/错误状态
- 起草成功 → 把 LLM 草稿映射进既有 `FormState`（含 category/subcategory/title/body/tags/location/compensation）→ `setMode('editor')` + `setStep(2)`，跳过选分类直接落到"填详情"让用户审核
- editor 模式顶部加紫色提示带「这份草稿由你的 Agent 起草」+「让 Agent 重新起草」按钮
- "取消"按钮在 agent 起草后变成「回到 Agent 起草」
- 「跳过 Agent，自己写」直接进 editor + step=1，走原 4 步流程（A2 模式不变）
- 发布按钮文案改成「发布帖子」
- 发布成功页"再发一条"会重置回 `compose` 模式

### UI 文案（全中文，符合全局规则）
- 「告诉你的 Agent 你想发什么帖子」
- 「让 Agent 起草」/「Agent 正在起草…」
- 「跳过 Agent，自己写」
- 「让 Agent 重新起草」/「回到 Agent 起草」
- 「发布帖子」
- 错误：「Agent 起草失败：<detail>」/「请先描述你想发什么帖子」

## e2e 真实样本（证明非 mock）

**用例 1（jobs 类）**
- 用户描述：「我想招一位中英翻译，把 200 页用户手册（关于一款工业相机）翻成中文，预算 5000 元，可远程，希望两周内交稿。」
- Agent 起草 title：「招聘中英翻译处理200页工业相机用户手册」
- category：`jobs`，price_cents：`500000` CNY，tags：`["翻译","工业相机","技术文档","远程工作","兼职"]`
- body 摘要：「需要将一款工业相机的英文用户手册（共200页）翻译成中文…预算5000元人民币，支持远程工作，希望能在两周内完成交付…」

**用例 2（marketplace 类）**
- 用户描述：「我转一张三星 27 寸 4K 显示器，9 成新，2024 年买的，原价 4500，现在卖 2800，自取北京海淀。」
- Agent 起草 title：「转三星 27 寸 4K 显示器，9 成新」
- category：`marketplace`，price_cents：`280000` CNY，location_text：`北京海淀`
- body 摘要：「2024 年购入的三星 27 寸 4K 显示器…原价 4500 元，现 2800 元出。北京海淀区自取，可现场验货。」

LLM 调用次数：2 次（均成功，单次 ~3-6 秒）

**回归验证**：用起草后的草稿调原 `POST /api/posts`，成功创建帖子（id `7df48e2f9b834ac8b2f62767a3b36c32`），原通路未破坏。

## Vite + uvicorn 状态

- uvicorn `--reload`：启动干净，新路由 `POST /api/posts/起草` 已在 `/openapi.json` 注册
- vite build（生产构建）：✅ 1644 modules transformed，无 TS / 编译错误，1.58s 完成
- vite dev（5173）：仍在跑，HTTP 200

## 已知问题 / 限制

1. **未做 npm typescript 严格校验**：项目没装 typescript（vite 用 esbuild 转译），新代码靠 `vite build` 验证。如果以后开 strict TS check 可能需要补类型。
2. **agent 起草 prompt 没注入用户已有偏好**：当前 prompt 只看用户当次描述，没有读用户历史帖子或 user.bio。后续可在 prompt 里加 owner_profile 摘要。
3. **未做单元测试**：本轮按"自动模式 + 不走完整 10 步"的方式实现。后续走主流程时需要 tester sub-agent 把 LLM 调用 mock 掉测路径覆盖。
4. **CORS 列表手动加 5173**：长期方案应该走环境变量配置，但本轮没动 `.env` 范式。
5. **未实现两栏布局**：任务给出"两栏 / 两步式"两个候选——选了**两步式**（compose intro → editor），mobile-first 更友好；纯两栏在小屏会很挤。

## 给主 agent 的下一步建议

把 `agent起草` 复用进对话场景（A-Conv sub-agent 完工后）：在用户对一条帖子发起对话时，让访客的 agent 用同样模式起草初始消息。同时给 native agent 一个"个性化设定"字段（比如 user.ai_name/bio 注入 prompt），让起草更贴合用户语气。
