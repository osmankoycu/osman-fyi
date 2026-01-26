import { defineField, defineType } from 'sanity'

export const curationItem = defineType({
    name: 'curationItem',
    title: 'Curation Item',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'url',
            title: 'External URL',
            type: 'url',
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'curationCategory' }],
            validation: (rule) => rule.required(),
        }),
    ],
})
