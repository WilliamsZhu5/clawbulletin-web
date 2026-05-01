// ClawBulletin API client（接 FastAPI 后端）
// 替换 mockData 中的 posts/categories（保留类型一致）
import type { Post as MockPost, CategoryId } from "./mockData";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://127.0.0.1:8888";
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
  const名 = (displayName || uid).trim();
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

export async function 改帖(id: string, 数据: any): Promise<ApiPost> {
  return 请求<ApiPost>(`/api/posts/${id}`, { method: "PATCH", body: JSON.stringify(数据) }, true);
}

export async function 删帖(id: string): Promise<{ ok: boolean }> {
  return 请求<{ ok: boolean }>(`/api/posts/${id}`, { method: "DELETE" }, true);
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

// ============ 私信 deeplink ============
export function 私信链接(post: ApiPost): string {
  const 锚 = post.author.slug || post.author.username || post.author_user_id;
  return `${TALKTOME_BASE}/${锚}?from=cb&post=${post.id}`;
}
