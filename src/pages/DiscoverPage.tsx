import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, matchApi } from '../api/client';
import { useStore } from '../store';
import type { User } from '../types';

const SwipeCard = ({
  user,
  onSwipe,
  isTop,
}: {
  user: User;
  onSwipe: (action: 'skip' | 'like' | 'superlike') => void;
  isTop: boolean;
}) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const offsetX = useRef(0);
  const offsetY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showLikeOverlay, setShowLikeOverlay] = useState(false);
  const [showSkipOverlay, setShowSkipOverlay] = useState(false);
  const [showSuperOverlay, setShowSuperOverlay] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTop) return;
    offsetX.current = e.touches[0].clientX - startX.current;
    offsetY.current = e.touches[0].clientY - startY.current;
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${offsetX.current}px, ${offsetY.current}px) rotate(${offsetX.current * 0.05}deg)`;
      setShowLikeOverlay(offsetX.current > 30);
      setShowSkipOverlay(offsetX.current < -30);
      setShowSuperOverlay(offsetY.current < -40);
    }
  };

  const handleTouchEnd = () => {
    if (!isTop) return;
    if (offsetX.current > 80) {
      onSwipe('like');
    } else if (offsetX.current < -80) {
      onSwipe('skip');
    } else if (offsetY.current < -80) {
      onSwipe('superlike');
    } else {
      // 回弹
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease';
        cardRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
        setTimeout(() => {
          if (cardRef.current) cardRef.current.style.transition = '';
        }, 300);
      }
    }
    offsetX.current = 0;
    offsetY.current = 0;
    setShowLikeOverlay(false);
    setShowSkipOverlay(false);
    setShowSuperOverlay(false);
  };

  const age = user.age || 25;

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute', inset: 0,
        background: 'white', borderRadius: '20px',
        overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
        transition: isTop ? '' : 'none',
        userSelect: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 照片 */}
      <div style={{ position: 'relative', height: '65%', overflow: 'hidden' }}>
        <img
          src={user.avatarUrl || 'https://i.pravatar.cc/400'}
          alt={user.nickname}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname)}&background=FF6B6B&color=fff&size=400`; }}
        />

        {/* 滑动覆盖层 */}
        {showLikeOverlay && (
          <div style={overlayStyles.like}>
            <span style={overlayStyles.likeText}>LIKE</span>
          </div>
        )}
        {showSkipOverlay && (
          <div style={overlayStyles.skip}>
            <span style={overlayStyles.skipText}>SKIP</span>
          </div>
        )}
        {showSuperOverlay && (
          <div style={overlayStyles.super}>
            <span style={overlayStyles.superText}>SUPER</span>
          </div>
        )}

        {/* 照片指示器 */}
        <div style={styles.photoIndicator}>
          {(user.photos || [user.avatarUrl]).slice(0, 5).map((_, i) => (
            <div key={i} style={{ ...styles.photoDot, background: i === 0 ? 'white' : 'rgba(255,255,255,0.5)', width: i === 0 ? '8px' : '6px', height: i === 0 ? '8px' : '6px' }} />
          ))}
        </div>

        {/* 在线状态 */}
        {user.isOnline && (
          <div style={styles.onlineBadge}>🟢 在线</div>
        )}
      </div>

      {/* 信息 */}
      <div style={{ padding: '16px 20px', height: '35%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px', fontWeight: '700' }}>{user.nickname}</span>
          <span style={{ fontSize: '16px', color: 'var(--text-sub)' }}>{age}岁</span>
          {user.isVerified && <span style={{ fontSize: '14px' }}>✅</span>}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          📍 {user.city || '未知'} {user.district || ''} {user.distance ? `· ${user.distance.toFixed(1)}km` : ''}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
          {(user.interests || []).slice(0, 5).map((tag) => (
            <span key={tag} className="tag tag-primary">{tag}</span>
          ))}
        </div>
        {user.bio && (
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginTop: '4px', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            💬 {user.bio}
          </p>
        )}
      </div>
    </div>
  );
};

