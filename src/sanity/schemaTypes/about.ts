import { defineField, defineType } from 'sanity'

export const about = defineType({
    name: 'about',
    title: 'About Page',
    type: 'document',
    fields: [
        defineField({
            name: 'heroImage',
            title: 'Hero Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                defineField({
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                }),
            ],
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'array',
            of: [{ type: 'block' }],
        }),
    ],
    preview: {
        select: {
            title: 'bio',
            media: 'heroImage',
        },
        prepare({ title, media }) {
            return {
                title: 'About Page Content',
                media,
            }
        },
    },
})
