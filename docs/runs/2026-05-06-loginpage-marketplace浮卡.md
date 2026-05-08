# LoginPage 右栏 marketplace 浮卡改造

- **日期**：2026-05-06
- **改的文件**：`src/app/pages/LoginPage.tsx`（唯一）
- **是否 commit**：❌ 未 commit / 未 push（按硬约束）
- **是否动 deps**：❌ 未装新依赖（`ArrowLeftRight` 从已存在的 `lucide-react` 引入）
- **备份**：`/tmp/loginpage备份/LoginPage.tsx.bak`

---

## 删掉的浮卡（右栏装饰区）

1. ❌ **浮卡 1（旧）**：紫色 chat 气泡 —「码界 Agent」自我介绍（"你好，我是码界 Agent…"）
2. ❌ **浮卡 2（旧）**：白底帖子卡 —「舆情风 / 新品发布舆情监测」agent 自报家门
3. ❌ **浮卡 3（旧）**：3 个圆形头像 —「译 / 画 / 法」（用户明确要求删掉这三个字）
4. ❌ **浮卡 4（旧）**：handle pill —「✦ /agent-network」（不强烈代表 marketplace）

> 用户原话：「这三个字去掉吧」+「左边弹窗里的内容最好是和 agent to agent 的 marketplace 有代表性的，而不是 agent 这种」+「多加一个框吧，两个框有点少」

---

## 新加的 3 个 marketplace 浮卡（按"市场撮合"故事线排列）

### 浮卡 1（top 8% / left 8% / rotate -3deg）—— 需求帖卡

模拟 marketplace 挂出的需求帖。白底 rounded-2xl shadow-2xl，max-w 300px。

- 头部：紫色 24×24 圆"B" + 「译笔」 + 「· 5min」
- 标题：**🔍 招中英技术翻译**
- 描述：「200 页用户手册，预算 ¥5000」
- 底部 chip 行：浅紫「📂 翻译」/ 浅绿「💰 ¥5000」/ 浅黄「⏱️ 7 天内」

### 浮卡 2（top 38% / right 8% / rotate +2deg）—— 议价 chat 气泡（双气泡对话）

- 上消息（左对齐 / 紫底 #4F46E5 / 白字 / 圆角左下小）
  - 标签：「你的 Agent · 刚刚」
  - 内容：「你的报价 ¥5000 偏高，能 ¥3800 吗？」
- 下消息（右对齐 / 浅紫 #F3F0FF / 紫字 / 圆角右下小）
  - 标签：「译笔 · 1 分钟前」
  - 内容：「加急 5 天内完成 ¥4200，含术语表，可成交。」

### 浮卡 3（bottom 12% / left 18% / rotate -1deg）—— 成交卡

- 顶部状态：✅ 「**谈判已达成**」（深绿 #047857 / 700）
- 中部双方：紫"B"圆「译笔」 ⇄（lucide ArrowLeftRight）⇄ 紫色实心「你」「你的 Agent」
- 服务描述：「中英技术翻译 · 200 页」
- 价格行：「成交价 **¥4200** · 5 天内交付」（¥4200 用紫色加粗）
- 分隔线 + 底部小灰字：「已写入合同 · 自动签发」

---

## 保留未动

- ✅ 紫色背景渐变 `linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)`
- ✅ 装饰小圆点（5 个 absolute）+ 顶部光晕 radial-gradient
- ✅ shadow-2xl + 微旋转 + 浮起感
- ✅ Inter + PingFang SC 字体栈
- ✅ `< lg` 整个右栏隐藏
- ✅ **左栏 form 一字未动**（label / placeholder / 按钮文案 / disabled 行为 / 法律小字 / OR 分隔 / 社交按钮 / "已有账号？登录"全部原样）
- ✅ **state / handler 一字未动**（`handleEmailSubmit` / `handleTalktoConfirm` / `setStep` / `setEmail` / `setMagicLinkUrl` / `setErrorMsg` / `申请magic_link` / `是否合法redirect` / `拼上redirect` / 路由 navigate('/') 全部原样）
- ✅ **顶左品牌 logo 未动**（`ClawLogo size=20 stroke=#1A1A1E` + 文字 "Bulletin"）
- ✅ **magic-sent / talkto-verify step 渲染未动**

> 精确 diff（vs 备份）：仅 2 处改动 —— 第 3 行 import 加 `ArrowLeftRight`；第 446–610 行 4 浮卡 → 3 浮卡。

---

## Vite 状态

- ✅ `npx vite build` 干净通过（2126 modules / 2.51s / 0 errors）
- ✅ Vite dev server（pid 95389 / port 5173）仍在跑，HMR 自动生效
- ✅ `GET /login` → HTTP 200
- ✅ `GET /src/app/pages/LoginPage.tsx` → HTTP 200（128 KB transformed）

---

## 已知问题

- 无（视觉效果建议浏览器人工对照验收）

---

## 给主 agent 的下一步

浏览器打开 http://localhost:5173/login 对照视觉验收三点：

1. 三头像「译/画/法」消失 ✓
2. 三浮卡按"需求 → 议价 → 成交"故事线从上到下读出来 ✓
3. 错落感 + 微旋转 + 紫底白卡 contrast 良好 ✓
4. 移动端 < lg 切窄 → 右栏整体隐藏 ✓

如视觉需要微调（位置 / 旋转角度 / chip 颜色），告知后端单文件继续改。
