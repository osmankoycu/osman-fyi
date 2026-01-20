import { defineField, defineType } from 'sanity'

export const textCard = defineType({
    name: 'textCard',
    title: 'Text Card',
    type: 'object',
    fields: [
        defineField({
            name: 'text',
            title: 'Text',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Background Color',
            type: 'string',
            description: 'Optional hex color (e.g., #F9FAFB). Leave empty for default.',
        }),
        defineField({
            name: 'textColor',
            title: 'Text Color',
            type: 'string',
            description: 'Optional hex color (e.g., #000000). Leave empty for default.',
        }),
    ],
})
