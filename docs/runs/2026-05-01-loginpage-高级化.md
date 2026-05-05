# LoginPage 高级化 — 2026-05-01

文件：`src/app/pages/LoginPage.tsx`（仅此一个文件，最小局部改动）

## 文案最终选用

- **Hero 主标题**：「Agent 在此<br />相遇。」
- **Hero 副标题**（极简动词列表）：
  > 一个开放的 Agent-to-Agent 网络。
  > 发布。对话。协商。达成。
- **FEATURES（4 项，icon 不变）**：
  1. `A2A 协议直连` / 通过 talkto.me 接入网络
  2. `Agent-first 身份` / 由你的 Agent 代为发声
  3. `身份可验证` / 由 talkto.me 背书
  4. `上下文持续在线` / 跨会话保持记忆
- **底部 status indicator**（克制单行）：`847 Agent · talkto.me A2A · live` + 绿点 pulse 保留
- **表单标题**：`登录 Bulletin`（保留，字号 22→26、letter-spacing -0.025em）
- **表单副文案**（替换啰嗦版）：`输入邮箱以接收登录链接。`
- **Magic-sent / talkto-verify 步骤**：未改动文案（按上下文，这两步是流程态、信息密度合理）

## 视觉升级摘要

- **左侧 hero 渐变减重**：`#4F46E5 → #6D28D9 → #1E0A3C`（亮紫铺满）改为 `#1A1339 → #2A1B5E → #100828`（深紫黑底）。紫色作为右上角 radial 光晕（`rgba(124,58,237,0.28)` → 0%）做氛围，不是 hero block。padding 12 → 56px，宽度 440 → 460px。
- **Typography 精算**：hero 主 28 → 40px / weight 800 → 700 / letter-spacing -0.03em → -0.04em / line-height 1.25 → 1.05；副 14px / opacity 0.45 → 0.55 / line-height 1.7 → 1.6 / 限宽 320px。FEATURES label weight 600 → 500、letter-spacing -0.005em；sub opacity 0.35 → 0.4。表单 input fontSize 13 → 14px、border `rgba(0,0,0,0.12)` → `#EBEBE7`。
- **FEATURES icon 减重**：容器 32×32 → 28×28，背景从紫色 `rgba(79,70,229,0.15)` 改成中性 `rgba(255,255,255,0.04)`，stroke-width 1.75 → 1.5，icon 颜色 `#818CF8` → `#A78BFA`（更柔）。
- **主 CTA 按钮**：渐变换为竖直 `linear-gradient(180deg, #5B52ED 0%, #4F46E5 100%)` + `inset 0 1px 0 rgba(255,255,255,0.16)`（顶部反光）；hover translateY(-1px) + shadow 渐变；不用 scale。
- **talkto.me 占位按钮**：紫色降到 `rgba(79,70,229,0.04)` 背景 + `rgba(79,70,229,0.14)` 边框，weight 600 → 500，去掉左侧 talkto.me 紫胶囊（视觉过重），改成 Radio icon + label + 「即将推出」灰胶囊 right-align。
- **input focus**：紫色 ring 透明度 `0.1 → 0.08`（更淡），加 `transition 180ms ease-out`。
- **字体 stack**：`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "PingFang SC", "Helvetica Neue", "Source Han Sans CN", "Microsoft YaHei", system-ui, sans-serif`。**无 serif fallback**，中文走 PingFang SC。
- **间距重排**：副标题→FEATURES 间距 36 → 64px；FEATURES 各项 gap 16 → 20px；表单整体 max-width 400 → 380px、上下 padding 48 → 64px；Heading mb 32 → 36px。

## 微互动（用 motion/react，已在依赖里）

- Logo / Hero 主 / Hero 副 / FEATURES 4 项 / 底部 status 各自 `initial → animate` 入场（opacity + translateY），ease `[0.16, 1, 0.3, 1]`（exponential ease-out）。
- Stagger：hero 主 50ms → hero 副 180ms → FEATURES 320ms 起步 + 80ms 间隔 → status 700ms。整体 ~1.2s 完整入场。
- 主 CTA 按钮 hover：translateY(-1px) + shadow 加深，180ms ease-out。不用 scale。
- 「← 不登录」链接 hover：色阶 `#888882 → #4F46E5`，150ms。
- input focus：border + 3px ring 紫色，transition 180ms。
- 绿点 pulse 保留（Tailwind `animate-pulse`）。

## 改动量

- 字符段（语义改动）：6 段（hero 主 / hero 副 / 4 FEATURES label+sub / status / 表单副 / 表单标题保留）。
- inline style 改动：约 30 处（左 hero 整体重写、右 form 主体重写、talkto-verify / magic-sent 两步保持原样）。
- 文件总 inline style 数：62 处（之前约 50）。
- 行数：377 → 487（+110，主要来自 motion 包裹 + style props 拆多行）。
- 不变：`mode/step/email/talktoHandle/loading/...` 全部 state、`handleEmailSubmit/拼上redirect/是否合法redirect` 全部 handler、redirect open-redirect 防护注释、talkto-verify / magic-sent 两个 step 的内部 UI（仅作为 secondary flow，避免破坏）。

## 已知问题 / 跳过项

- **截图**：本机未装 Playwright/playwright-core，按指令跳过 docs/runs/*.png。手测建议在 Mac 浏览器 dev MCP 拍。
- **a11y contrast**：深紫黑底上副标题 `rgba(255,255,255,0.55)` ≈ ~2.8:1（WCAG AA 大字 OK），FEATURES sub `rgba(255,255,255,0.4)` 对比度偏低，风格优先；如有强可读性诉求可提到 0.5。
- **移动端**：左侧 hero `hidden lg:flex`，移动端只剩右侧 form + 顶部 mobile logo（已升级为 weight 600、size 7×7、stroke 2.0）。未实测真机但布局未破坏原 mobile 单栏路径。
- **暗色 fallback**：当前页面只走 light theme（背景 `#FAFAF7`），不依赖 prefers-color-scheme。
- **`Eye/EyeOff/ArrowRight/Bot/talktoLoading/handleTalktoLogin/mode/setMode/password/username/setPassword/setUsername/showPass/setShowPass` 等未使用 import / state**：原文件已存在的死代码，未清理（不在本任务边界）。
- **talkto-verify 步骤**：内部样式（hero block、握手按钮 transform scale gradient）暂未与新 hero 风格对齐，主因是这一步是 secondary flow、改动会扩大风险面；可作为下一轮目标。

## 给主 agent 的下一步

- 浏览器肉眼验证 http://localhost:5173/login（桌面 + 移动 viewport），关注：左侧深紫黑、字号、入场 stagger、按钮 hover、中文非衬线。
- 若觉得 hero 主标题"Agent 在此相遇。"还想 fuse 别的版本（如「Agent 在此相通」/「Agent 之间，公开通讯」），单行改即可。
- 后续 talkto-verify / magic-sent 两个步骤可对齐新风格（按钮 inset highlight、input border `#EBEBE7`、字号 13 → 14）。
