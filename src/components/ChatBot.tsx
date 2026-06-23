'use client';

import { useState, useEffect, useRef } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface ChatData {
  botName: string;
  greeting: string;
  faqs: FAQ[];
}

interface Message {
  type: 'user' | 'bot';
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/chat-data.json')
      .then((r) => r.json())
      .then((data: ChatData) => {
        setChatData(data);
        setMessages([{ type: 'bot', text: data.greeting }]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleQuestion = (faq: FAQ) => {
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: faq.question },
      { type: 'bot', text: faq.answer },
    ]);
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
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">
                {chatData?.botName ?? 'AI 상담원'}
              </p>
              <p className="text-xs text-blue-200 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full" />
                온라인
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
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
          <div ref={messagesEndRef} />
        </div>

        {/* FAQ Buttons */}
        <div className="border-t border-gray-100 bg-white p-3 flex-shrink-0">
          <p className="text-xs text-gray-400 mb-2 text-center">질문을 선택해주세요</p>
          <div className="flex flex-wrap gap-1.5">
            {chatData?.faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleQuestion(faq)}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 active:bg-blue-200 transition-colors"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={[
          'fixed bottom-4 right-4 z-[60]',
          'w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg',
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
