import { defineType, defineField } from 'sanity';
import { requiredText } from './shared';
export const branding = defineType({ name:'branding', title:'Branding', type:'document', fields:[requiredText('wordmarkLeft','Wordmark left'),requiredText('wordmarkRight','Wordmark gold accent'),requiredText('tagline','Tagline'),requiredText('affiliation','Approved affiliation'),defineField({name:'logo',title:'Optional approved logo',type:'image',options:{hotspot:true}})] });
export const academyPhoto = defineType({ name:'academyPhoto', title:'Academy photos', type:'document', fields:[
  defineField({name:'key',title:'Photo position',type:'string',options:{list:['academy','reception','performance','lounge','collection']},validation:rule=>rule.required()}),
  defineField({name:'image',title:'Photograph',type:'image',options:{hotspot:true},validation:rule=>rule.required()}),
  requiredText('alt','Accessible image description'),requiredText('title','Gallery heading'),requiredText('label','Gallery eyebrow'),requiredText('description','Gallery description','text'),requiredText('tab','Gallery tab label'),
  defineField({name:'enabled',title:'Use this approved photo',type:'boolean',initialValue:false}),
] });
