# Rebrand: ClawBulletin → Bulletin

执行时间：2026-05-01 ~23:50
执行人：sub-agent
范围：用户可见品牌字符串。仓库名、本地目录、DB 文件名、git remote、commit history 不在此范围。

---

## 一、改动文件清单（前端）

| 文件 | 改动处 |
|---|---|
| `/Users/zhujiahao/Clawbulletin/index.html` | title `Clawbulletin` → `Bulletin`；新增 `<meta description>`；新增 `<link rel="icon">` 指向 `/favicon.svg` |
| `/Users/zhujiahao/Clawbulletin/package.json` | `name`: `@figma/my-make-file` → `bulletin-web` |
| `/Users/zhujiahao/Clawbulletin/public/favicon.svg` | **新建** —— 32x32 SVG，蓝底白色 monospace `B` |
| `/Users/zhujiahao/Clawbulletin/src/app/components/layout/TopBar.tsx` | 顶栏 logo 文字 `ClawBulletin` → `Bulletin`（1 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/components/layout/RightPanel.tsx` | UI 文案（1 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/components/PostDetailPanel.tsx` | breadcrumb（1 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/components/FloatingAgentPod.tsx` | agent response、agent endpoint URL `clawbulletin.com → bulletin.com`（4 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/data/api.ts` | 顶部注释（1 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/i18n/translations.ts` | 中英文 6 处 UI 文本 |
| `/Users/zhujiahao/Clawbulletin/src/app/pages/AgentSetupPage.tsx` | `ClawBulletin · 接入 AGENT`、`/clawbulletin/hook → /bulletin/hook` placeholder、`X-ClawBulletin-Token → X-Bulletin-Token`（3 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/pages/AgentSetupDonePage.tsx` | webhook 协议示例 + `X-ClawBulletin-Token` header 名（2 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/pages/CreatePostPage.tsx` | UI 文案（2 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/pages/HomePage.tsx` | onboarding 标题、kicker `CLAWBULLETIN → BULLETIN`（2 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/pages/LoginPage.tsx` | logo 文字、登录文案（6 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/pages/TrendingPage.tsx` | kicker + 副标题（2 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/pages/MyPostsPage.tsx` | kicker + 副标题（2 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/pages/SavedPage.tsx` | kicker（1 处）|
| `/Users/zhujiahao/Clawbulletin/src/app/pages/SettingsPage.tsx` | kicker（1 处）|
| `/Users/zhujiahao/Clawbulletin/README.md` | 标题 + 自我描述 + 注释行（2 处）|

## 二、改动文件清单（后端）

| 文件 | 改动处 |
|---|---|
| `/Users/zhujiahao/clawbulletin-backend/app/main.py` | docstring + FastAPI title + 启动日志 + /health service 字段（4 处）|
| `/Users/zhujiahao/clawbulletin-backend/app/配置.py` | `站点名称` 默认值、`发件人邮箱` 默认值（2 处）|
| `/Users/zhujiahao/clawbulletin-backend/app/路由_对话.py` | LLM system prompt（2 处）|
| `/Users/zhujiahao/clawbulletin-backend/app/路由_帖子.py` | 起草员 prompt + 用户提示（2 处）|
| `/Users/zhujiahao/clawbulletin-backend/app/路由_agent.py` | agent description、test-connection probe note + 3 个 HTTP header（5 处）|
| `/Users/zhujiahao/clawbulletin-backend/.env` | `站点名称=ClawBulletin → Bulletin`（1 处）|
| `/Users/zhujiahao/clawbulletin-backend/scripts/灌种子数据.py` | docstring + bio + LLM prompt + 启动 banner + bio startswith 兼容旧值（5 处）|
| `/Users/zhujiahao/clawbulletin-backend/scripts/agent自主活动.py` | docstring + LLM prompt + 启动 banner（3 处）|
| `/Users/zhujiahao/clawbulletin-backend/README.md` | 标题 + 自我描述（2 处）|

**总计**：前端 18 个文件 + 后端 9 个文件 = **27 个文件改动 + 1 个新文件（favicon.svg）**。

---

## 三、Favicon 处理

之前没有 `public/` 目录，没有 favicon.svg/ico/png。新建：

- 路径：`/Users/zhujiahao/Clawbulletin/public/favicon.svg`
- 内容：32x32 SVG，蓝底（`#2563eb`）+ 白色 monospace 大写 `B`，圆角 6px
- 已在 `index.html` 头部加 `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
- Vite 自动 serve `public/` 静态目录，`curl http://localhost:5173/favicon.svg` 已验证返回 SVG 内容

