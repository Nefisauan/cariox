import type { MarketingConsent, MetaEvent } from './contracts';
export type PixelSink = (event: MetaEvent, eventId: string) => void;
export class ConsentAwareTracker {
  private consent: MarketingConsent = 'unknown';
  private sent = new Set<string>();
  constructor(private enabled: boolean, private sink: PixelSink, private seenBefore: (key: string) => boolean = () => false, private remember: (key: string) => void = () => {}) {}
  setConsent(value: MarketingConsent) { this.consent = value; }
  canTrack() { return this.enabled && this.consent === 'granted'; }
  track(event: MetaEvent, eventId: string): boolean {
    if (!this.canTrack() || !/^[A-Za-z0-9_:-]{8,160}$/.test(eventId)) return false;
    const key = `${event}:${eventId}`;
    if (this.sent.has(key) || (event !== 'PageView' && this.seenBefore(key))) return false;
    try { this.sink(event, eventId); } catch { return false; }
    this.sent.add(key);
    if (event !== 'PageView') this.remember(key);
    return true;
  }
}
