import { defineType, defineField } from 'sanity';
import { confirmationFields } from './shared';
export const schedule = defineType({name:'schedule',title:'Weekly schedule',type:'document',fields:[
  defineField({name:'class',title:'Class',type:'reference',to:[{type:'classDefinition'}],validation:rule=>rule.required()}),
  defineField({name:'day',title:'Day',type:'string',options:{list:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']},validation:rule=>rule.required()}),
  defineField({name:'time',title:'Start time (hh:mm)',type:'string',validation:rule=>rule.required().regex(/^(0[1-9]|1[0-2]):[0-5][0-9]$/)}),
  defineField({name:'period',title:'AM / PM',type:'string',options:{list:['AM','PM']},validation:rule=>rule.required()}),
  defineField({name:'timezone',title:'IANA time zone',type:'string',description:'Confirm the academy time zone; do not infer it from the developer’s location.',validation:rule=>rule.custom(value=>{try{if(!value)return true;new Intl.DateTimeFormat('en',{timeZone:value});return true;}catch{return 'Enter a valid IANA time zone.';}})}),...confirmationFields,
], preview:{
  select:{ title:'class.name', day:'day', time:'time', period:'period' },
  prepare:({title,day,time,period})=>({title:title || 'Select a class',subtitle:[day,time,period].filter(Boolean).join(' ')}),
}});
