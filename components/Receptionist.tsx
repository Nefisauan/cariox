'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, MessageCircle, X } from 'lucide-react';
import { receptionistReply } from '../lib/academy';

export default function Receptionist({ book }: { book: () => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Welcome to CARIOX. A new journey starts with a good question. What would you like to explore?' }]);
  const scroll = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const hasOpened = useRef(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) { hasOpened.current = true; field.current?.focus({ preventScroll: true }); }
    else if (hasOpened.current) toggle.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior });
  }, [messages, open]);
  function send(value: string) {
    const text = value.trim().slice(0, 500);
    if (!text) return;
    setMessages(previous => [...previous.slice(-39), { role: 'user', text }, { role: 'assistant', text: receptionistReply(text) }]);
    setInput('');
    field.current?.focus({ preventScroll: true });
  }
  return <div className="receptionist" onKeyDown={event => { if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); } }}>
    {open && <section id="academy-chat" className="chat-panel" aria-label="Academy demo receptionist"><header><span className="chat-avatar">C</span><div><b>In your corner.</b><small>CARIOX · Demo receptionist</small></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></header><div className="chat-messages" ref={scroll} role="log" aria-label="Conversation" aria-live="polite"><p className="chat-disclaimer">Interactive preview · scripted responses. Academy information is awaiting confirmation.</p>{messages.map((message, index) => <p key={index} className={`message ${message.role}`}><span className="sr-only">{message.role === 'user' ? 'You: ' : 'Receptionist: '}</span>{message.text}</p>)}</div><div className="chat-suggestions">{['What should I bring?', 'How much do classes cost?'].map(text => <button key={text} onClick={() => send(text)}>{text}</button>)}<button onClick={() => { setOpen(false); book(); }}>Explore booking <ArrowUpRight size={14} /></button></div><form onSubmit={event => { event.preventDefault(); send(input); }}><input ref={field} aria-label="Your message" placeholder="What’s on your mind?" value={input} maxLength={500} onChange={event => setInput(event.target.value)} /><button aria-label="Send message" disabled={!input.trim()}><ArrowUp size={18} /></button></form></section>}
    <button ref={toggle} className="chat-toggle" aria-expanded={open} aria-controls={open ? 'academy-chat' : undefined} onClick={() => setOpen(!open)}>{open ? <X size={18} /> : <MessageCircle size={18} />}<span>{open ? 'Close chat' : 'Let’s talk'}<i /></span></button>
  </div>;
}
