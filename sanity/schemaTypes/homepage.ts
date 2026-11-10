import { defineType, defineField } from 'sanity';
import { requiredText } from './shared';
const heading = [requiredText('title', 'Heading'), requiredText('accent', 'Accent line')];
export const homepage = defineType({ name: 'homepage', title: 'Homepage', type: 'document', fields: [
  requiredText('heroEyebrow', 'Hero eyebrow'),
  defineField({ name: 'heroTitle', title: 'Hero headline (three lines)', type: 'array', of: [{ type: 'string', validation: rule => rule.required().max(40) }], validation: rule => rule.required().length(3) }),
  requiredText('heroDescription', 'Hero supporting copy', 'text'), requiredText('secondaryCta', 'Explore link label'),
  defineField({ name:'about', title:'About', type:'object', fields:[...heading, requiredText('eyebrow','Eyebrow'), defineField({name:'accentPrefix',title:'Words before the accent',type:'string'}), requiredText('lead','Lead paragraph','text'), requiredText('body','Body','text'), requiredText('imageCaption','Image caption')] }),
  defineField({ name:'programs', title:'Programs introduction', type:'object', fields:[...heading, requiredText('description','Supporting copy','text')] }),
  defineField({ name:'schedule', title:'Schedule display', type:'object', fields:[...heading, requiredText('description','Schedule notice','text'), defineField({name:'showTimetable',title:'Show class times',type:'boolean',initialValue:true})] }),
  defineField({
    name: 'trialBooking', title: 'Online class booking', type: 'object',
    description: 'Connect the gym’s public page for booking a free trial class. Turn this off to use the trial request form.',
    fields: [
      defineField({
        name: 'url', title: 'Public booking page link', type: 'url',
        description: 'Paste the HTTPS link visitors use to choose a class and time.',
        validation: rule => rule.uri({ scheme: ['https'] }),
      }),
      defineField({
        name: 'embedUrl', title: 'Calendar embed link', type: 'url',
        description: 'Optional. Paste the HTTPS iframe URL from the provider’s embed settings. This shows the calendar inside the trial dialog, with the public booking page as a backup.',
        validation: rule => rule.uri({ scheme: ['https'] }),
      }),
      defineField({ name: 'enabled', title: 'Enable online class booking', type: 'boolean', initialValue: false }),
    ],
    validation: rule => rule.custom(value => {
      const settings = value as { enabled?: boolean; url?: string } | undefined;
      return settings?.enabled && !settings.url ? 'Add the public booking page link before enabling booking.' : true;
    }),
  }),
  defineField({ name:'team', title:'Team introduction', type:'object', fields:[...heading, requiredText('body','Body','text')] }),
  defineField({ name:'culture', title:'Community', type:'object', fields:[...heading, requiredText('eyebrow','Eyebrow'), requiredText('body','Body','text'), requiredText('quote','Philosophy statement (not a testimonial)','text')] }),
  defineField({ name:'contact', title:'Contact introduction', type:'object', fields:[...heading, requiredText('eyebrow','Eyebrow'), requiredText('body','Body','text')] }),
  defineField({ name:'seo', title:'Search metadata', type:'object', fields:[requiredText('title','Page title'), requiredText('description','Description','text')] }),
] });
