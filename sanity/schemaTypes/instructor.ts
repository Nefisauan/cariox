import { defineType, defineField } from 'sanity';
import { requiredText, confirmationFields, imageField } from './shared';
export const instructor = defineType({ name: 'instructor', title: 'Instructors', type: 'document', fields: [
  defineField({ name:'name', title:'Full name (when approved)', type:'string' }), requiredText('rank', 'Verified belt rank'),
  defineField({ name: 'experience', title: 'Verified experience', type: 'string' }),
  defineField({ name: 'specialties', title: 'Specialties', type: 'array', of: [{ type: 'string' }] }),
  defineField({ name: 'biography', title: 'Biography', type: 'text' }),
  imageField('photo', 'Portrait'), requiredText('photoAlt', 'Portrait alt text'),
  defineField({
    name: 'achievements', title: 'Competition results', type: 'array',
    description: 'Only supplied or verified results. Do not infer years, divisions, or sanctioning organizations.',
    validation: rule => rule.max(50),
    of: [{ type: 'object', name: 'competitionResult', fields: [
      defineField({ name: 'event', title: 'Event name', type: 'string', validation: rule => rule.required().max(160) }),
      defineField({ name: 'placement', title: 'Placement', type: 'number', options: { list: [{ title: '1st place', value: 1 }, { title: '2nd place', value: 2 }, { title: '3rd place', value: 3 }] }, validation: rule => rule.required().integer().min(1).max(3) }),
    ], preview: { select: { title: 'event', placement: 'placement' }, prepare: ({ title, placement }) => ({ title, subtitle: `${placement === 1 ? '1st' : placement === 2 ? '2nd' : '3rd'} place` }) } }],
  }), ...confirmationFields,
] });
