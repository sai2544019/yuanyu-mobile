import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi, matchApi } from '../api/client';
import type { User } from '../types';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'skip' | 'like' | null>(null);

  useEffect(() => {
    if (!id) return;
    userApi.getUserProfile(id).then((res) => {
      setUser(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSwipe = async (act: 'skip' | 'like') => {
    if (!id || !user || action) return;
    setAction(act);
    try {
      const res = await matchApi.swipe(id, act === 'skip' ? 1 : 2);
      if (res.data.data?.result === 'matched') {
        alert('🎉 匹配成功！');
      }
      setTimeout(() => navigate(-1), 500);
    } catch {
      navigate(-1);
    }
  };

  if (loading || !user) {
    return <div className="loading" style={{ height: '100vh' }}><div className="spinner" /></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '120px' }}>
      {/* 照片 */}
      <div style={{ position: 'relative', height: '60vh' }}>
        <img
          src={user.avatarUrl || 'https://i.pravatar.cc/400'}
          alt={user.nickname}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname)}&background=FF6B6B&color=fff&size=400`; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6))' }} />
        <span onClick={() => navigate(-1)} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer' }}>←</span>
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '700' }}>{user.nickname}</span>
            <span style={{ fontSize: '16px' }}>{user.age || 25}岁</span>
            {user.isVerified && <span>✅</span>}
          </div>
          <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📍 {user.city || '未知'} {user.district && `· ${user.district}`}
            {user.distance && ` · ${user.distance.toFixed(1)}km`}
          </div>
        </div>
      </div>

      {/* 信息 */}
      <div style={{ padding: '16px', background: 'white' }}>
        {user.bio && (
          <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '16px' }}>{user.bio}</p>
        )}

        {(user.interests?.length ?? 0) > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-sub)' }}>兴趣标签</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(user.interests || []).map((tag) => (
                <span key={tag} className="tag tag-primary">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {(user.questions?.length ?? 0) > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-sub)' }}>真心话</h4>
            {(user.questions || []).map((q) => (
              <div key={q.id} style={{ padding: '12px', background: '#f8f8f8', borderRadius: '10px', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '4px' }}>❓ {q.question}</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>💬 {q.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div style={{ position: 'fixed', bottom: '80px', left: 0, right: 0, padding: '16px 24px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', gap: '24px' }}>
        <button
          style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', background: 'white', boxShadow: 'var(--shadow)', fontSize: '24px', cursor: 'pointer' }}
          onClick={() => handleSwipe('skip')}
          disabled={!!action}
        >
          ✕
        </button>
        <button
          style={{ width: '72px', height: '72px', borderRadius: '50%', border: 'none', background: 'var(--primary)', boxShadow: '0 4px 16px rgba(255,107,107,0.4)', fontSize: '32px', color: 'white', cursor: 'pointer' }}
          onClick={() => handleSwipe('like')}
          disabled={!!action}
        >
          ♥
        </button>
        <button
          style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--secondary)', background: 'white', fontSize: '24px', cursor: 'pointer' }}
          onClick={() => handleSwipe('like')}
          disabled={!!action}
        >
          ⭐
        </button>
      </div>
    </div>
  );
}
