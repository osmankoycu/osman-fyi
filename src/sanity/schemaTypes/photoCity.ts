import { defineField, defineType } from 'sanity'

export const photoCity = defineType({
    name: 'photoCity',
    title: 'Photography City',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'City Name',
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
            name: 'country',
            title: 'Country',
            type: 'string',
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle / Date',
            type: 'string',
        }),
        defineField({
            name: 'rows',
            title: 'Photos',
            type: 'array',
            of: [{ type: 'row' }],
        }),
    ],
})
