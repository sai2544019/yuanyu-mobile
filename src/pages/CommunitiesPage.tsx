import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../api/client';

const CATEGORIES = ['全部', '运动', '音乐', '美食', '户外', '职场', '读书', '旅行', '亲子', '科技'];

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<any[]>([]);
  const [category, setCategory] = useState('全部');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    communityApi.getCommunities(category === '全部' ? undefined : category)
      .then((res) => setCommunities(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>发现社群</h1>
      </div>

      {/* 分类标签 */}
      <div style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{ ...styles.catBtn, ...(category === cat ? styles.catBtnActive : {}) }}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 社群列表 */}
      <div className="scroll-y" style={{ flex: 1, padding: '12px 16px' }}>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : communities.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🔍</div>
            <h3>暂无相关社群</h3>
            <p>换个分类试试吧</p>
          </div>
        ) : (
          communities.map((c) => (
            <div key={c.id} style={styles.communityCard} onClick={() => navigate(`/community/${c.id}`)}>
              <img
                src={c.coverUrl || 'https://picsum.photos/seed/' + c.id + '/200/120'}
                alt={c.name}
                style={styles.communityCover}
              />
              <div style={styles.communityInfo}>
                <h3 style={styles.communityName}>{c.name}</h3>
                <div style={styles.communityMeta}>
                  <span>👥 {c.memberCount}人</span>
                  <span>·</span>
                  <span>{c.category}</span>
                  <span>·</span>
                  <span>{c.city || '全国'}</span>
                </div>
                {c.description && (
                  <p style={styles.communityDesc}>{c.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { padding: '16px 16px 8px', background: 'white', borderBottom: '1px solid var(--border)' },
  headerTitle: { fontSize: '24px', fontWeight: '700', color: 'var(--text)' },
  categories: { display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', background: 'white', borderBottom: '1px solid var(--border)', WebkitOverflowScrolling: 'touch' },
  catBtn: { padding: '6px 14px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'white', fontSize: '13px', cursor: 'pointer', color: 'var(--text-sub)', whiteSpace: 'nowrap', flexShrink: 0 },
  catBtnActive: { borderColor: 'var(--primary)', background: 'var(--primary)', color: 'white', fontWeight: '600' },
  communityCard: { display: 'flex', gap: '12px', background: 'white', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', boxShadow: 'var(--shadow)', cursor: 'pointer' },
  communityCover: { width: '100px', height: '100px', objectFit: 'cover', flexShrink: 0 },
  communityInfo: { flex: 1, padding: '12px 12px 12px 0', display: 'flex', flexDirection: 'column', gap: '4px' },
  communityName: { fontSize: '15px', fontWeight: '600', color: 'var(--text)', margin: 0 },
  communityMeta: { fontSize: '12px', color: 'var(--text-sub)', display: 'flex', gap: '4px' },
  communityDesc: { fontSize: '12px', color: 'var(--text-sub)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4', margin: 0 },
};
