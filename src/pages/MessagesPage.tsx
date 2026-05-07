import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi, matchApi } from '../api/client';
import { useStore } from '../store';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { matches, setMatches, conversations, setConversations } = useStore();
  const [tab, setTab] = useState<'matches' | 'groups'>('matches');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([matchApi.getMatches(), chatApi.getConversations()]).then(([m, c]) => {
      setMatches(m.data.data || []);
      setConversations(c.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>消息</h1>
        <div style={styles.tabs}>
          {['matches', 'groups'].map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
              onClick={() => setTab(t as 'matches' | 'groups')}
            >
              {t === 'matches' ? `匹配 ${matches.length}` : `社群 ${conversations.filter(c => c.type === 2).length}`}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-y" style={{ flex: 1 }}>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : tab === 'matches' ? (
          matches.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">👋</div>
              <h3>还没有匹配</h3>
              <p>快去滑动认识新朋友吧</p>
              <button className="btn btn-primary" onClick={() => navigate('/')}>去发现</button>
            </div>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                style={styles.chatItem}
                onClick={() => navigate(`/chat/conv_${match.user.id}`)}
              >
                <div style={styles.avatarWrap}>
                  <img
                    src={match.user.avatarUrl || 'https://i.pravatar.cc/100'}
                    alt={match.user.nickname}
                    style={styles.avatar}
                  />
                  {match.user.isOnline && <div style={styles.onlineDot} />}
                </div>
                <div style={styles.chatContent}>
                  <div style={styles.chatHeader}>
                    <span style={styles.chatName}>{match.user.nickname}</span>
                    <span style={styles.chatTime}>{formatTime(match.createdAt)}</span>
                  </div>
                  <p style={styles.chatPreview}>
                    你们匹配成功啦，快打个招呼吧 👋
                  </p>
                </div>
              </div>
            ))
          )
        ) : (
          conversations.filter(c => c.type === 2).length === 0 ? (
            <div className="empty-state">
              <div className="emoji">💬</div>
              <h3>还没有社群消息</h3>
              <p>加入社群开始聊天吧</p>
            </div>
          ) : (
            conversations.filter(c => c.type === 2).map((conv) => (
              <div key={conv.id} style={styles.chatItem}>
                <div style={styles.avatarWrap}>
                  <div style={{ ...styles.avatar, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>👥</div>
                </div>
                <div style={styles.chatContent}>
                  <div style={styles.chatHeader}>
                    <span style={styles.chatName}>{conv.otherUser?.nickname || '社群'}</span>
                    <span style={styles.chatTime}>{conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}</span>
                  </div>
                  <p style={styles.chatPreview}>{conv.lastMessage?.content || '开始聊天吧'}</p>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { padding: '16px 16px 0', background: 'white', borderBottom: '1px solid var(--border)' },
  headerTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' },
  tabs: { display: 'flex', gap: '4px' },
  tab: { padding: '8px 16px', border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', borderBottom: '2px solid transparent', color: 'var(--text-sub)', transition: 'all 0.15s' },
  tabActive: { color: 'var(--primary)', borderBottomColor: 'var(--primary)', fontWeight: '600' },
  chatItem: { display: 'flex', gap: '12px', padding: '14px 16px', background: 'white', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' },
  onlineDot: { position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white' },
  chatContent: { flex: 1, overflow: 'hidden' },
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  chatName: { fontSize: '15px', fontWeight: '600', color: 'var(--text)' },
  chatTime: { fontSize: '12px', color: 'var(--text-light)' },
  chatPreview: { fontSize: '13px', color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};
