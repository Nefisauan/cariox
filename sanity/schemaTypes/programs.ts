import { defineType, defineField } from 'sanity';
import { requiredText, confirmationFields } from './shared';
export const program = defineType({name:'program',title:'Programs',type:'document',fields:[requiredText('title','Program name'),requiredText('tag','Audience label'),requiredText('body','Program description','text'),...confirmationFields]});
export const classDefinition = defineType({name:'classDefinition',title:'Classes',type:'document',fields:[
  requiredText('name','Class name'),requiredText('format','Format / schedule filter label'),requiredText('level','Experience level'),
  defineField({name:'program',title:'Program',type:'reference',to:[{type:'program'}],validation:rule=>rule.required()}),
  defineField({name:'instructor',title:'Instructor',type:'reference',to:[{type:'instructor'}]}),...confirmationFields,
]});
