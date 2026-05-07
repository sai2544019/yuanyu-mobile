import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi, matchApi } from '../api/client';
import type { Message } from '../types';

export default function ChatPage() {
  const { convId } = useParams<{ convId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const myUserId = localStorage.getItem('yuanyu_user_id') || '';

  const loadMessages = async () => {
    if (!convId) return;
    try {
      const res = await chatApi.getMessages(convId);
      setMessages(res.data.data || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // 轮询3秒
    return () => clearInterval(interval);
  }, [convId]);

  const sendMessage = async () => {
    if (!input.trim() || !convId || sending) return;
    setSending(true);
    try {
      await chatApi.sendMessage(convId, 1, input.trim());
      setInput('');
      loadMessages();
    } catch {} finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* 顶栏 */}
      <div style={styles.topBar}>
        <span style={styles.backBtn} onClick={() => navigate(-1)}>←</span>
        <span style={styles.title}>聊天</span>
        <span style={styles.moreBtn}>⋮</span>
      </div>

      {/* 消息列表 */}
      <div className="scroll-y" style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((msg) => {
          const isMe = msg.senderId === myUserId || msg.id.startsWith('msg_');
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                ...styles.bubble,
                ...(isMe ? styles.myBubble : styles.theirBubble),
                ...(msg.isRecalled ? styles.recalledBubble : {}),
              }}>
                {msg.isRecalled ? (
                  <span style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>消息已撤回</span>
                ) : (
                  <>
                    {msg.type === 2 && msg.mediaUrl ? (
                      <img src={msg.mediaUrl} alt="" style={{ maxWidth: '200px', borderRadius: '12px' }} onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                    ) : (
                      <span>{msg.content}</span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{formatTime(msg.createdAt)}</span>
                      {isMe && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>✓</span>}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 输入框 */}
      <div style={styles.inputBar}>
        <input
          className="input"
          placeholder="输入消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          style={{ flex: 1, borderRadius: '20px', height: '42px' }}
        />
        <button
          className="btn btn-primary"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          style={{ height: '42px', borderRadius: '21px', padding: '0 20px', marginLeft: '8px' }}
        >
          {sending ? '...' : '发送'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topBar: { display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'white', borderBottom: '1px solid var(--border)', gap: '12px' },
  backBtn: { fontSize: '22px', cursor: 'pointer', padding: '4px' },
  title: { flex: 1, fontSize: '17px', fontWeight: '600', textAlign: 'center' },
  moreBtn: { fontSize: '20px', cursor: 'pointer', padding: '4px' },
  bubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: '18px', fontSize: '15px', lineHeight: '1.4' },
  myBubble: { background: 'var(--primary)', color: 'white', borderBottomRightRadius: '4px' },
  theirBubble: { background: 'white', color: 'var(--text)', borderBottomLeftRadius: '4px' },
  recalledBubble: { background: '#f0f0f0', color: 'var(--text-light)', fontStyle: 'italic' },
  inputBar: { display: 'flex', alignItems: 'center', padding: '10px 16px', background: 'white', borderTop: '1px solid var(--border)', paddingBottom: 'calc(env(safe-area-inset-bottom, 10px) + 10px)' },
};