const overlayStyles: Record<string, React.CSSProperties> = {
  like: { position: 'absolute', top: '40px', right: '20px', padding: '8px 16px', border: '4px solid var(--success)', borderRadius: '8px', transform: 'rotate(20deg)' },
  likeText: { fontSize: '28px', fontWeight: '900', color: 'var(--success)' },
  skip: { position: 'absolute', top: '40px', left: '20px', padding: '8px 16px', border: '4px solid var(--text-sub)', borderRadius: '8px', transform: 'rotate(-20deg)' },
  skipText: { fontSize: '28px', fontWeight: '900', color: 'var(--text-sub)' },
  super: { position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', padding: '8px 24px', border: '4px solid var(--secondary)', borderRadius: '8px' },
  superText: { fontSize: '28px', fontWeight: '900', color: 'var(--secondary)' },
};

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { discoverFeed, setDiscoverFeed, nextDiscoverUser, currentDiscoverIndex } = useStore();
  const [loading, setLoading] = useState(false);
  const [matchModal, setMatchModal] = useState<User | null>(null);

  const loadFeed = async (prefGender = 2) => {
    setLoading(true);
    try {
      const res = await userApi.getDiscover(prefGender);
      setDiscoverFeed(res.data.data || []);
    } catch {
      console.error('加载发现页失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSwipe = async (action: 'skip' | 'like' | 'superlike') => {
    const currentUser = discoverFeed[currentDiscoverIndex];
    if (!currentUser) return;

    try {
      const actionMap = { skip: 1, like: 2, superlike: 3 };
      const res = await matchApi.swipe(currentUser.id, actionMap[action]);
      const data = res.data.data!;

      if (data.result === 'matched') {
        setMatchModal(currentUser);
      }
    } catch {
      console.error('滑动失败');
    }

    nextDiscoverUser();

    // 自动加载更多
    if (currentDiscoverIndex >= discoverFeed.length - 3) {
      loadFeed();
    }
  };

  const currentUser = discoverFeed[currentDiscoverIndex];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* 顶栏 */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <span style={styles.logo}>缘 遇</span>
        </div>
        <div style={styles.topBarRight}>
          <span style={styles.topBtn}>🔍</span>
          <span style={styles.topBtn}>🔔</span>
        </div>
      </div>

      {/* 卡片区域 */}
      <div style={{ flex: 1, padding: '12px 16px', position: 'relative' }}>
        {loading && discoverFeed.length === 0 ? (
          <div className="loading"><div className="spinner" /></div>
        ) : currentUser ? (
          <>
            {/* 叠卡效果 */}
            {discoverFeed.slice(currentDiscoverIndex, currentDiscoverIndex + 2).reverse().map((user, i, arr) => (
              <div
                key={user.id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: arr.length - i,
                  transform: i === 0 ? 'none' : `scale(${0.97 - i * 0.01}) translateY(${i * 6}px)`,
                }}
              >
                <SwipeCard
                  user={user}
                  onSwipe={handleSwipe}
                  isTop={i === 0}
                />
              </div>
            ))}
          </>
        ) : (
          <div className="empty-state" style={{ height: '100%' }}>
            <div className="emoji">🌙</div>
            <h3>附近没有新用户了</h3>
            <p>试试调整筛选条件或稍后再来</p>
            <button className="btn btn-primary" onClick={() => loadFeed()}>刷新看看</button>
          </div>
        )}
      </div>

      {/* 底部操作按钮 */}
      {currentUser && (
        <div style={styles.actionBar}>
          <button style={styles.actionBtn} onClick={() => handleSwipe('skip')}>
            <span style={{ fontSize: '28px' }}>✕</span>
          </button>
          <button style={{ ...styles.actionBtn, ...styles.actionBtnSuper }} onClick={() => handleSwipe('superlike')}>
            <span style={{ fontSize: '28px' }}>⭐</span>
          </button>
          <button style={{ ...styles.actionBtn, ...styles.actionBtnLike }} onClick={() => handleSwipe('like')}>
            <span style={{ fontSize: '32px', color: 'white' }}>♥</span>
          </button>
        </div>
      )}

      {/* 匹配成功弹窗 */}
      {matchModal && (
        <div style={styles.matchOverlay} onClick={() => setMatchModal(null)}>
          <div style={styles.matchCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.matchHearts}>
              <span>💕</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '16px 0 8px', color: 'var(--primary)' }}>
              匹配成功！
            </h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '20px' }}>
              你们互相喜欢了对方
            </p>
            <img
              src={matchModal.avatarUrl || 'https://i.pravatar.cc/200'}
              alt={matchModal.nickname}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }}
            />
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{matchModal.nickname}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '24px' }}>{matchModal.city}</p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '12px' }}
              onClick={() => {
                setMatchModal(null);
                navigate('/messages');
              }}
            >
              💬 发送消息
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => setMatchModal(null)}
            >
              继续滑动
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', background: 'white', borderBottom: '1px solid var(--border)',
  },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  logo: { fontSize: '20px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '2px' },
  topBarRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  topBtn: { fontSize: '20px', cursor: 'pointer', padding: '4px' },
  photoIndicator: {
    position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
    display: 'flex', gap: '4px', alignItems: 'center',
  },
  photoDot: { borderRadius: '50%', transition: 'all 0.2s' },
  onlineBadge: {
    position: 'absolute', bottom: '12px', left: '12px',
    background: 'rgba(0,0,0,0.5)', color: 'white',
    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
  },
  actionBar: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px',
    padding: '16px 24px 32px', background: 'var(--bg)',
  },
  actionBtn: {
    width: '60px', height: '60px', borderRadius: '50%',
    background: 'white', border: 'none', boxShadow: 'var(--shadow)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'transform 0.15s',
  },
  actionBtnSuper: { width: '50px', height: '50px', border: '2px solid var(--secondary)' },
  actionBtnLike: {
    width: '72px', height: '72px',
    background: 'var(--primary)', boxShadow: '0 4px 16px rgba(255,107,107,0.4)',
  },
  matchOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  },
  matchCard: {
    background: 'white', borderRadius: '24px', padding: '32px 24px',
    width: '85%', maxWidth: '360px', textAlign: 'center',
    animation: 'matchAnim 0.5s ease',
  },
  matchHearts: { fontSize: '64px', animation: 'pulse 1s infinite' },
  matchHeart: { fontSize: '64px' },
};
