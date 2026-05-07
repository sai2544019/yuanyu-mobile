import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, communityApi } from '../api/client';
import { useStore } from '../store';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, setMyCommunities } = useStore();
  const [myCommunities, setMyCommunitiesState] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ matches: 0, likes: 0 });

  useEffect(() => {
    userApi.getMe().then((res) => {
      setProfile(res.data.data);
    }).catch(() => {});
    communityApi.getMyCommunities().then((res) => {
      setMyCommunitiesState(res.data.data || []);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>我的</h1>
      </div>

      <div className="scroll-y" style={{ flex: 1 }}>
        {/* 用户卡片 */}
        <div style={styles.profileCard}>
          <div style={styles.avatarWrap}>
            <img
              src={profile?.avatar_url || profile?.photos?.[0] || 'https://i.pravatar.cc/200'}
              alt="头像"
              style={styles.avatar}
            />
            {profile?.is_online && <div style={styles.onlineDot} />}
          </div>
          <div style={styles.profileInfo}>
            <h2 style={styles.nickname}>{profile?.nickname || '加载中...'}</h2>
            <p style={styles.profileMeta}>
              {profile?.city || ''} {profile?.district ? `· ${profile.district}` : ''}
            </p>
            <div style={styles.verifyRow}>
              {profile?.is_verified && <span className="tag" style={{ background: 'rgba(0,184,148,0.1)', color: 'var(--success)' }}>✅ 已认证</span>}
              {profile?.vip_status > 0 && <span className="tag" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--primary)' }}>⭐ 会员</span>}
            </div>
          </div>
          <button style={styles.editBtn} onClick={() => navigate('/profile/edit')}>✏️</button>
        </div>

        {/* 数据统计 */}
        <div style={styles.statsRow}>
          {[{ label: '喜欢我', value: stats.likes, icon: '♥' }, { label: '匹配', value: stats.matches, icon: '💕' }, { label: '社群', value: myCommunities.length, icon: '👥' }].map((s) => (
            <div key={s.label} style={styles.statItem}>
              <span style={styles.statIcon}>{s.icon}</span>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* 兴趣标签 */}
        {(profile?.interests?.length > 0) && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>兴趣标签</h3>
            <div style={styles.tagList}>
              {(profile?.interests || []).map((tag: string) => (
                <span key={tag} className="tag tag-primary">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* 我的社群 */}
        {myCommunities.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>我的社群</h3>
            {myCommunities.map((c) => (
              <div key={c.id} style={styles.communityRow} onClick={() => navigate(`/community/${c.id}`)}>
                <img src={c.coverUrl || 'https://picsum.photos/seed/' + c.id + '/80/80'} alt={c.name} style={styles.communityThumb} />
                <div style={{ flex: 1 }}>
                  <p style={styles.communityName}>{c.name}</p>
                  <p style={styles.communityMembers}>👥 {c.memberCount}人</p>
                </div>
                <span style={styles.arrow}>›</span>
              </div>
            ))}
          </div>
        )}

        {/* 功能菜单 */}
        <div style={styles.menuSection}>
          {[
            { icon: '🛡', label: '隐私设置', action: () => {} },
            { icon: '📊', label: '谁看过我', action: () => {} },
            { icon: '⭐', label: '会员中心', action: () => {} },
            { icon: '❓', label: '帮助与反馈', action: () => {} },
            { icon: '📖', label: '用户协议', action: () => {} },
          ].map((item) => (
            <div key={item.label} style={styles.menuRow} onClick={item.action}>
              <span style={styles.menuIcon}>{item.icon}</span>
              <span style={styles.menuLabel}>{item.label}</span>
              <span style={styles.menuArrow}>›</span>
            </div>
          ))}
        </div>

        {/* 退出 */}
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <button onClick={handleLogout} style={styles.logoutBtn}>退出登录</button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { padding: '16px 16px 8px', background: 'white', borderBottom: '1px solid var(--border)' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text)' },
  profileCard: { display: 'flex', gap: '16px', padding: '20px 16px', background: 'white', alignItems: 'center' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' },
  onlineDot: { position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white' },
  profileInfo: { flex: 1 },
  nickname: { fontSize: '20px', fontWeight: '700', margin: '0 0 4px' },
  profileMeta: { fontSize: '13px', color: 'var(--text-sub)', margin: '0 0 8px' },
  verifyRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  editBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#f0f0f0', fontSize: '18px', cursor: 'pointer' },
  statsRow: { display: 'flex', padding: '16px', background: 'white', marginTop: '12px', justifyContent: 'space-around' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statIcon: { fontSize: '20px' },
  statValue: { fontSize: '20px', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: 'var(--text-sub)' },
  section: { background: 'white', padding: '16px', marginTop: '12px' },
  sectionTitle: { fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: 'var(--text)' },
  tagList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  communityRow: { display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', alignItems: 'center' },
  communityThumb: { width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  communityName: { fontSize: '14px', fontWeight: '600', margin: '0 0 2px' },
  communityMembers: { fontSize: '12px', color: 'var(--text-sub)', margin: 0 },
  arrow: { fontSize: '20px', color: 'var(--text-light)' },
  menuSection: { background: 'white', marginTop: '12px' },
  menuRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  menuIcon: { fontSize: '20px' },
  menuLabel: { flex: 1, fontSize: '15px' },
  menuArrow: { fontSize: '20px', color: 'var(--text-light)' },
  logoutBtn: { background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '15px', cursor: 'pointer', padding: '8px' },
};
