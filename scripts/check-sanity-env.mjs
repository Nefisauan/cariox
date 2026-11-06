import fs from 'node:fs';
// Node reads ignored local configuration; no account requests and no values are logged.
for(const file of ['.env.local','.env'])if(fs.existsSync(file))process.loadEnvFile(file);
const project=process.env.SANITY_STUDIO_PROJECT_ID,dataset=process.env.SANITY_STUDIO_DATASET;
if(!project||!dataset||!/^[a-z0-9]+$/.test(project)||!/^[a-z0-9][a-z0-9_-]*$/.test(dataset)){
 console.error('Sanity Studio is not configured. Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET from the owner’s existing project. No project or account was created.');
 process.exitCode=1;
}
