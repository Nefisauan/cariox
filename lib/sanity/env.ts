export type SanityEnvironment = { projectId: string; dataset: string; apiVersion: string };
export function getSanityEnvironment(env: Record<string, string | undefined> = process.env): SanityEnvironment | null {
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;
  if (!/^[a-z0-9]+$/.test(projectId) || !/^[a-z0-9][a-z0-9_-]*$/.test(dataset)) return null;
  return { projectId, dataset, apiVersion: '2026-11-06' };
}
export function getStudioEnvironment(env:Record<string,string|undefined>=process.env):SanityEnvironment|null {
  return getSanityEnvironment({NEXT_PUBLIC_SANITY_PROJECT_ID:env.SANITY_STUDIO_PROJECT_ID,NEXT_PUBLIC_SANITY_DATASET:env.SANITY_STUDIO_DATASET});
}
