import AcademyHome from '../components/AcademyHome';
import { AcademyContentProvider } from '../components/content/ContentProvider';
import { getAcademyContent } from '../lib/content/load';
import { getSanityEnvironment } from '../lib/sanity/env';
import { connection } from 'next/server';
import { trialGatewayConfig } from '../lib/trial/gateway';
export default async function Page() {
  if (getSanityEnvironment()) await connection();
  const content = await getAcademyContent();
  return <AcademyContentProvider content={content}><AcademyHome trialAvailable={Boolean(trialGatewayConfig())} /></AcademyContentProvider>;
}
