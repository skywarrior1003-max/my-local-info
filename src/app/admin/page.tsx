'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  id: string;
  sessionId: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp?: string;
}

interface SessionMap {
  [sessionId: string]: ChatMessage[];
}

const PASSWORD = 'admin1234';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [sessions, setSessions] = useState<SessionMap>({});
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [adminInput, setAdminInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const lastIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const poll = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (lastIdRef.current) params.set('lastId', lastIdRef.current);

      const res = await fetch(`/api/chat-poll?${params}`);
      const data = await res.json();
      const incoming: ChatMessage[] = data.messages ?? [];

      if (incoming.length > 0) {
        setSessions((prev) => {
          const updated = { ...prev };
          for (const msg of incoming) {
            if (!updated[msg.sessionId]) updated[msg.sessionId] = [];
            // 중복 방지
            if (!updated[msg.sessionId].find((m) => m.id === msg.id)) {
              updated[msg.sessionId] = [...updated[msg.sessionId], msg];
            }
          }
          return updated;
        });
        lastIdRef.current = incoming[incoming.length - 1].id;
      }
    } catch {
      // 폴링 오류 무시
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, poll]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, selectedSession]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInput.trim() || !selectedSession || isSending) return;

    setIsSending(true);
    const text = adminInput.trim();
    setAdminInput('');

    // 낙관적 업데이트
    const tempMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sessionId: selectedSession,
      text,
      sender: 'admin',
    };
    setSessions((prev) => ({
      ...prev,
      [selectedSession]: [...(prev[selectedSession] ?? []), tempMsg],
    }));

    try {
      await fetch('/api/chat-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: selectedSession, message: text, sender: 'admin' }),
      });
    } catch {
      // 실패 시 무시
    } finally {
      setIsSending(false);
    }
  };

  const sessionIds = Object.keys(sessions);
  const selectedMessages = selectedSession ? (sessions[selectedSession] ?? []) : [];

  // 세션 레이블: 방문자 1, 2, 3...
  const sessionLabel = (id: string) => {
    const idx = sessionIds.indexOf(id);
    return `방문자 ${idx + 1}`;
  };

  // 미답변 메시지 수 (user 메시지 중 마지막이 user인 세션)
  const hasUnread = (id: string) => {
    const msgs = sessions[id];
    if (!msgs || msgs.length === 0) return false;
    return msgs[msgs.length - 1].sender === 'user';
  };

  // ── 로그인 화면 ──────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C8.676 1 6 3.676 6 7v1H4v14h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-800 text-center mb-1">관리자 로그인</h1>
          <p className="text-sm text-gray-400 text-center mb-6">상담 관리 페이지</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              placeholder="비밀번호를 입력하세요"
              autoFocus
              className={[
                'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors',
                passwordError
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-blue-400',
              ].join(' ')}
            />
            {passwordError && (
              <p className="text-xs text-red-500">비밀번호가 올바르지 않습니다.</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── 관리자 상담 화면 ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-bold text-base">관리자 상담 페이지</h1>
          <p className="text-xs text-blue-200">{sessionIds.length}개 세션 연결됨</p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 세션 목록 */}
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">방문자 목록</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessionIds.length === 0 ? (
              <p className="text-xs text-gray-400 text-center mt-8 px-4">
                아직 상담 요청이 없습니다
              </p>
            ) : (
              sessionIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedSession(id)}
                  className={[
                    'w-full text-left px-4 py-3 border-b border-gray-50 transition-colors flex items-center gap-2',
                    selectedSession === id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700',
                  ].join(' ')}
                >
                  <span className="text-sm font-medium flex-1">{sessionLabel(id)}</span>
                  {hasUnread(id) && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* 대화 영역 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              왼쪽에서 방문자를 선택하세요
            </div>
          ) : (
            <>
              {/* 대화창 헤더 */}
              <div className="px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
                <p className="text-sm font-semibold text-gray-800">
                  {sessionLabel(selectedSession)}
                </p>
                <p className="text-xs text-gray-400">{selectedSession}</p>
              </div>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
                {selectedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'admin' && (
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1C8.676 1 6 3.676 6 7v1H4v14h16V8h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 110 4 2 2 0 010-4z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={[
                        'max-w-[70%] px-4 py-2.5 text-sm leading-relaxed',
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm',
                      ].join(' ')}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 답장 입력창 */}
              <form
                onSubmit={handleReply}
                className="border-t border-gray-200 bg-white px-4 py-3 flex gap-2 items-center flex-shrink-0"
              >
                <input
                  type="text"
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  disabled={isSending}
                  placeholder="방문자에게 답장하기..."
                  className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 outline-none focus:border-blue-400 disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={isSending || !adminInput.trim()}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="전송"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
