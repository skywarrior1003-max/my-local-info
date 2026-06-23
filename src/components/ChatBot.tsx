'use client';

import { useState, useEffect, useRef } from 'react';
import chatData from '../../chat-data.json';

interface FAQ {
  question: string;
  answer: string;
}

interface Message {
  type: 'user' | 'bot';
  text: string;
}

interface PollMessage {
  id: string;
  text: string;
  sender: string;
}

const GREETING = '안녕하세요! 궁금한 점을 아래 버튼으로 선택하거나 직접 입력해보세요. 😊';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', text: GREETING },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // 2초마다 상담원 메시지 폴링
  useEffect(() => {
    if (!isHumanMode) return;

    const poll = async () => {
      try {
        const params = new URLSearchParams({ sessionId });
        if (lastMessageIdRef.current) params.set('lastId', lastMessageIdRef.current);

        const res = await fetch(`/api/chat-poll?${params}`);
        const data = await res.json();

        const adminMsgs: PollMessage[] = (data.messages ?? []).filter(
          (m: PollMessage) => m.sender === 'admin'
        );
        if (adminMsgs.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...adminMsgs.map((m) => ({ type: 'bot' as const, text: m.text })),
          ]);
          lastMessageIdRef.current = adminMsgs[adminMsgs.length - 1].id;
        }
      } catch {
        // 폴링 오류는 무시
      }
    };

    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [isHumanMode, sessionId]);

  // AI 모드: /api/chat 호출
  const sendQuestion = async (question: string) => {
    if (isLoading || !question.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', text: question }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      const answer = data.answer ?? '답변을 가져오지 못했습니다.';
      setMessages((prev) => [...prev, { type: 'bot', text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 상담원 모드: /api/chat-human 호출
  const sendHumanMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { type: 'user', text }]);

    try {
      await fetch('/api/chat-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text, sender: 'user' }),
      });
    } catch {
      // 전송 실패는 무시 (메시지는 이미 표시됨)
    }
  };

  const connectHuman = () => {
    setIsHumanMode(true);
    lastMessageIdRef.current = null;
    setMessages((prev) => [
      ...prev,
      { type: 'bot', text: '상담원 연결을 요청했습니다. 잠시만 기다려주세요...' },
    ]);
  };

  const disconnectHuman = () => {
    setIsHumanMode(false);
    setMessages((prev) => [
      ...prev,
      { type: 'bot', text: 'AI 상담 모드로 돌아왔습니다. 무엇이든 물어보세요!' },
    ]);
  };

  const handleQuestion = (faq: FAQ) => sendQuestion(faq.question);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (isHumanMode) {
      sendHumanMessage(input);
    } else {
      sendQuestion(input);
    }
    setInput('');
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={[
          'fixed z-50 flex flex-col bg-white overflow-hidden shadow-2xl',
          'transition-all duration-300 ease-in-out',
          'inset-0 rounded-none',
          'sm:inset-auto sm:bottom-20 sm:right-4 sm:w-[360px] sm:h-[500px] sm:rounded-2xl',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div
          className={[
            'flex items-center justify-between px-4 py-3 text-white flex-shrink-0 transition-colors duration-300',
            isHumanMode ? 'bg-orange-500' : 'bg-blue-600',
          ].join(' ')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">
                {isHumanMode ? '실시간 상담' : '다이내믹 놀자'}
              </p>
              <p className="text-xs text-white/70 flex items-center gap-1">
                <span
                  className={[
                    'inline-block w-1.5 h-1.5 rounded-full',
                    isHumanMode ? 'bg-yellow-300 animate-pulse' : 'bg-green-400',
                  ].join(' ')}
                />
                {isHumanMode ? '상담원 대기 중' : '온라인'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="채팅창 닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'bot' && (
                <div
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                    isHumanMode ? 'bg-orange-500' : 'bg-blue-600',
                  ].join(' ')}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
              )}
              <div
                className={[
                  'max-w-[75%] px-4 py-2.5 text-sm leading-relaxed',
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm',
                ].join(' ')}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator (AI 모드만) */}
          {isLoading && !isHumanMode && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* AI 모드: FAQ 버튼 + 상담원 연결 버튼 */}
        {!isHumanMode && (
          <div className="border-t border-gray-100 bg-white px-3 pt-3 pb-2 flex-shrink-0">
            <p className="text-xs text-gray-400 mb-2 text-center">자주 묻는 질문</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(chatData as FAQ[]).map((faq, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestion(faq)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 active:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {faq.question}
                </button>
              ))}
            </div>
            <button
              onClick={connectHuman}
              className="w-full text-xs py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors font-medium"
            >
              상담원 연결
            </button>
          </div>
        )}

        {/* 상담원 모드: AI로 돌아가기 버튼 */}
        {isHumanMode && (
          <div className="border-t border-gray-100 bg-white px-3 pt-2 pb-2 flex-shrink-0">
            <button
              onClick={disconnectHuman}
              className="w-full text-xs py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors font-medium"
            >
              AI 상담으로 돌아가기
            </button>
          </div>
        )}

        {/* Text Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-100 bg-white px-3 py-2 flex gap-2 items-center flex-shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading && !isHumanMode}
            placeholder={isHumanMode ? '상담원에게 메시지를 입력하세요...' : '직접 질문을 입력하세요...'}
            className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={(isLoading && !isHumanMode) || !input.trim()}
            className={[
              'w-9 h-9 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              isHumanMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
            aria-label="전송"
          >
            {isLoading && !isHumanMode ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={[
          'fixed bottom-4 right-4 z-[60]',
          'w-14 h-14 bg-sky-300 hover:bg-sky-400 text-white rounded-full shadow-lg',
          'flex items-center justify-center',
          'transition-all duration-300 hover:scale-110 active:scale-95',
          isOpen ? 'hidden sm:flex' : 'flex',
        ].join(' ')}
        aria-label={isOpen ? '채팅창 닫기' : '채팅 열기'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </button>
    </>
  );
}
