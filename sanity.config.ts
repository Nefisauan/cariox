import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { getStudioEnvironment } from './lib/sanity/env';
import { schemaTypes } from './sanity/schemaTypes';
const environment = getStudioEnvironment({ SANITY_STUDIO_PROJECT_ID: process.env.SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET });
if (!environment) throw new Error('Sanity Studio is not configured. Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET from the owner’s existing project. No account has been created.');
const singletons = new Set(['homepage', 'branding', 'businessInformation']);
export default defineConfig({
  name: 'cariox', title: 'CARIOX Content Studio', projectId: environment.projectId, dataset: environment.dataset,
  plugins: [structureTool({structure: S => S.list().title('Academy content').items([
    ...[...singletons].map(type => S.listItem().id(type).title(type === 'businessInformation' ? 'Business information' : type.charAt(0).toUpperCase()+type.slice(1)).child(S.document().schemaType(type).documentId(type))),
    ...S.documentTypeListItems().filter(item => !singletons.has(item.getId() || '')),
  ])})],
  schema: { types: schemaTypes, templates: templates => templates.filter(template => !singletons.has(template.schemaType)) },
  document: { actions: (actions, context) => singletons.has(context.schemaType) ? actions.filter(action => !['delete','duplicate','unpublish'].includes(action.action || '')) : actions },
});
