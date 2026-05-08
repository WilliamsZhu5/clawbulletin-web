# Bulletin · 静态视觉 Mockup · HTML 单文件

**输出**: `/Users/zhujiahao/Clawbulletin/bulletin-mockup.html`
**大小**: 84 KB · **行数**: 1 178 · **依赖**: 仅 Tailwind CDN(无 npm / 无 build)

## 5 个 view 做了什么

1. **登录页 LoginPage** — 双栏 50/50。左白底 form(ClawLogo SVG inline + 紫色 Bulletin wordmark + 标题 26/700 + 邮箱 input + Continue 浅灰 disabled + 法律小字 + OR 实线 + talkto.me 白底紫 Radio icon + 访客模式 + Log in 链接)。右紫色渐变 `#7C3AED → #A78BFA` + 三个浮卡(真实 PostCard 风翻译需求 / 真实 chat 气泡 + typing dots / 成交卡含 ⇄ 双箭头 + element 多色 badge) + 装饰小圆点 + 顶部光晕。
2. **首页 HomePage** — TopBar(56px 浅暖灰 + ClawLogo + 紫 Bulletin + 搜索框 + 中/EN + 跟 Agent 聊 + 紫渐变发布按钮)+ Sidebar 220px(7 个 nav + 7 个 category 多色 icon + 账号区紫色头像 + 通知红 badge + 撮合 badge)+ 主区(紫文字渐变 hero "欢迎回来,朱嘉浩。" + 最新/热门/精选 tab + JS 动态渲染 8 张多色 PostCard)+ 右栏 288px(top4 多色 trending + 7 个 tag pill + talkto.me CTA + Brain OS 已连接含 P0/P1/P2 多色 dot)。
3. **帖子详情 PostDetailPage** — 帖子主卡(skills 多色 stripe + badge + AGENT pill + 26px 标题 + 译笔 Translit 头像行含盾形 verified + 价格 chip + 列表化正文 + 5 个 tag + "让我的 Agent 跟它聊"紫渐变 CTA + 收藏/分享 outlined)+ 3 条评论卡(码界绿/品牌画师橙/舆情风玫红 多色头像 + AGENT pill + 1 条嵌套回复 indent)+ 评论输入框。
4. **消息 MessagesPage** — 左列表 320px(搜索 + "我的 Agent"紫渐变 ✦ 置顶 active 选中 + 5 个普通会话含未读 badge / 时间)+ 右 chat(顶部紫渐变头像 + 在线绿点 + 消息流含 user/agent/system/tool 4 类气泡 + 2 张工具调用折叠卡 "搜帖" / "发起 Agent 对话" + 三点 typing 动画)+ 输入框含召唤帖子 / 快捷指令 chip。
5. **我的 Agent /agents/new** — 标题 "添加一个 Agent" + 两张方式卡片(平台代调紫 outlined active 含 ✓ 蓝勾 / BYO 白底)+ 表单(Agent 名 / 人设 / talkto.me handle 带前缀)+ BYO 接入链接黑底绿字 monospace `http://bulletin.local/接入/cb_a8f3c2e1b9d4` + 复制按钮 + "上线我的 Agent"紫渐变 CTA。

## 删了什么

- 所有 React / hook / context / router(LanguageContext / NotificationContext / MatchContext)
- 所有 API 调用(`列帖子` / `申请magic_link` / 适配函数)
- 所有真实业务组件(PostCard / CategoryBadge / Sidebar 等 React 组件 → 用纯 HTML+CSS+JS 还原视觉)
- DropdownMenu / Modal / 路由跳转 / form submit / fetch
- 所有 lucide-react icon → 替换为 inline SVG
- localStorage onboarding state(改成 hardcode 跳过)

## 已知简化 / trade-off

- **lucide icon → inline SVG**:几个 icon 用近似 stroke 路径还原,视觉接近但非 100% 像素级一致。
- **登录页 talkto.me handshake / magic-sent step 省略**:只保留 main step,因为是 mockup,user 直接看主流程视觉。
- **HomePage onboarding 引导卡省略**:user 看视觉时已知道自己用过产品。
- **CSS 用 vanilla,没用 Tailwind 完整 utility set**:Tailwind CDN 仅做基础 utility(`flex` / `gap` / `hidden` 等),关键视觉 token(category 多色、紫渐变、阴影)全用 inline style 或自定义 class,确保跟产品 theme.css 一致。
- **agent 模式切换的 tick 用 JS DOM 操作**:为了双击就能 demo,没做 React 风组件化。
- **MessagesPage typing 永远在 typing**:没做真实状态机,只是装饰用。

## 给主 agent 的下一步

- user 双击 `/Users/zhujiahao/Clawbulletin/bulletin-mockup.html` → 默认浏览器打开。
- 已自动 `open` 验证过一次,文件无语法错误(div / article / script 标签平衡)。
- user 可以直接发邮件附件 / iMessage 把 `.html` 发给别人看视觉,对方双击就能在自己电脑打开,不需要任何环境。
- 如需再加 view(Notifications / Settings / Trending 等),按现有结构在 `<div id="view-xxx" class="view hidden">` 里加节点 + 顶部 view-switcher 加按钮即可。
- 如需 print to PDF 给文档发飞书,Cmd+P → 保存为 PDF。
