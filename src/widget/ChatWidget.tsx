import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';

// ── Types ───────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Message extends ChatMessage {
  timestamp: Date;
  contextUsed?: ContextItem[];
}

interface ContextItem {
  text: string;
  score: number;
  file_id?: string;
  signed_url?: string;
  reference?: { file?: { signed_url?: string; [k: string]: any }; [k: string]: any };
  metadata: {
    file_name?: string;
    filename?: string;
    file_id?: string;
    pages?: number[];
    signed_url?: string;
    reference?: { file?: { signed_url?: string; [k: string]: any }; [k: string]: any };
    [k: string]: any;
  };
}

interface ChatResponse {
  response: string;
  context_used: ContextItem[];
}

// ── Props ───────────────────────────────────────────────────────────────────
export interface ChatWidgetProps {
  /** Base URL of your FastAPI backend (e.g. https://api.femigrants.org) */
  apiBaseUrl?: string;
  /** AI model identifier */
  aiModel?: string;
  /** Title shown in the chat header */
  title?: string;
  /** Subtitle shown below the title */
  subtitle?: string;
  /** Primary gradient colour (from) */
  primaryColor?: string;
  /** Primary gradient colour (to) */
  secondaryColor?: string;
  /** Example questions shown when chat is empty */
  exampleQuestions?: string[];
}

