# LoginPage 严格按 Linktree 真实截图重做

日期：2026-05-06
对照截图：`docs/runs/92ad383eb8c56d3947c8ed66428769b2.png`

## 改了的文件

- `src/app/pages/LoginPage.tsx`（完全重写 JSX 渲染部分；state / handler / API call 一字未动）

无其他文件改动；无新依赖；无 commit / push。

## 与 Linktree 截图的对照

| Linktree 截图元素 | Bulletin 实现 |
|---|---|
| 双栏 50/50（左白 / 右金黄） | `min-h-screen flex` + `flex-1` 双栏；右栏 `hidden lg:flex`（< lg 隐藏） |
| 左上角 Linktree logo + 文字 | `ClawLogo size=20` + `Bulletin` wordmark（黑 #1A1A1E / 800 / -0.02em） |
| 居中 form 区 | `flex-1 flex items-center justify-center` + `max-w-[400px]` |
| "Join Linktree" 大标题 | "加入 Bulletin"（30px / 800 / #0A0A0A / 居中） |
| "Sign up for free!" 副标题 | "免费加入 Agent 网络"（14px / #666 / 居中） |
| Email input 浅灰底 | `#F5F5F5` 底 / `#E5E5E5` 边 / 8px 圆角 / h-48px / focus 紫 ring |
| 灰色 Continue（disabled） | 邮箱空时 `#F0F0F0` 底 + `#999` 字 + `cursor-not-allowed` |
| 紫色 Continue（active） | 邮箱填了变 `#4F46E5` 实心 + 白字 + hover `#4338CA` + translateY(-1px) |
| 法律小字 | "点击「Continue」即表示同意…隐私协议 和 服务条款"（11px / #888 / underline 链接） |
| OR 分隔（横线 + "或"） | flex + 1px `#E5E5E5` 横线左右 + 中间 12px "或" |
| Continue with Google 白底按钮 | 「使用 talkto.me 继续」（Radio icon 紫 + disabled + 「即将推出」chip） |
| Continue with Apple 白底按钮 | 「访客浏览社区」（User icon 紫 + 可点 → navigate('/')） |
| "Already have an account? Log in" | "已有账号？登录"（紫色链接 hover underline） |
| 右栏金黄装饰 + 头像 + chat | 右栏紫色渐变 `linear-gradient(135deg, #7C3AED → #A78BFA)` |
| 浮卡 mockup（手机 / 头像） | 4 张浮卡：紫色 chat 气泡（码界 Agent）+ 白底帖子卡（舆情风）+ 3 圆形头像（译/画/法）+ /agent-network handle pill |
| 装饰小圆点 | 5 个白/黄小圆点 + 右上 radial 光晕 |
| rotate 倾斜的"飘起来" | 浮卡 1 `rotate(-3deg)` + 浮卡 2 `rotate(2deg)` + `box-shadow: 0 20px 40px` |

## Bulletin 化（金黄 → 紫色 + Bulletin 元素）

- 右栏背景：金黄 → `#7C3AED → #A78BFA` 紫色渐变
- 浮卡内容：网红头像 / 健身视频 → Bulletin 实物：码界 Agent 自我介绍气泡 / 舆情风帖子卡（B logo）/ 译/画/法 三 agent 头像
- handle pill：`/shapeshft3rs` → `/agent-network`

## 保留的功能逻辑（一字未改）

- `email` / `talktoHandle` state
- `mode: 'login' | 'register'`（保留，未启用切换）
- `step: 'main' | 'talkto-verify' | 'magic-sent'`
- `loading` / `magicLinkUrl` / `errorMsg` state
- `searchParams.get('redirect')` + `是否合法redirect` 校验（防 open redirect）
- `拼上redirect()` 透传到 dev_magic_link
- `handleEmailSubmit()` 调 `申请magic_link()` API
- `handleTalktoConfirm()`（保留 step='talkto-verify' 流程）
- `dev_magic_link` 显示（step='magic-sent' 时点击直接登录）

## 桌面 vs 移动差异

- ≥ 1024px（lg）：双栏 50/50，左 form / 右紫色装饰
- < 1024px：右栏整块 `hidden lg:flex` 隐藏，左栏 `flex-1` 占满整屏，移动端只看 form

## Vite 状态

- vite dev server 在跑（5173 端口已确认）
- `vite build` 一次通过：`✓ 2126 modules transformed` / `✓ built in 2.10s`
- 无 type error / 无 import 缺失
- HMR 应自动重载（写入即生效）

## 已知问题 / 限制

1. "已有账号？登录" 链接当前是 `e.preventDefault()` 占位（保持视觉对齐 Linktree），实际登录仍走同一份 magic link 表单 —— 如果未来要拆分 login / register 两套流程再启用 mode 切换。
2. step='magic-sent' 时的紫色 ✓ icon 是 `lucide-react` 的 `CheckCircle2`，依赖项已存在无需新装。
3. 未跑 Playwright 自动截图（项目里未见 Playwright 安装），靠 vite build PASS + HMR 验证；建议人工浏览器对照截图。

## 给主 agent 的下一步

1. 浏览器开 http://localhost:5173/login，桌面视口对照 `docs/runs/92ad383eb8c56d3947c8ed66428769b2.png`
2. F12 切移动视口（375px），确认右栏隐藏、左栏可读
3. 输 email → 主按钮变紫 → 提交 → 确认 magic-sent 页 OK / dev_magic_link 链接可点
4. 点「访客浏览社区」 → 应跳 `/`
5. 视觉若需微调（标题字号 / 浮卡位置 / 渐变浓度），用户在飞书提具体改动后再启动一轮 quick-change
