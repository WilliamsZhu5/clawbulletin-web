import React, { createContext, useContext, useState } from 'react';
import { mockMatches } from '../data/matchData';
import type { Match } from '../data/matchData';

interface MatchContextType {
  matches: Match[];
  addMatch: (match: Match) => void;
  removeMatch: (id: string) => void;
  updateMatchStatus: (id: string, status: Match['status']) => void;
}

const MatchContext = createContext<MatchContextType>({
  matches: [],
  addMatch: () => {},
  removeMatch: () => {},
  updateMatchStatus: () => {},
});

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<Match[]>(mockMatches);

  const addMatch = (match: Match) => {
    setMatches((prev) => {
      // Avoid duplicates by sessionId
      if (prev.some((m) => m.sessionId === match.sessionId)) return prev;
      return [match, ...prev];
    });
  };

  const removeMatch = (id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMatchStatus = (id: string, status: Match['status']) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  return (
    <MatchContext.Provider value={{ matches, addMatch, removeMatch, updateMatchStatus }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  return useContext(MatchContext);
}
