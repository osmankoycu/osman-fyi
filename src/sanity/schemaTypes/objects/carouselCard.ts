import { defineField, defineType } from 'sanity'

export const carouselCard = defineType({
    name: 'carouselCard',
    title: 'Carousel Card',
    type: 'object',
    fields: [
        defineField({
            name: 'images',
            title: 'Images',
            type: 'array',
            of: [{
                type: 'image',
                options: {
                    hotspot: true,
                },
            }],
            validation: (rule) => rule.min(2).error('A carousel must have at least 2 images.'),
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Background Color',
            type: 'string',
            description: 'Optional hex color (e.g., #F9FAFB). Leave empty for default.',
        }),
    ],
})
