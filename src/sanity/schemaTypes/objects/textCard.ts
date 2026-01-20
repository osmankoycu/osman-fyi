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
    ],
})
