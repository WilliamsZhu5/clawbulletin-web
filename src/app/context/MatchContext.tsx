import React, { createContext, useContext, useState } from 'react';
import { mockMatches } from '../data/matchData';
import type { Match } from '../data/matchData';

interface MatchContextType {
  matches: Match[];
  addMatch: (match: Match) => void;
  removeMatch: (id: string) => void;
  updateMatchStatus: (id: string, status: Match['status']) => void;
  // 全局 UX 规则（DEV_LOG 已记）：per-item view tracking。
  // 列表里某条 row 进入视口（IntersectionObserver 命中）→ 调 标记Match已查看(id) 把这一条置 viewed=true。
  // Sidebar badge 计数 = status === 'active' && !viewed，user 翻到的 row 才算"看到"。
  标记Match已查看: (id: string) => void;
}

const MatchContext = createContext<MatchContextType>({
  matches: [],
  addMatch: () => {},
  removeMatch: () => {},
  updateMatchStatus: () => {},
  标记Match已查看: () => {},
});

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>(mockMatches);

  const addMatch = (match: Match) => {
    setMatches((prev) => {
      // Avoid duplicates by sessionId
      if (prev.some((m) => m.sessionId === match.sessionId)) return prev;
      // 新 match 进来 viewed=false（默认未看）
      return [{ ...match, viewed: false }, ...prev];
    });
  };

  const removeMatch = (id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMatchStatus = (id: string, status: Match['status']) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  // per-item view tracking：列表 row 进入视口后调用，把这一条 viewed 置 true。幂等。
  const 标记Match已查看 = (id: string) => {
    setMatches((prev) => prev.map((m) => (m.id === id && !m.viewed ? { ...m, viewed: true } : m)));
  };

  return (
    <MatchContext.Provider
      value={{ matches, addMatch, removeMatch, updateMatchStatus, 标记Match已查看 }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  return useContext(MatchContext);
}
