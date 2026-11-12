import { defineArrayMember, defineField, defineType } from 'sanity';
import { defaultNavigation, navigationDestination } from '../../lib/content/navigation';

const destinationDescription = 'Choose a page section such as #programs or #schedule, or enter a full HTTPS link.';

export const navigation = defineType({
  name: 'navigation', title: 'Navigation', type: 'document',
  initialValue: {
    ...defaultNavigation,
    links: defaultNavigation.links.map(link => ({ ...link, _type: 'navigationLink', _key: link.href.slice(1) })),
  },
  fields: [
    defineField({
      name: 'links', title: 'Menu links', type: 'array',
      description: 'Edit labels and destinations. Drag entries to change their order.',
      validation: rule => rule.required().min(1).max(6).custom(value => {
        const links = value as { href?: string }[] | undefined;
        return !links || new Set(links.map(link => link.href)).size === links.length
          ? true : 'Use each destination once.';
      }),
      of: [defineArrayMember({ type: 'object', name: 'navigationLink', title: 'Menu link', fields: [
        defineField({ name: 'label', title: 'Label', type: 'string', validation: rule => rule.required().max(24) }),
        defineField({ name: 'href', title: 'Destination', type: 'string', description: destinationDescription,
          validation: rule => rule.required().custom(value => !value || navigationDestination.safeParse(value).success || 'Use an existing section anchor or a public HTTPS URL.') }),
      ], preview: { select: { title: 'label', subtitle: 'href' } } })],
    }),
    defineField({ name: 'buttonText', title: 'Navigation button text', type: 'string', validation: rule => rule.required().max(60) }),
    defineField({ name: 'buttonShortText', title: 'Compact button text', type: 'string', description: 'The shorter label shown in the header on smaller screens.', validation: rule => rule.required().max(24) }),
    defineField({ name: 'buttonUrl', title: 'Button destination', type: 'string',
      description: 'Leave empty to open the existing free-trial form or configured booking calendar. ' + destinationDescription,
      validation: rule => rule.custom(value => !value || navigationDestination.safeParse(value).success || 'Use an existing section anchor or a public HTTPS URL.') }),
  ],
  preview: { prepare: () => ({ title: 'Navigation' }) },
});
