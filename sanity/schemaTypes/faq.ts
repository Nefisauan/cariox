import { defineType, defineField } from 'sanity';
import { requiredText, confirmationFields } from './shared';
export const faq = defineType({name:'faq',title:'FAQs',type:'document',fields:[requiredText('question','Question'),requiredText('answer','Approved answer','text'),...confirmationFields,defineField({name:'enabled',title:'Show on website',type:'boolean',initialValue:false})]});
