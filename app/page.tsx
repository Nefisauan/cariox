import AcademyHome from '../components/AcademyHome';
import { AcademyContentProvider } from '../components/content/ContentProvider';
import { getAcademyContent } from '../lib/content/load';
import { connection } from 'next/server';
import { getTrialGatewayConfig } from '../lib/trial/runtime';

export default async function Page() {
  await connection();
  const content = await getAcademyContent();
  return <AcademyContentProvider content={content}><AcademyHome trialAvailable={Boolean(getTrialGatewayConfig())} /></AcademyContentProvider>;
}
