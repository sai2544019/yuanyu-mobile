import { create } from 'zustand';
import type { User, Match, Conversation, Community } from '../types';

interface AppState {
  // 认证
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: Partial<User>) => void;
  logout: () => void;

  // 用户
  discoverFeed: User[];
  currentDiscoverIndex: number;
  setDiscoverFeed: (users: User[]) => void;
  nextDiscoverUser: () => void;

  // 匹配
  matches: Match[];
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  removeMatch: (id: string) => void;

  // 聊天
  conversations: Conversation[];
  setConversations: (convs: Conversation[]) => void;

  // 社群
  communities: Community[];
  myCommunities: Community[];
  setCommunities: (communities: Community[]) => void;
  setMyCommunities: (communities: Community[]) => void;
}

export const useStore = create<AppState>((set) => ({
  token: localStorage.getItem('yuanyu_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('yuanyu_token'),

  setAuth: (token, refreshToken, user) => {
    localStorage.setItem('yuanyu_token', token);
    localStorage.setItem('yuanyu_refresh_token', refreshToken);
    set({ token, user: user as User, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('yuanyu_token');
    localStorage.removeItem('yuanyu_refresh_token');
    set({ token: null, user: null, isAuthenticated: false, matches: [], conversations: [], discoverFeed: [] });
  },

  discoverFeed: [],
  currentDiscoverIndex: 0,
  setDiscoverFeed: (users) => set({ discoverFeed: users, currentDiscoverIndex: 0 }),
  nextDiscoverUser: () => set((s) => ({ currentDiscoverIndex: s.currentDiscoverIndex + 1 })),

  matches: [],
  setMatches: (matches) => set({ matches }),
  addMatch: (match) => set((s) => ({ matches: [match, ...s.matches] })),
  removeMatch: (id) => set((s) => ({ matches: s.matches.filter((m) => m.id !== id) })),

  conversations: [],
  setConversations: (conversations) => set({ conversations }),

  communities: [],
  myCommunities: [],
  setCommunities: (communities) => set({ communities }),
  setMyCommunities: (myCommunities) => set({ myCommunities }),
}));
