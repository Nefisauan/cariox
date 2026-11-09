'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import useModal from './useModal';
import { TRIAL_CTA, TRIAL_INTERESTS, isTrialReceipt } from '../lib/trial/contract';
import { trackTrialLead } from '../lib/tracking/client';

export default function TrialDialog({ close, available }: { close: () => void; available: boolean }) {
  const dialog = useModal();
  const attempt = useRef<{ key: string; body: string } | null>(null);
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || !available || success) return;
    const fields = new FormData(event.currentTarget);
    const interests = fields.getAll('interests');
    if (!interests.length) { setError('Select at least one area of interest.'); return; }
    const body = JSON.stringify({
      name: fields.get('name'), email: fields.get('email'), phone: fields.get('phone'),
      interests, website: fields.get('website'),
    });
    sending.current = true;
    setBusy(true);
    setError('');
    try {
      if (attempt.current?.body !== body) attempt.current = { key: crypto.randomUUID(), body };
      const response = await fetch('/api/trial', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12_000),
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.current.key }, body,
      });
      const receipt: unknown = await response.json();
      if (response.status !== 201 || !isTrialReceipt(receipt)) {
        setError(response.status === 400 ? 'Check your contact details and try again.'
          : response.status === 409 ? 'Close and reopen the form, then try again.'
          : response.status === 429 ? 'Please wait a few minutes and try again.'
          : response.status === 503 ? 'Online trial requests aren’t open yet.'
          : 'We couldn’t confirm your request. Please try again.');
        return;
      }
      attempt.current = null;
      setSuccess(true);
      try { trackTrialLead(receipt); } catch { /* Measurement must never affect a successful request. */ }
    } catch {
      setError('We couldn’t confirm your request. Please try again.');
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return <dialog ref={dialog} className="booking-dialog trial-dialog" aria-labelledby="trial-title"
    onCancel={event => { event.preventDefault(); if (!sending.current) close(); }}
    onClick={event => { if (event.target === event.currentTarget && !sending.current) close(); }}>
    <button type="button" className="close icon-button" aria-label="Close trial form" onClick={close} disabled={busy}><X /></button>
    <h2 id="trial-title">{TRIAL_CTA}</h2>
    {success ? <div className="booking-done">
      <div className="success-icon" aria-hidden="true"><Check /></div>
      <div role="status"><h3>Request received.</h3><p>Thank you for your interest! We've received your information and will reach out shortly to coordinate your first free class.</p></div>
      <button type="button" className="button gold full" onClick={close}>Back to the academy</button>
    </div> : <>
      <p className="trial-intro">{available ? 'Tell us what you’d like to try. We’ll reach out to coordinate your first class.' : 'Online trial requests aren’t open yet. Please check back soon.'}</p>
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset className="trial-fields" disabled={busy || !available}>
          <label className="field-label">Full Name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
          <label className="field-label">Email Address<input name="email" autoComplete="email" type="email" required maxLength={254} /></label>
          <label className="field-label">Phone Number<input name="phone" autoComplete="tel" type="tel" required maxLength={30} /></label>
          <fieldset className="trial-interests">
            <legend>Areas of Interest <small>(select all that apply)</small></legend>
            {TRIAL_INTERESTS.map(interest => <label key={interest}><input type="checkbox" name="interests" value={interest} />{interest}</label>)}
          </fieldset>
          <div hidden><input name="website" tabIndex={-1} autoComplete="off" /></div>
          <p className="fine-print">We’ll use your contact details to follow up about your trial.</p>
          <button className="button gold full" type="submit">{busy ? 'Sending…' : 'Request My Free Trial'} <ArrowUpRight size={17} /></button>
        </fieldset>
        {error && <p role="alert" className="error">{error}</p>}
      </form>
    </>}
  </dialog>;
}