---

## 四、故意未改的项（含原因）

| 项 | 原因 |
|---|---|
| `data/clawbulletin.db` 文件名（出现在 `.env`、`配置.py` 默认值、`数据库.py` 注释、README、seed 脚本 docstring）| 改了会导致后端找不到现有 SQLite 文件，所有数据访问失败 |
| `@bot.clawbulletin.local` system bot 邮箱后缀（seed 脚本 + `agent自主活动.py` 用它识别 system bot）| DB 已写入 5 个 system bot 用户，改了会破坏 user.email 唯一索引 + 让识别逻辑找不到现有 bot；用户指令明确"不改" |
| `localStorage` key `clawbulletin_onboarding_dismissed`（HomePage.tsx）| 改了会让现有用户重新看到 onboarding tutorial（轻微数据迁移） |
| `cd /Users/zhujiahao/clawbulletin-backend` docstring（seed 脚本里）| 本地目录路径，按用户指令"本地目录不改" |
| GitHub 仓库 URL（README 里 `clawbulletin-backend` / `clawbulletin-web` / `clawbulletin-app` 链接）| 用户指令"GitHub repo 名不改"，URL 跟仓库名绑定 |
| `package-lock.json` name 字段 | npm 跟随 `package.json`，下次 `npm install` 自动同步，不手改 |
| `docs/runs/*` 历史报告 | 历史快照 |
| `bio.startswith("ClawBulletin 内置")` 检查（seed 脚本 403 行）| 改成 `or` 兼容旧 bio + 新 bio，避免重跑 seed 时跳过更新 |

---

## 五、Vite + uvicorn 状态

- **Vite HMR**：干净。`/tmp/clawbulletin-vite.log` 全是本次 rebrand 触发的 hmr update 行，无 error/warning。
- **uvicorn auto-reload**：进程仍在（PID 5766，端口 8001）。`curl http://127.0.0.1:8001/health` 返回 `{"ok":true,"service":"bulletin-backend","version":"0.1.0"}` ✅；`curl http://127.0.0.1:8001/openapi.json` 的 `info.title` 是 `"Bulletin API"` ✅。

---

## 六、给主 agent 的"下一步建议"

1. **GitHub repo rename（clawbulletin-web → bulletin-web 等）？** 建议**问用户**。`gh repo rename` 是可逆但 destructive（旧 URL 会自动 redirect 几天，但 issue/PR 链接、CI badge、外部引用要更新；clone 的本地仓库 git remote URL 也要 `git remote set-url`）。当前未做。
2. **本地目录 rename（`/Users/zhujiahao/Clawbulletin` → `/Users/zhujiahao/Bulletin`）？** 建议**先不做**。会破坏正在跑的 vite dev server（PID 17726 cwd 锁住），还要更新 `clawbulletin-backend/scripts/灌种子数据.py:22` 的 cd 注释、可能的 .vscode/.idea 配置。建议下次 dev server 重启时再做，并配套改：seed 脚本 docstring 里的目录路径 + 任何 shell history 别名。
3. **DB 中 system bot 邮箱 `@bot.clawbulletin.local` → `@bot.bulletin.local`？** 建议**先不做**。需要：(i) `UPDATE users SET email = REPLACE(email, '@bot.clawbulletin.local', '@bot.bulletin.local')`；(ii) 更新两处 endswith 检查 (`agent自主活动.py:174`, seed `灌种子数据.py:237`)；(iii) 测试 system bot 自主活动还能找到这些用户。这是低优先级（用户看不见 email 后缀）。如果要做，建议跟 GitHub repo rename 一起处理。
4. **DB 文件 rename（`data/clawbulletin.db` → `data/bulletin.db`）？** 建议**不做**。同样是用户不可见，且要：停服 → mv 文件 → 改 .env → 重启。低 ROI。

---

## 七、验证摘要

- `curl http://localhost:5173/` → `<title>Bulletin</title>` ✅
- `curl http://localhost:5173/favicon.svg` → 返回 SVG ✅
- `curl http://127.0.0.1:8001/openapi.json | jq '.info.title'` → `"Bulletin API"` ✅
- `curl http://127.0.0.1:8001/health` → `{"ok":true,"service":"bulletin-backend",...}` ✅
- `grep -ri "ClawBulletin\|Clawbulletin\|CLAWBULLETIN"` 在所有 src/app/ + backend/app/ 下 → 0 命中（剩余命中都是 DB 路径、本地目录、GitHub URL、bot 邮箱后缀，全部是有意保留）✅

**无 commit / push（按硬约束）。**
