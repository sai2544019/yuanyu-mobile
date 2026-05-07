import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useStore } from '../store';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }
    if (nickname.trim().length < 2) {
      setError('昵称至少2个字');
      return;
    }
    if (nickname.trim().length > 12) {
      setError('昵称最多12个字');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = mode === 'register'
        ? await authApi.post('/auth/register', { nickname: nickname.trim() })
        : await authApi.post('/auth/login', { nickname: nickname.trim() });
      const data = res.data.data!;
      setAuth(data.access_token, data.refresh_token, {
        id: data.user.id,
        nickname: data.user.nickname,
        avatarUrl: data.user.avatar_url,
        isOnline: true,
        gender: 0,
        interests: [],
      });
      if (data.user.is_new) {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || (mode === 'register' ? '注册失败' : '登录失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Logo区域 */}
      <div style={styles.logoArea}>
        <div style={styles.logo}>◯</div>
        <h1 style={styles.appName}>缘 遇</h1>
        <p style={styles.slogan}>温暖连接，遇见有趣灵魂</p>
      </div>

      {/* 切换登录/注册 */}
      <div style={styles.modeToggle}>
        <button
          style={{ ...styles.toggleBtn, ...(mode === 'register' ? styles.toggleBtnActive : {}) }}
          onClick={() => { setMode('register'); setError(''); }}
        >
          一键注册
        </button>
        <button
          style={{ ...styles.toggleBtn, ...(mode === 'login' ? styles.toggleBtnActive : {}) }}
          onClick={() => { setMode('login'); setError(''); }}
        >
          已有账号登录
        </button>
      </div>

      {/* 表单 */}
      <div style={styles.form}>
        <input
          className="input"
          type="text"
          placeholder={mode === 'register' ? '给自己起个昵称（2-12字）' : '输入你的昵称登录'}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          maxLength={12}
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !nickname.trim()}
          style={styles.mainBtn}
        >
          {loading ? '处理中...' : mode === 'register' ? '注册并进入' : '登录'}
        </button>

        <p style={styles.hint}>
          {mode === 'register'
            ? '注册即表示你同意《用户协议》和《隐私政策》'
            : '首次使用此昵称将自动创建账号'}
        </p>
      </div>

      {/* 已有账号提示 */}
      {mode === 'register' && (
        <p style={styles.switch}>
          已有账号？<span style={styles.link} onClick={() => { setMode('login'); setError(''); }}>直接登录</span>
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    background: 'linear-gradient(135deg, #FFF5F5 0%, #FAFAFA 100%)',
  },
  logoArea: { alignItems: 'center', marginBottom: '40px' },
  logo: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'var(--primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px', color: 'white', marginBottom: '16px',
    boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
  },
  appName: { fontSize: '32px', fontWeight: '700', letterSpacing: '8px', color: 'var(--text)', marginBottom: '8px' },
  slogan: { fontSize: '14px', color: 'var(--text-sub)' },
  modeToggle: {
    display: 'flex',
    background: '#f0f0f0',
    borderRadius: '25px',
    padding: '4px',
    marginBottom: '32px',
    gap: '4px',
  },
  toggleBtn: {
    padding: '8px 20px',
    borderRadius: '20px',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    cursor: 'pointer',
    color: 'var(--text-sub)',
    transition: 'all 0.2s',
  },
  toggleBtnActive: {
    background: 'white',
    color: 'var(--primary)',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  form: { width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { height: '52px', fontSize: '16px' },
  mainBtn: { height: '52px', borderRadius: '26px', fontSize: '16px', marginTop: '8px' },
  error: { color: 'var(--error)', fontSize: '13px', textAlign: 'center', marginTop: '-8px' },
  hint: { fontSize: '11px', color: 'var(--text-light)', textAlign: 'center', marginTop: '-4px' },
  switch: { marginTop: '24px', fontSize: '13px', color: 'var(--text-sub)' },
  link: { color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' },
};
