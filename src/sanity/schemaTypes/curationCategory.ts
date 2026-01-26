import { defineField, defineType } from 'sanity'

export const curationCategory = defineType({
    name: 'curationCategory',
    title: 'Curation Category',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'order',
            title: 'Order',
            type: 'number',
            description: 'Order of the category in the menu (1, 2, 3...)',
        }),
    ],
})
