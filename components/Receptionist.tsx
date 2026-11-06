'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowUpRight, MessageCircle, X } from 'lucide-react';
import { receptionistReply } from '@/lib/academy';

export default function Receptionist({ book }: { book: () => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Welcome to CARIOX. Your first step starts with a conversation. What would you like to explore?',
    },
  ]);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }, { role: 'assistant', text: receptionistReply(text) }]);
    setInput('');
  }

  return (
    <div className="receptionist">
      {open && (
        <section className="chat-panel" aria-label="Academy demo receptionist">
          <header>
            <span className="chat-avatar">
              C<span>✦</span>
            </span>
            <div>
              <b>Your corner. Online.</b>
              <small>CARIOX · Demo receptionist</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </header>
          <div className="chat-messages" ref={scroll} role="log" aria-live="polite">
            <p className="chat-disclaimer">
              Interactive demo · responses are scripted. Academy details are awaiting confirmation.
            </p>
            {messages.map((m, i) => (
              <p key={i} className={'message ' + m.role}>
                {m.text}
              </p>
            ))}
          </div>
          <div className="chat-suggestions">
            {['What should I bring?', 'How much do classes cost?', 'Where are you located?'].map((t) => (
              <button type="button" key={t} onClick={() => send(t)}>
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                book();
              }}
            >
              Try the booking calendar <ArrowUpRight size={13} />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              aria-label="Your message"
              placeholder="Ask us anything…"
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" aria-label="Send message" disabled={!input.trim()}>
              <ArrowUp size={18} />
            </button>
          </form>
        </section>
      )}
      <button className="chat-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span>
          {open ? 'Close conversation' : 'Let’s talk'}
          <i />
        </span>
      </button>
    </div>
  );
}
