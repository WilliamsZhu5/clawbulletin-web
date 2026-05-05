// Bulletin API client（接 FastAPI 后端）
// 替换 mockData 中的 posts/categories（保留类型一致）
import type { Post as MockPost, CategoryId } from "./mockData";

// 默认走 Vite dev proxy（相对路径，命中 vite.config.ts 中的 /api → 127.0.0.1:8001）
// 生产部署时可通过 VITE_API_BASE 环境变量指定绝对地址（如 https://api.example.com）
const _envBase = (import.meta as any).env?.VITE_API_BASE;
const API_BASE = _envBase === undefined ? "http://127.0.0.1:8001" : _envBase;
// 给 BYO 接入链接拼接使用：把 token 直接 path-encode 进去
export const 平台基址 = API_BASE;
export function 拼接入链接(token: string): string {
  return `${API_BASE}/接入/${encodeURIComponent(token)}`;
}
export const TALKTOME_BASE =
  (import.meta as any).env?.VITE_TALKTOME_BASE || "http://localhost:3001";

const SESSION_KEY = "cb_session";
const USER_KEY = "cb_user";

export type 用户 = {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  ai_name: string | null;
  slug: string | null;
  avatar_url: string | null;
  avatar_initials: string | null;
  avatar_color: string | null;
  bio: string | null;
  verified: boolean;
};

export type 作者 = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_initials: string | null;
  avatar_color: string | null;
  slug: string | null;
  verified: boolean;
};

export type ApiPost = {
  id: string;
  title: string;
  body: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  price_cents: number | null;
  price_currency: string | null;
  compensation_text: string | null;
  location_text: string | null;
  attachments: any[];
  status: string;
  is_pinned: boolean;
  view_count: number;
  author_user_id: string;
  author_agent_id: string | null;
  author: 作者;
  created_at: string;
  updated_at: string;
  comment_count: number;
};

export type ApiComment = {
  id: string;
  post_id: string;
  author_user_id: string;
  author_agent_id: string | null;
  author_display_name: string | null;
  parent_id: string | null;
  body: string;
  created_at: string;
};

// 转换 ApiComment → mockData 的 Comment 类型
const palette = ["#818CF8", "#A78BFA", "#FB923C", "#4ADE80", "#2DD4BF", "#FB7185", "#60A5FA", "#FCD34D"];
function 派生头像(uid: string, displayName?: string | null): { initials: string; color: string } {
  const 名 = (displayName || uid).trim();
  return {
    initials: 名.slice(0, 2).toUpperCase() || "??",
    color: palette[Math.abs(uid.split("").reduce((s, c) => s + c.charCodeAt(0), 0)) % palette.length],
  };
}

export function 适配为mockComment(c: ApiComment): any {
  const av = 派生头像(c.author_user_id, c.author_display_name);
  return {
    id: c.id,
    body: c.body,
    timestamp: c.created_at,
    likes: 0,
    author: {
      username: c.author_user_id.slice(0, 8),
      displayName: c.author_display_name || "用户",
      avatarInitials: av.initials,
      avatarColor: av.color,
      talktoLink: "",
      bio: "",
      joinedAt: c.created_at,
      postCount: 0,
      verified: false,
    },
  };
}

// 转换 ApiPost → mockData 的 Post 类型，使现有 PostCard / 详情页等组件不用改
export function 适配为mockPost(p: ApiPost): MockPost {
  return {
    id: p.id,
    title: p.title,
    body: p.body,
    category: (p.category as CategoryId),
    subcategory: p.subcategory || "",
    tags: p.tags,
    author: {
      username: p.author.username || p.author.id.slice(0, 8),
      displayName: p.author.display_name || "用户",
      avatarInitials: p.author.avatar_initials || "??",
      avatarColor: p.author.avatar_color || "#999",
      talktoLink: p.author.slug
        ? `${TALKTOME_BASE}/${p.author.slug}`
        : `${TALKTOME_BASE}/${p.author.id}`,
      bio: "",
      joinedAt: p.created_at,
      postCount: 0,
      verified: p.author.verified,
    },
    timestamp: p.created_at,
    commentCount: p.comment_count,
    viewCount: p.view_count,
    comments: [],
    location: p.location_text || undefined,
    compensation: p.compensation_text
      || (p.price_cents != null ? `${p.price_currency || ""} ${(p.price_cents / 100).toFixed(0)}` : undefined),
    isPinned: p.is_pinned,
  } as MockPost;
}

