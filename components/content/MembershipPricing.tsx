import type { MembershipPrice } from '../../lib/content/types';
export default function MembershipPricing({ prices }: { prices: MembershipPrice[] }) {
  if (!prices.length) return null;
  return <section id="pricing" className="section-pad"><div className="section-kicker"><span>MEMBERSHIP PRICING</span><span>APPROVED ACADEMY INFORMATION</span></div>{prices.map(price => <article key={price.id} className="program-row"><h3>{price.title}</h3><p>{new Intl.NumberFormat('en-US', {style:'currency',currency:price.currency}).format(price.amount)} / {price.interval}</p><p>{price.description}</p></article>)}</section>;
}
