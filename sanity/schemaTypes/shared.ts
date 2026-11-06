import { defineField } from 'sanity';
export const requiredText = (name: string, title: string, type: 'string' | 'text' = 'string') => defineField({ name, title, type, validation: rule => rule.required().min(1).max(type === 'text' ? 5000 : 300) });
export const confirmationFields = [
  defineField({ name: 'confirmed', title: 'Approved by the academy owner', type: 'boolean', initialValue: false, description: 'Only approved, published business information is shown on the website.' }),
  defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: false }),
  defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0, validation: rule => rule.integer().min(0) }),
];
export const imageField = (name: string, title: string) => defineField({ name, title, type: 'image', options: { hotspot: true }, validation: rule => rule.required() });
export const httpsValidation = (value?: string) => !value || /^https:\/\/[^\s]+$/.test(value) || 'Use a full HTTPS address.';
