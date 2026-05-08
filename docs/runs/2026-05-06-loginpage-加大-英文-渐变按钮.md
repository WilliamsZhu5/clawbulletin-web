# LoginPage 改造 — 加宽 / 英文化 / 渐变按钮

日期：2026-05-06
文件：`/Users/zhujiahao/Clawbulletin/src/app/pages/LoginPage.tsx`（仅此一文件）

## 三件事

### (1) 左栏 form 容器加大
- `maxWidth: 400px` → `480px`（line 88）
- 顶左品牌区 padding 不动
- 整体 form 区垂直居中保留

### (2) UI 文案英文化（左栏 + 右栏装饰浮卡均改）

**左栏（用户操作 UI）**：
- `加入 Bulletin` → `Join Bulletin`
- `免费加入 Agent 网络` → `Sign up for free`
- `发送中…` → `Sending…`
- `点击「Continue」即表示同意 Bulletin 的隐私协议和服务条款，并接收账户相关更新。` → `By clicking Continue, you agree to Bulletin's privacy notice and T&Cs and to receive account updates.`
- `或` → `OR`
- `使用 talkto.me 继续` → `Continue with talkto.me`
- `即将推出` → `Coming soon`
- `访客浏览社区` → `Browse as guest`
- `已有账号？登录` → `Already have an account? Log in`
- talkto-verify step：`talkto.me 握手` / `输入你的 talkto.me 用户名继续` / `Bulletin 正在请求与你的 talkto.me Agent 建立 A2A 握手…` / `你的 TALKTO.ME 用户名` / `授权 A2A 握手` / `正在连接 Agent…` / `返回` 全部英文化
- magic-sent step：`登录链接已发送 / 发到了 / DEV 模式：直接点这里登录 / 链接 15 分钟内有效…/ ← 返回` 全部英文化

**右栏装饰浮卡（marketplace 撮合演示卡片）**：
- `译笔` → `Translit`，`你的 Agent` → `Your Agent`，圆头像 `你` → `Y`
- 议价对话改英文 + 货币改美元；`谈判已达成` → `Deal closed`；`已写入合同 · 自动签发` → `Contract signed · auto-issued`

仅 UI 可见字符串改英文。state / handler / API 字段（`申请magic_link` / `redirect目标` / `邮箱已填` 等中文标识符）和注释保持原样。

### (3) 三个按钮改成渐变实心平面（与 TopBar 发布按钮同款风格）

| 按钮 | 渐变 | 文字 | 形态 |
|---|---|---|---|
| Continue（含 Authorize 复用同款） | `#4F46E5 → #7C3AED` | 白字 | 平面 + `0 4px 12px rgba(79,70,229,0.25)` shadow + hover `translateY(-1px)` 加重 shadow；disabled `#F0F0F0` + 灰字 |
| Continue with talkto.me | `#06B6D4 → #3B82F6` | 白字 | 平面 + cyan/blue shadow；`opacity: 0.5`（disabled 占位） |
| Browse as guest | `#F5F3FF → #E0E7FF` | 紫字 `#4F46E5` | 平面 + 浅紫 shadow + hover 微浮起 |

所有按钮：`border: none`、无 inset / 无 3D 凸起、圆角 8px、高 48px、hover `translateY(-1px)` + shadow 略加重（与 TopBar 发布按钮一致）。

## 功能保留

- state（email / talktoHandle / step / loading / magicLinkUrl / errorMsg）不动
- handler（handleEmailSubmit / handleTalktoConfirm / 拼上redirect）不动
- API call（`申请magic_link`）/ redirect 校验 / dev_magic_link / step state machine 全部保留
- 错误处理（errorMsg 显示）保留
- 移动端 < lg 整个右栏隐藏保持
- 字体 stack 含 Inter + PingFang SC fallback 保留

## 验证

- Vite production build：✓ built in 2.70s（2126 modules transformed），无 TS / 语法 error
- 浏览器手测：未跑（dev server 未启动；交主 agent 决定是否启 HMR 验）
- 文件改动：仅 `src/app/pages/LoginPage.tsx`，未碰其他文件、未 install 依赖、未 commit
