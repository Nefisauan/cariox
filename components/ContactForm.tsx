'use client';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react';

export default function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', interest: 'Starting my Jiu-Jitsu journey', message: '' });
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(draft); setCopied(true); setCopyError(''); }
    catch { setCopyError('Copy is unavailable in this browser. Select the message below to copy it manually.'); }
  }
  return <form className="inquiry-form reveal" onSubmit={event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setValues({ name: String(form.get('name')), email: String(form.get('email')), interest: String(form.get('interest')), message: String(form.get('message')) });
    setDraft(`Hello CARIOX,\n\nMy name is ${String(form.get('name')).trim()}.\nEmail: ${String(form.get('email')).trim()}\nI’m interested in: ${form.get('interest')}.\n\n${String(form.get('message')).trim()}`);
    setCopied(false);
    setCopyError('');
  }}>
    {draft ? <div className="inquiry-done"><div className="success-icon"><Check size={22} /></div><span className="eyebrow">A GOOD CONVERSATION STARTS HERE</span><h3>Your message.<br />Ready when you are.</h3><p role="status">Your draft is ready. This preview hasn’t sent or saved your details. Copy it to share once the academy’s contact information is available.</p><label className="field-label">Your inquiry<textarea readOnly value={draft} rows={7} onFocus={event => event.currentTarget.select()} /></label><button type="button" className="button dark full" onClick={copy}>{copied ? 'Copied to clipboard' : 'Copy your message'}{copied ? <Check size={16} /> : <Copy size={16} />}</button>{copyError && <p className="error" role="alert">{copyError}</p>}<button type="button" className="text-button" onClick={() => setDraft('')}>Edit your inquiry <ArrowRight size={15} /></button></div>
      : <><span className="eyebrow">TELL US WHAT MOVES YOU</span><h3>Let’s start<br />a conversation.</h3><div className="form-pair"><label>Your name<input name="name" defaultValue={values.name} autoComplete="name" required placeholder="Full name" minLength={2} maxLength={100} /></label><label>Email address<input name="email" defaultValue={values.email} type="email" autoComplete="email" required placeholder="you@example.com" maxLength={254} /></label></div><label>I’m interested in<select name="interest" defaultValue={values.interest}><option>Starting my Jiu-Jitsu journey</option><option>Training for my child</option><option>Advancing my practice</option><option>Visiting the academy</option><option>Something else</option></select></label><label>Your message<textarea name="message" defaultValue={values.message} required minLength={10} maxLength={2000} placeholder="A little about you, your goals, or your questions." rows={4} /></label><p className="fine-print">Inquiry preview · prepare and copy a message. Nothing is sent or stored by this website.</p><button className="button dark full">Prepare your inquiry <ArrowUpRight size={17} /></button></>}
  </form>;
}
