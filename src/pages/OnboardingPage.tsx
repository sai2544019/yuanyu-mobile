import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/client';
import { useStore } from '../store';

const INTERESTS = [
  '跑步', '健身', '游泳', '篮球', '羽毛球', '网球', '瑜伽', '骑行',
  '摇滚', '后摇', '流行', '民谣', '爵士', '古典', '说唱',
  '咖啡', '美食', '烹饪', '品酒', '素食',
  '阅读', '写作', '摄影', '绘画', '设计',
  '旅行', '户外', '徒步', '登山', '露营',
  '电影', '追剧', '综艺', '游戏', '电竞',
  '科技', '投资', '职场', '冥想', '养宠物',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<number>(0);
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 15 ? [...prev, tag] : prev
    );
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await userApi.updateMe({ nickname, gender, city, bio });
      if (selectedInterests.length >= 5) {
        await userApi.updateInterests(selectedInterests);
      }
      navigate('/');
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Step 0: 基本资料 */}
      {step === 0 && (
        <div style={styles.step}>
          <h2 style={styles.title}>告诉我们关于你</h2>
          <div style={styles.field}>
            <label style={styles.label}>昵称</label>
            <input className="input" placeholder="给自己起个昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>性别</label>
            <div style={styles.genderRow}>
              {[{ v: 1, l: '男' }, { v: 2, l: '女' }, { v: 3, l: '其他' }].map((g) => (
                <button
                  key={g.v}
                  style={{ ...styles.genderBtn, ...(gender === g.v ? styles.genderBtnActive : {}) }}
                  onClick={() => setGender(g.v)}
                >
                  {g.l}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>城市</label>
            <input className="input" placeholder="如：深圳" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>个人介绍（选填）</label>
            <textarea className="input" placeholder="简单介绍一下自己..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ resize: 'none', height: '80px' }} />
          </div>
          <button className="btn btn-primary" style={styles.nextBtn} onClick={() => setStep(1)} disabled={!nickname || !gender || !city}>
            下一步
          </button>
        </div>
      )}

      {/* Step 1: 兴趣选择 */}
      {step === 1 && (
        <div style={styles.step}>
          <h2 style={styles.title}>选择你的兴趣</h2>
          <p style={styles.subtitle}>至少选择5个，已选 {selectedInterests.length}/15</p>
          <div style={styles.interestGrid}>
            {INTERESTS.map((tag) => (
              <button
                key={tag}
                style={{
                  ...styles.interestTag,
                  ...(selectedInterests.includes(tag) ? styles.interestTagActive : {}),
                }}
                onClick={() => toggleInterest(tag)}
              >
                {selectedInterests.includes(tag) ? '✓ ' : ''}{tag}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={styles.nextBtn}
            onClick={saveProfile}
            disabled={selectedInterests.length < 5 || loading}
          >
            {loading ? '保存中...' : '完成注册，开启缘遇'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', padding: '48px 24px 32px', display: 'flex', flexDirection: 'column' },
  step: { flex: 1, display: 'flex', flexDirection: 'column' },
  title: { fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' },
  subtitle: { fontSize: '14px', color: 'var(--text-sub)', marginBottom: '20px' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' },
  genderRow: { display: 'flex', gap: '12px' },
  genderBtn: {
    flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border)',
    background: 'white', fontSize: '15px', cursor: 'pointer', color: 'var(--text-sub)',
  },
  genderBtnActive: { borderColor: 'var(--primary)', background: 'rgba(255,107,107,0.08)', color: 'var(--primary)', fontWeight: '600' },
  interestGrid: { flex: 1, display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', overflowY: 'auto', maxHeight: 'calc(100vh - 260px)' },
  interestTag: {
    padding: '8px 14px', borderRadius: '20px', border: '1.5px solid var(--border)',
    background: 'white', fontSize: '13px', cursor: 'pointer', color: 'var(--text-sub)',
    transition: 'all 0.15s ease',
  },
  interestTagActive: { borderColor: 'var(--primary)', background: 'var(--primary)', color: 'white', fontWeight: '600' },
  nextBtn: { height: '52px', borderRadius: '26px', fontSize: '16px', marginTop: 'auto' },
};
