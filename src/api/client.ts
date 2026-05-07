import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：注入Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yuanyu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：Token过期自动刷新
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('yuanyu_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = res.data.data;
          localStorage.setItem('yuanyu_token', access_token);
          localStorage.setItem('yuanyu_refresh_token', refresh_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('yuanyu_token');
          localStorage.removeItem('yuanyu_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ========== API函数 ==========

export const authApi = {
  sendCode: (phone: string) => api.post('/auth/phone/send-code', { phone }),
  login: (phone: string, code: string) => api.post('/auth/phone/login', { phone, code }),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.put('/users/me', data),
  updateLocation: (latitude: number, longitude: number) =>
    api.put('/users/me/location', { latitude, longitude }),
  updateInterests: (interests: string[]) =>
    api.put('/users/me/interests', { interests }),
  getQuestions: () => api.get('/users/me/questions'),
  updateQuestion: (id: string, answer: string) =>
    api.put(`/users/me/questions/${id}`, { answer }),
  addQuestion: (question: string, answer: string) =>
    api.post('/users/me/questions', { question, answer }),
  deleteQuestion: (id: string) => api.delete(`/users/me/questions/${id}`),
  getDiscover: (gender: number, page = 1) =>
    api.get(`/users/discover?gender=${gender}&page=${page}`),
  getNearby: (page = 1) => api.get(`/users/nearby?page=${page}`),
  getUserProfile: (id: string) => api.get(`/users/${id}`),
};

export const matchApi = {
  swipe: (targetId: string, action: number) =>
    api.post('/swipe', { target_id: targetId, action }),
  getMatches: () => api.get('/matches'),
  unmatch: (id: string) => api.delete(`/matches/${id}`),
  block: (id: string) => api.post(`/matches/${id}/block`),
  report: (reportedId: string, reason: string, description?: string) =>
    api.post('/matches/report', { reported_id: reportedId, reason, description }),
};

export const chatApi = {
  getConversations: () => api.get('/conversations'),
  getMessages: (convId: string, cursor?: string) =>
    api.get(`/conversations/${convId}/messages${cursor ? `?cursor=${cursor}` : ''}`),
  sendMessage: (convId: string, type: number, content?: string, mediaUrl?: string) =>
    api.post(`/conversations/${convId}/messages`, { type, content, media_url: mediaUrl }),
  markRead: (convId: string) => api.post(`/conversations/${convId}/read`),
  recallMessage: (convId: string, msgId: string) =>
    api.post(`/conversations/${convId}/messages/${msgId}/recall`),
  getOrCreateMatchConv: (otherId: string) =>
    api.post(`/conversations/match/${otherId}`),
};

export const communityApi = {
  getCommunities: (category?: string, page = 1) =>
    api.get(`/communities?page=${page}${category ? `&category=${category}` : ''}`),
  getCommunity: (id: string) => api.get(`/communities/${id}`),
  joinCommunity: (id: string) => api.post(`/communities/${id}/join`),
  leaveCommunity: (id: string) => api.post(`/communities/${id}/leave`),
  getMembers: (id: string, page = 1) =>
    api.get(`/communities/${id}/members?page=${page}`),
  getMyCommunities: () => api.get('/communities/my/list'),
  getActivities: (id: string, page = 1) =>
    api.get(`/communities/${id}/activities?page=${page}`),
  createActivity: (id: string, data: Record<string, unknown>) =>
    api.post(`/communities/${id}/activities`, data),
};
