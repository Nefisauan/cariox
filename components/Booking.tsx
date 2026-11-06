'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { demoSchedulingProvider, localDateKey, parseDateKey, validateBooking, type Booking } from '../lib/academy';
import useModal from './useModal';

export default function BookingDialog({ close }: { close: () => void }) {
  const ref = useModal();
  const [step, setStep] = useState(0);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [data, setData] = useState<Booking>({ session: 'Introductory session', date: '', time: '', name: '', email: '', phone: '' });
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  useEffect(() => {
    let active = true;
    setSlots([]);
    setError('');
    if (data.date) {
      setLoading(true);
      demoSchedulingProvider.getAvailability(data.date).then(result => { if (active) setSlots(result); })
        .catch(() => { if (active) setError('We couldn’t load sample times. Please choose another date.'); })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [data.date]);
  function update(key: keyof Booking, value: string) { setData(previous => ({ ...previous, [key]: value })); setError(''); }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    const issue = validateBooking(data);
    if (issue) { setError(issue); return; }
    setLoading(true);
    try {
      const result = await demoSchedulingProvider.submit(data);
      setReference(result.reference);
      setStep(2);
    } catch (error) { setError(error instanceof Error ? error.message : 'Please try again.'); }
    finally { setLoading(false); }
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const formattedDate = parseDateKey(data.date)?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return <dialog ref={ref} onCancel={close} className="booking-dialog" aria-labelledby="booking-title" aria-describedby="booking-note" onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <button className="close icon-button" onClick={close} aria-label="Close booking"><X /></button>
    <span className="eyebrow">MAKE ROOM FOR SOMETHING GOOD</span>
    <h2 id="booking-title">{step === 2 ? 'A first step.\nWell taken.' : 'Your journey.\nYour pace.'}</h2>
    <p className="demo-label" id="booking-note"><span className="status-dot" />Booking preview · sample times · no reservation is made</p>
    <ol className="booking-steps" aria-label="Booking progress">{['Choose a session', 'Your details', 'Preview'].map((label, index) => <li key={label} className={index <= step ? 'active' : ''} aria-current={step === index ? 'step' : undefined}><span>{index < step ? <Check size={12} /> : index + 1}</span>{label}</li>)}</ol>
    {step === 2 ? <div className="booking-done" role="status"><div className="success-icon"><Check /></div><h3>Thanks, {data.name.trim().split(' ')[0]}.</h3><p>You’ve explored the booking experience. This receipt is a preview; your class is not reserved.</p><div className="receipt"><small>YOUR SAMPLE SESSION</small><b>{data.session}</b><span>{formattedDate}<br />{data.time} · Sample time</span><small>{reference} · Nothing was sent or saved.</small></div><button className="button gold full" onClick={close}>Back to the academy <ArrowRight size={16} /></button></div>
      : step === 0 ? <>
        <label className="field-label">What would you like to explore?<select value={data.session} onChange={event => update('session', event.target.value)}><option>Introductory session</option><option>Academy visit</option></select></label>
        <div className="calendar-head"><button className="icon-button" aria-label="Previous month" disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></button><b aria-live="polite">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</b><button className="icon-button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={18} /></button></div>
        <div className="calendar">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(label => <small key={label} aria-label={label}>{label.slice(0, 1)}</small>)}{Array.from({ length: first }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => {
          const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
          const value = localDateKey(date);
          return <button key={value} disabled={date < today} className={data.date === value ? 'selected' : ''} onClick={() => { setData(previous => ({ ...previous, date: value, time: '' })); setError(''); }} aria-label={date.toLocaleDateString('en-US', { dateStyle: 'full' })} aria-current={value === localDateKey(today) ? 'date' : undefined} aria-pressed={data.date === value}>{index + 1}</button>;
        })}</div>
        {data.date && <div className="sample-times"><span className="field-label">Sample times · {formattedDate}</span><div className="time-slots" aria-live="polite">{loading ? <p>Loading sample times…</p> : slots.length ? slots.map(time => <button key={time} className={data.time === time ? 'selected' : ''} aria-pressed={data.time === time} onClick={() => update('time', time)}>{time}</button>) : <p>No sample times on this date. Try another day.</p>}</div></div>}
        {error && <p role="alert" className="error">{error}</p>}
        <button className="button gold full" disabled={!data.time || loading} onClick={() => setStep(1)}>Continue to your details <ArrowRight size={16} /></button>
        <p className="fine-print">These times demonstrate the calendar. Confirm an actual session with the academy before attending.</p>
      </> : <form onSubmit={submit}>
        <button className="text-button" type="button" onClick={() => setStep(0)}><ArrowLeft size={15} /> Change session</button><div className="session-summary"><b>{data.session}</b><span>{formattedDate} · {data.time}</span></div>
        {(['name', 'email', 'phone'] as const).map(key => <label className="field-label" key={key}>{key === 'name' ? 'Full name' : key === 'email' ? 'Email address' : 'Phone number'}<input autoFocus={key === 'name'} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : 'tel'} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} minLength={key === 'name' ? 2 : undefined} maxLength={key === 'email' ? 254 : key === 'name' ? 100 : 30} required value={data[key]} onChange={event => update(key, event.target.value)} /></label>)}
        <p className="fine-print">Your details stay in this page’s memory and are discarded when closed. No email or calendar event will be sent.</p>{error && <p role="alert" className="error">{error}</p>}<button className="button gold full" disabled={loading}>{loading ? 'Checking…' : 'Complete booking preview'} <ArrowRight size={16} /></button>
      </form>}
  </dialog>;
}
