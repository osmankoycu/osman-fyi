import { defineField, defineType } from 'sanity'

export const videoCard = defineType({
    name: 'videoCard',
    title: 'Video Card',
    type: 'object',
    fields: [
        defineField({
            name: 'video',
            title: 'Video',
            type: 'file',
            options: {
                accept: 'video/*'
            }
        }),
        defineField({
            name: 'caption',
            title: 'Caption',
            type: 'string',
        }),
        defineField({
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
        }),
    ],
})
