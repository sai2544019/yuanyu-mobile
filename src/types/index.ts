export interface User {
  id: string;
  nickname: string;
  gender: 0 | 1 | 2 | 3;
  age?: number;
  city?: string;
  district?: string;
  bio?: string;
  avatarUrl?: string;
  distance?: number;
  isOnline: boolean;
  isVerified: boolean;
  interests: string[];
  questions?: Question[];
  photos?: string[];
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  isPublic: boolean;
  sortOrder: number;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  category: string;
  city?: string;
  type: 1 | 2 | 3;
  memberCount: number;
  onlineCount?: number;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  matchType: 1 | 2;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    avatarUrl?: string;
    isOnline: boolean;
    isVerified: boolean;
    interests: string[];
    city?: string;
  };
}

export interface Conversation {
  id: string;
  type: 1 | 2;
  targetId?: string;
  lastMessage?: Message;
  unreadCount: number;
  otherUser?: {
    id: string;
    nickname: string;
    avatarUrl?: string;
    isOnline: boolean;
  };
}

export interface Message {
  id: string;
  convId: string;
  senderId: string;
  type: 1 | 2 | 3 | 4 | 5;
  content?: string;
  mediaUrl?: string;
  duration?: number;
  isRecalled: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    nickname: string;
    avatar_url?: string;
    is_new: boolean;
  };
}
