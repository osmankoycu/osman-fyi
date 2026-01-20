import { defineField, defineType } from 'sanity'

export const imageCard = defineType({
    name: 'imageCard',
    title: 'Image Card',
    type: 'object',
    fields: [
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
        }),
        defineField({
            name: 'caption',
            title: 'Caption',
            type: 'string',
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Background Color',
            type: 'string',
            description: 'Optional hex color (e.g., #F9FAFB). Leave empty for default.',
        }),
    ],
})