// ── Component ───────────────────────────────────────────────────────────────
const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiBaseUrl = 'http://localhost:8000',
  aiModel = 'gemini-2.5-flash',
  title = 'Femibot AI Assistant',
  subtitle = 'Online • Ready to help',
  primaryColor = '#9333ea',   // purple-600
  secondaryColor = '#db2777', // pink-600
  exampleQuestions = [
    'What is your mission?',
    'What is your history?',
    'Do you accept donations?',
    'What is your board of directors?',
  ],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Axios instance
  const api = useRef(
    axios.create({ baseURL: apiBaseUrl, headers: { 'Content-Type': 'application/json' } }),
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const convertUrlsToMarkdown = (text: string): string => {
    const result = text.replace(
      /([^:\n]+):\s*(https?:\/\/[^\s<>\]()]+)/g,
      (_m, label, url) => `${label}: [${url}](${url})\n\n`,
    );
    return result.replace(/\n{3,}/g, '\n\n').trim();
  };

  const addMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);
  const clearMessages = () => setMessages([]);

  const viewDocument = async (ctx: ContextItem) => {
    try {
      const signedUrl =
        ctx.signed_url ||
        ctx.metadata?.signed_url ||
        ctx.reference?.file?.signed_url ||
        ctx.metadata?.reference?.file?.signed_url;
      if (signedUrl) { window.open(signedUrl, '_blank'); return; }

      const fileId = ctx.file_id || ctx.metadata?.file_id;
      if (fileId) {
        const res = await api.current.get(`/files/${fileId}/view-url`);
        window.open(res.data.signed_url, '_blank');
      } else {
        alert('Unable to view document: No file ID or signed URL available.');
      }
    } catch (err: any) {
      alert('Error opening document: ' + (err.message || 'Unknown error'));
    }
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    addMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const chatContext: ChatMessage[] = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const { data } = await api.current.post<ChatResponse>('/chat', {
        message: input,
        chat_context: chatContext,
        model: aiModel,
      });
      addMessage({
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        contextUsed: data.context_used,
      });
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again later.',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Gradient helpers ─────────────────────────────────────────────────────
  const grad = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ─── Chat Window ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 48px)',
            height: '600px',
            maxHeight: 'calc(100vh - 140px)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            animation: 'femibot-scaleIn 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: grad,
              color: '#fff',
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '14px',
                    height: '14px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    border: '2px solid #fff',
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px' }}>{title}</div>
                <div style={{ fontSize: '12px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                  {subtitle}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={clearMessages}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Clear chat"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              background: 'linear-gradient(180deg, #f9fafb, #fff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #f3e8ff, #fce7f3)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <svg width="28" height="28" fill="none" stroke={primaryColor} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#111827', marginBottom: '6px' }}>
                  Hello! How can I help?
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                  Ask me anything about Femigrants resources
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {exampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        background: '#fff',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#374151',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.borderColor = primaryColor;
                        (e.target as HTMLElement).style.background = '#faf5ff';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                        (e.target as HTMLElement).style.background = '#fff';
                      }}
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'femibot-fadeIn 0.3s ease-out',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    ...(msg.role === 'user'
                      ? { background: grad, color: '#fff' }
                      : { background: '#fff', border: '1px solid #e5e7eb', color: '#111827' }),
                  }}
                >
                  {msg.role === 'user' ? (
                    <>
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.6 }}>{msg.content}</div>
                      <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="femibot-markdown" style={{ fontSize: '14px', lineHeight: 1.7 }}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', margin: '8px 0' }} {...props} />,
                            ol: ({ node, ...props }) => <ol style={{ paddingLeft: '20px', margin: '8px 0' }} {...props} />,
                            li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                            p: ({ node, ...props }) => <p style={{ margin: '0 0 10px' }} {...props} />,
                            strong: ({ node, ...props }) => <strong style={{ fontWeight: 700 }} {...props} />,
                            a: ({ node, ...props }) => (
                              <a
                                style={{ color: primaryColor, textDecoration: 'underline', fontWeight: 600, wordBreak: 'break-all' }}
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                              />
                            ),
                            code: ({ node, ...props }) => (
                              <code style={{ background: '#f3e8ff', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }} {...props} />
                            ),
                          }}
                        >
                          {convertUrlsToMarkdown(msg.content)}
                        </ReactMarkdown>
                      </div>

                      {/* Sources */}
                      {msg.contextUsed && msg.contextUsed.length > 0 && (
                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '8px' }}>
                            📄 Sources ({msg.contextUsed.length})
                          </div>
                          {msg.contextUsed.map((ctx, i) => (
                            <div
                              key={i}
                              style={{
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                marginBottom: '6px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {ctx.metadata?.file_name || ctx.metadata?.filename || 'Document'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                  {(ctx.score * 100).toFixed(1)}% match
                                  {ctx.metadata?.pages?.length ? ` • Page ${ctx.metadata.pages.join(', ')}` : ''}
                                </div>
                              </div>
                              <button
                                onClick={() => viewDocument(ctx)}
                                style={{
                                  background: grad,
                                  color: '#fff',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '11px', marginTop: '8px', color: '#9ca3af' }}>
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'femibot-fadeIn 0.3s ease-out' }}>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: i === 0 ? primaryColor : i === 1 ? secondaryColor : '#3b82f6',
                          animation: 'femibot-bounce 1.4s infinite',
                          animationDelay: `${i * 0.16}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              padding: '14px 16px',
              borderTop: '1px solid #e5e7eb',
              background: '#fff',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end',
              flexShrink: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message…"
              rows={1}
              disabled={isLoading}
              style={{
                flex: 1,
                border: '2px solid #e5e7eb',
                borderRadius: '14px',
                padding: '12px 14px',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                maxHeight: '100px',
                overflowY: 'auto',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = primaryColor; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = '#e5e7eb'; }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                background: isLoading || !input.trim() ? '#d1d5db' : grad,
                color: '#fff',
                border: 'none',
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isLoading && input.trim()) {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(147,51,234,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {isLoading ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ animation: 'femibot-spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.25" />
                  <path d="M4 12a8 8 0 018-8" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          <div style={{ background: '#fff', textAlign: 'center', padding: '0 0 8px', fontSize: '10px', color: '#9ca3af' }}>
            AI can make mistakes. Please verify important information.
          </div>
        </div>
      )}

      {/* ─── Floating Chat Bubble ─────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: grad,
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(147,51,234,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          transition: 'transform 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(147,51,234,0.5)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(147,51,234,0.4)';
        }}
        title={isOpen ? 'Close chat' : 'Chat with us'}
      >
        {isOpen ? (
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {messages.filter((m) => m.role === 'assistant').length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'linear-gradient(135deg, #ef4444, #ec4899)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                }}
              >
                {messages.filter((m) => m.role === 'assistant').length}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
