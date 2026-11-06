import { defineCliConfig } from 'sanity/cli';
import { getStudioEnvironment } from './lib/sanity/env';
const config = getStudioEnvironment();
export default defineCliConfig({ api: config ? { projectId: config.projectId, dataset: config.dataset } : undefined });
