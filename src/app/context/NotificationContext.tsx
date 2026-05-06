// 通知中心全局状态（v1 通知中心 F2）
// 仿 MatchContext 的极简结构。提供：
//   通知列表 / 未读数 / 加载中 / 刷新() / 标记已读(id) / 标记全部已读()
// 首次挂载只调"未读数"（轻量），不预拉全量列表 —— 减少首屏请求量。
// /notifications 页面挂载时显式调 刷新() 再拉全量。

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  列通知 as 列通知API,
  拿未读通知数,
  标记通知已读,
  已登录,
  type 通知,
} from '../data/api';

interface NotificationContextType {
  通知列表: 通知[];
  未读数: number;
  加载中: boolean;
  错: string | null;
  // 拉全量列表（默认 desc，limit=50），同时刷新未读数
  刷新: () => Promise<void>;
  // 仅刷新未读数（不动列表）
  刷新未读数: () => Promise<void>;
  // 标记单条已读：先调 API 成功后再更新本地（不做乐观更新，避免回滚 bug）
  标记已读: (id: string) => Promise<void>;
  // 标记全部未读为已读
  标记全部已读: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  通知列表: [],
  未读数: 0,
  加载中: false,
  错: null,
  刷新: async () => {},
  刷新未读数: async () => {},
  标记已读: async () => {},
  标记全部已读: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [通知列表, set通知列表] = useState<通知[]>([]);
  const [未读数, set未读数] = useState<number>(0);
  const [加载中, set加载中] = useState<boolean>(false);
  const [错, set错] = useState<string | null>(null);

  // 首次挂载只拉未读数；防 React.StrictMode 双调用
  const 已初始化ref = useRef(false);

  const 刷新未读数 = useCallback(async () => {
    if (!已登录()) return;
    try {
      const n = await 拿未读通知数();
      set未读数(n);
    } catch (e: any) {
      // 静默失败 —— badge 拿不到不影响其他页面，错误进 set错 但不抛
      set错(e?.message || String(e));
    }
  }, []);

  const 刷新 = useCallback(async () => {
    if (!已登录()) return;
    set加载中(true);
    set错(null);
    try {
      const 列表 = await 列通知API({ limit: 50 });
      set通知列表(列表);
      // 列表里 read_at = null 的就是未读，本地直接算（避免再发一个请求）
      const 计 = 列表.filter((n) => !n.read_at).length;
      set未读数(计);
    } catch (e: any) {
      set错(e?.message || String(e));
    } finally {
      set加载中(false);
    }
  }, []);

  const 标记已读 = useCallback(async (id: string) => {
    if (!已登录()) return;
    // 先调 API；成功后再改本地 state（避免乐观更新失败需要回滚）
    await 标记通知已读({ ids: [id] });
    set通知列表((prev) =>
      prev.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: new Date().toISOString() } : n)),
    );
    set未读数((prev) => Math.max(0, prev - 1));
  }, []);

  const 标记全部已读 = useCallback(async () => {
    if (!已登录()) return;
    await 标记通知已读({ 全部: true });
    const 现刻 = new Date().toISOString();
    set通知列表((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: 现刻 })));
    set未读数(0);
  }, []);

  useEffect(() => {
    if (已初始化ref.current) return;
    已初始化ref.current = true;
    // 仅未登录时跳过
    if (!已登录()) return;
    // 首屏只拉数字
    刷新未读数().catch(() => {});
  }, [刷新未读数]);

  return (
    <NotificationContext.Provider
      value={{ 通知列表, 未读数, 加载中, 错, 刷新, 刷新未读数, 标记已读, 标记全部已读 }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
