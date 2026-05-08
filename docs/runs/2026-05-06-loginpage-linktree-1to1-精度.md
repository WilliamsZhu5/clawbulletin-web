# LoginPage 1:1 模仿 Linktree 注册页（精度对齐）

日期：2026-05-06
范围：仅 `src/app/pages/LoginPage.tsx`，未改其他文件，未 commit / push，未装新依赖。

## 输入

- 截图：`/Users/zhujiahao/Clawbulletin/docs/runs/92ad383eb8c56d3947c8ed66428769b2.png`（Read 已完成）
- 用户原话：「主页（→ 登录页）一比一模仿 linktree，换成我们的元素」
- 之前 2 次重做被判"丑" → 这次精度对齐字号/字重/间距/按钮形状

## 截图视觉量测（凭眼估算 14 项）

| # | 元素 | Linktree 截图量 | 之前代码 | 本次对齐 |
|---|---|---|---|---|
| 1 | 左右栏 | ≈50/50 | flex-1 / flex-1 | flex-1 / flex-1 ✅ |
| 2 | 顶左 padding | 24-28px | p-8 (32) | 24 28 0 ✅ |
| 3 | 品牌 logo+文字 | 17-18 / 800 | 20 / 800 | **17 / 800 ✅** |
| 4 | logo→标题间距 | 由 vert-center 决定 | flex justify | flex items-center ✅ |
| 5 | 主标题 "Join …" | **24-26 / 700** | 30 / 800 | **26 / 700 ✅** |
| 6 | 副标题 | 14 / 400 / `#666` | 14 / 400 | 14 / 400 / `#5A5A5A` ✅ |
| 7 | Email input | **44-46h / r8 / 浅灰底** | 48h / r8 | **46h / r8 / `#F2F2F2` ✅** |
| 8 | Continue btn | **44-46h / disabled 浅灰** | 48h / 渐变实心 | **46h / 实心 `#4F46E5` 平面 ✅** |
| 9 | 法律小字 | 11-12 / `#777` / lh1.55 | 11 / 1.6 | 12 / 1.55 / `#737373` ✅ |
| 10 | OR 分隔 | **实色横线** | 渐隐 | **实色 `#E5E5E5` ✅** |
| 11 | 社交按钮 | **白底 + 浅灰边 + 黑字** | 渐变实心(青蓝/浅紫) | **白底 / 1px `#E0E0E0` / icon inline-flex ✅** |
| 12 | 底部 Log in | 13 / 绿色 | 13 / 紫 | 13 / 紫 `#4F46E5` ✅（保留 brand）|
| 13 | 右栏背景 | 金黄 | 紫色渐变 | 紫色 `#7C3AED→#A78BFA`（保留 brand） |
| 14 | 浮卡 3 张 | 错落 + 旋转 + 大阴影 | 已就绪（PostCard / MessageBubble / Deal）| **沿用** |

## 关键修正点（vs 上一轮）

1. 主标题字号 30→**26** 字重 800→**700**，更接近截图细瘦感
2. input/button 高 48→**46**，圆角保持 8
3. Continue 按钮去渐变改纯色 `#4F46E5`，平面无 transform/shadow（截图就是平的）
4. **社交按钮从渐变实心改为白底 + 浅灰边 + 黑字 + 紫色 icon**（这是上一轮"丑"的最大原因）
5. 社交按钮 icon 从绝对定位改 inline-flex 紧贴文字（与截图同款 layout）
6. OR 横线渐隐改实色（截图就是实线）
7. 法律小字加粗"Continue"（仿截图加粗 "Create account"）
8. 顶左 logo 17px / padding 24 28（之前 p-8 偏大）
9. max-width 480→**380**（form 更窄，与截图等宽）

## 保留 brand 紫的位置

- Continue 实心按钮 `#4F46E5`
- "Log in" 链接 `#4F46E5`
- 社交按钮 icon `#4F46E5`（白底卡片上的彩色 icon，与截图 Google/Apple 彩色 icon 同 pattern）
- 右栏背景紫色（user 明确不要金黄）
- 浮卡内紫色 accent（PostCard / MessageBubble 自身 brand）

## 功能保留

- state：email / talktoHandle / step / loading / magicLinkUrl / errorMsg ✅
- handler：handleEmailSubmit / handleTalktoConfirm / 拼上redirect ✅
- API：申请magic_link ✅
- redirect 校验：是否合法redirect ✅
- step='magic-sent' DEV_MODE 链接 ✅
- step='talkto-verify' 占位（保留紫色卡片）✅
- < lg 单栏（右栏 hidden lg:flex）✅
- 移动端 px-6 / lg:px-12 ✅

## 验证

- `node_modules/.bin/vite build` 干净通过（仅 chunk size 通用警告，与本改动无关）
- 未装新依赖
- 未碰其他文件

## 下一步

由用户在浏览器 http://localhost:5173/login 对照截图视觉验收。重点看：
1. 主标题字号是否还偏大
2. 社交按钮白底浅灰边是否到位
3. 整体 form 宽度（380 max-w）是否舒适
4. 右栏紫色 + 浮卡 visual 是否合理（沿用前轮真实组件）
