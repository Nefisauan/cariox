import { defineType, defineField } from 'sanity';
import { requiredText, httpsValidation } from './shared';
export const businessInformation = defineType({name:'businessInformation',title:'Business information',type:'document',fields:[
  requiredText('name','Approved business name'),defineField({name:'address',title:'Public address',type:'text'}),defineField({name:'phone',title:'Public phone',type:'string'}),defineField({name:'email',title:'Public email',type:'string',validation:rule=>rule.email()}),defineField({name:'timezone',title:'IANA time zone',type:'string'}),defineField({name:'hours',title:'Published hours',type:'text'}),defineField({name:'mapUrl',title:'Map / directions link',type:'url',validation:rule=>rule.custom(httpsValidation)}),
  defineField({name:'socialLinks',title:'Social profiles',type:'array',of:[{type:'object',fields:[requiredText('label','Network'),defineField({name:'url',title:'Profile URL',type:'url',validation:rule=>rule.required().custom(httpsValidation)})]}]}),
  defineField({name:'confirmed',title:'Approved by the academy owner',type:'boolean',initialValue:false}),
]});
