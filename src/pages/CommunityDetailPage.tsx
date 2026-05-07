import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityApi } from '../api/client';

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      communityApi.getCommunity(id),
      communityApi.getActivities(id),
      communityApi.getMembers(id),
    ]).then(([c, a, m]) => {
      setCommunity(c.data.data);
      setActivities(a.data.data || []);
      setMembers(m.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    if (!id) return;
    try {
      await communityApi.joinCommunity(id);
      setJoined(true);
    } catch {}
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading || !community) {
    return <div className="loading" style={{ height: '100vh' }}><div className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '32px' }}>
      {/* 封面图 */}
      <div style={{ position: 'relative', height: '200px' }}>
        <img
          src={community.coverUrl || 'https://picsum.photos/seed/' + community.id + '/600/300'}
          alt={community.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))' }} />
        <span style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white', fontSize: '20px', fontWeight: '700' }}>
          {community.name}
        </span>
        <span onClick={() => navigate(-1)} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '18px' }}>←</span>
      </div>

      {/* 社群信息 */}
      <div style={{ padding: '16px', background: 'white', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{community.memberCount}</span>
            <span style={styles.statLabel}>成员</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{community.onlineCount || 0}</span>
            <span style={styles.statLabel}>在线</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{community.category}</span>
            <span style={styles.statLabel}>分类</span>
          </div>
        </div>
        {community.description && (
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: '1.6' }}>{community.description}</p>
        )}
        {!joined && (
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px', height: '48px', borderRadius: '24px' }} onClick={handleJoin}>
            加入社群
          </button>
        )}
        {joined && (
          <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--success)', fontWeight: '600' }}>
            ✓ 已加入社群
          </div>
        )}
      </div>

      {/* 活动 */}
      {activities.length > 0 && (
        <div style={{ background: 'white', marginBottom: '12px' }}>
          <h3 style={{ padding: '16px 16px 8px', fontSize: '16px', fontWeight: '600', margin: 0 }}>近期活动</h3>
          {activities.map((act) => (
            <div key={act.id} style={{ padding: '14px 16px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>{act.title}</span>
                <span style={{ fontSize: '12px', color: 'var(--primary)', background: 'rgba(255,107,107,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                  {act.curAttendees}/{act.maxAttendees}人
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-sub)', display: 'flex', gap: '12px' }}>
                <span>📅 {formatDate(act.startTime)}</span>
                <span>📍 {act.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 成员 */}
      <div style={{ background: 'white' }}>
        <h3 style={{ padding: '16px 16px 8px', fontSize: '16px', fontWeight: '600', margin: 0 }}>
          活跃成员 ({members.length})
        </h3>
        <div style={{ padding: '8px 16px 16px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {members.slice(0, 20).map((m) => (
            <div key={m.userId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '60px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={m.avatarUrl || 'https://i.pravatar.cc/80?u=' + m.userId}
                  alt={m.nickname}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                {m.isOnline && (
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white' }} />
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '60px', textAlign: 'center' }}>
                {m.nickname}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  statBox: { flex: 1, textAlign: 'center', padding: '8px', background: '#f8f8f8', borderRadius: '8px' },
  statNum: { fontSize: '18px', fontWeight: '700', display: 'block' },
  statLabel: { fontSize: '12px', color: 'var(--text-sub)' },
};
