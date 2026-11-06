import { defineType, defineField } from 'sanity';
import { requiredText } from './shared';
const heading = [requiredText('title', 'Heading'), requiredText('accent', 'Accent line')];
export const homepage = defineType({ name: 'homepage', title: 'Homepage', type: 'document', fields: [
  requiredText('heroEyebrow', 'Hero eyebrow'),
  defineField({ name: 'heroTitle', title: 'Hero headline (three lines)', type: 'array', of: [{ type: 'string', validation: rule => rule.required().max(40) }], validation: rule => rule.required().length(3) }),
  requiredText('heroDescription', 'Hero supporting copy', 'text'), requiredText('primaryCta', 'Primary button label'), requiredText('secondaryCta', 'Explore link label'),
  defineField({ name:'about', title:'About', type:'object', fields:[...heading, requiredText('eyebrow','Eyebrow'), defineField({name:'accentPrefix',title:'Words before the accent',type:'string'}), requiredText('lead','Lead paragraph','text'), requiredText('body','Body','text'), requiredText('imageCaption','Image caption')] }),
  defineField({ name:'programs', title:'Programs introduction', type:'object', fields:[...heading, requiredText('description','Supporting copy','text')] }),
  defineField({ name:'team', title:'Team introduction', type:'object', fields:[...heading, requiredText('body','Body','text')] }),
  defineField({ name:'culture', title:'Community', type:'object', fields:[...heading, requiredText('eyebrow','Eyebrow'), requiredText('body','Body','text'), requiredText('quote','Philosophy statement (not a testimonial)','text')] }),
  defineField({ name:'contact', title:'Contact introduction', type:'object', fields:[...heading, requiredText('eyebrow','Eyebrow'), requiredText('body','Body','text')] }),
  defineField({ name:'seo', title:'Search metadata', type:'object', fields:[requiredText('title','Page title'), requiredText('description','Description','text')] }),
] });