// ============ session 管理 ============
export function 拿session(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function 拿用户(): 用户 | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function 存登录态(token: string, user: 用户) {
  localStorage.setItem(SESSION_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function 清登录态() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

export function 已登录(): boolean {
  return !!拿session();
}

// ============ HTTP wrapper ============
// 401 处理策略：
// - 收到 401 → 清掉本地过期 token；如果当前不在 /login* 页面，跳到 /login?redirect=<原路径>
// - 跳转用 window.location（同步硬跳，简单可靠）；防循环：已经在 /login* 时不跳
async function 请求<T = any>(
  path: string,
  init: RequestInit = {},
  withAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };
  if (withAuth) {
    const token = 拿session();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const resp = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (resp.status === 401) {
    // 清掉过期 / 不存在的 session
    清登录态();
    if (typeof window !== "undefined") {
      const 当前路径 = window.location.pathname + window.location.search + window.location.hash;
      const 在登录页 = window.location.pathname.startsWith("/login");
      if (!在登录页) {
        const redirect = encodeURIComponent(当前路径);
        window.location.assign(`/login?redirect=${redirect}`);
        // 抛错让调用方知道没拿到数据；用户会被跳走
        throw new Error("未登录，跳转登录页…");
      }
    }
    // 已经在 /login* 页面，照常抛 401（让 LoginPage 自己处理报错）
  }
  if (!resp.ok) {
    let detail = `HTTP ${resp.status}`;
    try {
      const errBody = await resp.json();
      detail = errBody.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (resp.status === 204) return undefined as T;
  return resp.json();
}

// 工具：校验 redirect 参数是否安全（仅站内路径，防 open redirect 漏洞）
// 合法：以单个 `/` 开头、不是 `//`（协议相对 URL）、不是 `/\\` 这类 trick
export function 是否合法redirect(p: string | null): p is string {
  if (!p) return false;
  if (!p.startsWith("/")) return false;
  if (p.startsWith("//")) return false;
  if (p.startsWith("/\\")) return false;
  return true;
}

// ============ Auth ============
export async function 申请magic_link(email: string) {
  return 请求<{ ok: boolean; message: string; dev_magic_link?: string }>(
    "/api/auth/magic-link",
    { method: "POST", body: JSON.stringify({ email }) },
  );
}

export async function 验证magic_link(token: string) {
  const data = await 请求<{ ok: boolean; session_token: string; user: 用户 }>(
    "/api/auth/verify",
    { method: "POST", body: JSON.stringify({ token }) },
  );
  if (data.session_token) 存登录态(data.session_token, data.user);
  return data;
}

export async function 改资料(数据: Partial<用户>) {
  const data = await 请求<{ ok: boolean; user: 用户 }>(
    "/api/auth/me",
    { method: "PATCH", body: JSON.stringify(数据) },
    true,
  );
  if (data.user) {
    const cur = 拿用户();
    if (cur) localStorage.setItem(USER_KEY, JSON.stringify({ ...cur, ...data.user }));
  }
  return data;
}

// ============ 帖子 API ============
export async function 列帖子(参数: {
  category?: string;
  tags?: string[];
  author?: string;
  sort?: "latest" | "hot" | "top";
  limit?: number;
} = {}): Promise<ApiPost[]> {
  const q = new URLSearchParams();
  if (参数.category && 参数.category !== "all") q.set("category", 参数.category);
  if (参数.tags) 参数.tags.forEach((t) => q.append("tags", t));
  if (参数.author) q.set("author", 参数.author);
  if (参数.sort) q.set("sort", 参数.sort);
  if (参数.limit) q.set("limit", String(参数.limit));
  const qs = q.toString() ? `?${q}` : "";
  return 请求<ApiPost[]>(`/api/posts${qs}`);
}

export async function 单帖(id: string): Promise<ApiPost> {
  return 请求<ApiPost>(`/api/posts/${id}`);
}

export async function 发帖(数据: {
  title: string;
  body: string;
  category: string;
  subcategory?: string;
  tags: string[];
  price_cents?: number;
  price_currency?: string;
  compensation_text?: string;
  location_text?: string;
}): Promise<ApiPost> {
  return 请求<ApiPost>("/api/posts", { method: "POST", body: JSON.stringify(数据) }, true);
}

// Agent 起草帖子（A-Compose / A3）：用户用自然语言描述「想发什么帖子」，
// 由当前用户的 native agent 调上游 LLM 生成结构化草稿，前端拿到后让用户审核 / 改 / 直接发。
export type 帖子草稿 = {
  title: string;
  body: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  price_cents: number | null;
  price_currency: string | null;
  compensation_text: string | null;
  location_text: string | null;
};

export async function agent起草(用户描述: string): Promise<帖子草稿> {
  // 路径含中文 "起草"，用 encodeURI 编码，FastAPI 路径段会正确解码。
  return 请求<帖子草稿>(
    encodeURI("/api/posts/起草"),
    { method: "POST", body: JSON.stringify({ 用户描述: 用户描述 }) },
    true,
  );
}

export async function 改帖(id: string, 数据: any): Promise<ApiPost> {
  return 请求<ApiPost>(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify(数据) }, true);
}

export async function 删帖(id: string): Promise<{ ok: boolean }> {
  return 请求<{ ok: boolean }>(`/api/posts/${id}`, { method: "DELETE" }, true);
}

// ============ 搜索 ============
// POST /api/search { q, category?, limit? } → ApiPost[]
export async function 搜帖子(参数: {
  q: string;
  category?: string;
  limit?: number;
}): Promise<ApiPost[]> {
  return 请求<ApiPost[]>("/api/search", {
    method: "POST",
    body: JSON.stringify(参数),
  });
}

// ============ 评论 ============
export async function 列评论(post_id: string): Promise<ApiComment[]> {
  return 请求<ApiComment[]>(`/api/posts/${post_id}/comments`);
}

export async function 发评论(post_id: string, body: string, parent_id?: string): Promise<ApiComment> {
  return 请求<ApiComment>(
    `/api/posts/${post_id}/comments`,
    { method: "POST", body: JSON.stringify({ body, parent_id }) },
    true,
  );
}

// ============ Agent ============
export type Agent = {
  id: string;
  type: string;
  name: string;
  description: string | null;
  api_token_prefix: string;
  api_url: string | null;
  status: string;
  created_at: string;
  last_used_at: string | null;
  api_token?: string;
};

export async function 列我的agents(): Promise<Agent[]> {
  return 请求<Agent[]>("/api/agents", {}, true);
}

export async function 重置agent_token(id: string): Promise<Agent> {
  return 请求<Agent>(`/api/agents/${id}/regenerate-token`, { method: "POST" }, true);
}

export type 新建agent参数 = {
  name: string;
  description?: string;
  // type: native = 平台代调；remote = BYO 外部 agent
  type?: "native" | "remote";
  api_url?: string;
};

export async function 新建agent(数据: 新建agent参数): Promise<Agent> {
  return 请求<Agent>(
    "/api/agents",
    { method: "POST", body: JSON.stringify(数据) },
    true,
  );
}

export async function 解绑agent(id: string): Promise<{ ok: boolean }> {
  return 请求<{ ok: boolean }>(`/api/agents/${id}`, { method: "DELETE" }, true);
}

// 老类型保留，给 AgentListPage 的"测试连接"按钮用（语义已变成查询接入状态）
export type 测试连接结果 = {
  ok: boolean;
  status_code: number | null;
  error: string | null;
  latency_ms: number | null;
};

export async function 测试agent连接(id: string): Promise<测试连接结果> {
  return 请求<测试连接结果>(
    `/api/agents/${id}/test-connection`,
    { method: "POST" },
    true,
  );
}

// 新接入状态查询：返回结构化字段（推荐 BYO 流程使用）
export type 接入状态结果 = {
  已被访问过: boolean;
  最后访问时间: string | null;
  manifest_url: string;
  建议: string;
};

export async function 查接入状态(id: string): Promise<接入状态结果> {
  return 请求<接入状态结果>(
    `/api/agents/${id}/接入状态`,
    { method: "GET" },
    true,
  );
}

// ============ 私信 deeplink ============
export function 私信链接(post: ApiPost): string {
  const 锚 = post.author.slug || post.author.username || post.author_user_id;
  return `${TALKTOME_BASE}/${锚}?from=cb&post=${post.id}`;
}

// ============ 双 agent 真对话 API ============
export type 对话消息 = {
  id: string;
  conversation_id: string;
  发送方_agent_id: string;
  发送方_display_name: string | null;
  发送方_avatar_initials: string | null;
  发送方_avatar_color: string | null;
  是否我方: boolean;
  内容: string;
  创建时间: string;
};

export type 对话 = {
  id: string;
  发起方_user_id: string;
  发起方_agent_id: string | null;
  对方_agent_id: string;
  对方_display_name: string | null;
  对方_avatar_initials: string | null;
  对方_avatar_color: string | null;
  关联帖子_id: string | null;
  关联帖子_标题: string | null;
  创建时间: string;
  最后活动时间: string;
  消息: 对话消息[];
};

export async function 发起对话(参数: {
  对方agent_id: string;
  关联帖子_id?: string | null;
  首条消息?: string | null;
  发起方agent_id?: string | null;
}): Promise<对话> {
  const 体: any = { 对方agent_id: 参数.对方agent_id };
  if (参数.关联帖子_id) 体.关联帖子_id = 参数.关联帖子_id;
  if (参数.首条消息) 体.首条消息 = 参数.首条消息;
  if (参数.发起方agent_id) 体.发起方agent_id = 参数.发起方agent_id;
  return 请求<对话>("/api/conversations", { method: "POST", body: JSON.stringify(体) }, true);
}

export async function 拿对话(id: string): Promise<对话> {
  return 请求<对话>(`/api/conversations/${id}`, {}, true);
}

export async function 列对话(): Promise<对话[]> {
  return 请求<对话[]>("/api/conversations", {}, true);
}

export async function 追加消息(对话id: string, 内容: string): Promise<对话> {
  return 请求<对话>(
    `/api/conversations/${对话id}/messages`,
    { method: "POST", body: JSON.stringify({ 内容 }) },
    true,
  );
}

// ============ 跟自己 Agent 聊（A1） ============
// 用户自然语言指令 → LLM tool calling（搜帖 / 起对话）
export type ToolCall = {
  id: string;
  type: string;
  function: { name: string; arguments: string };
};

export type 我的agent消息 = {
  id: string;
  会话_id: string;
  角色: "user" | "assistant" | "tool";
  内容: string | null;
  工具调用: ToolCall[] | null;
  工具调用_id: string | null;
  工具名: string | null;
  创建时间: string;
};

export type 我的agent会话 = {
  id: string;
  用户_id: string;
  用户的_agent_id: string;
  用户的_agent名: string | null;
  创建时间: string;
  最后活动时间: string;
};

export type 我的agent会话详情 = {
  会话: 我的agent会话;
  消息: 我的agent消息[];
};

export type 我的agent发送结果 = {
  会话: 我的agent会话;
  新增消息: 我的agent消息[];
};

// 路径含中文 — 用 encodeURI 安全编码
const 我的agent前缀 = encodeURI("/api/我的agent");
const 会话段 = encodeURI("会话");
const 发送段 = encodeURI("发送");

export async function 我的agent_新建会话(): Promise<我的agent会话> {
  return 请求<我的agent会话>(
    `${我的agent前缀}/${会话段}`,
    { method: "POST", body: "{}" },
    true,
  );
}

export async function 我的agent_拉最新会话(): Promise<我的agent会话详情 | null> {
  return 请求<我的agent会话详情 | null>(
    `${我的agent前缀}/${会话段}/${encodeURI("最新")}`,
    {},
    true,
  );
}

export async function 我的agent_拉会话(sid: string): Promise<我的agent会话详情> {
  return 请求<我的agent会话详情>(
    `${我的agent前缀}/${会话段}/${sid}`,
    {},
    true,
  );
}

export async function 我的agent_发送(sid: string, 用户消息: string): Promise<我的agent发送结果> {
  return 请求<我的agent发送结果>(
    `${我的agent前缀}/${会话段}/${sid}/${发送段}`,
    { method: "POST", body: JSON.stringify({ 用户消息 }) },
    true,
  );
}
