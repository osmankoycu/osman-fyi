import { defineField, defineType } from 'sanity'

export const row = defineType({
    name: 'row',
    title: 'Row',
    type: 'object',
    fields: [
        defineField({
            name: 'layout',
            title: 'Layout',
            type: 'string',
            options: {
                list: [
                    { title: 'Full Width (1 item)', value: 'full' },
                    { title: 'Two Columns (2 items)', value: 'two' },
                ],
                layout: 'radio',
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Background Color',
            type: 'string',
            description: 'Optional hex color (e.g., #FFFFFF). Leave empty for default.',
        }),
        defineField({
            name: 'items',
            title: 'Items',
            type: 'array',
            of: [{ type: 'imageCard' }, { type: 'textCard' }],
            validation: (rule) =>
                rule.custom((items, context) => {
                    // @ts-ignore
                    const layout = context.parent?.layout
                    if (!items) return true
                    if (layout === 'full' && items.length !== 1) {
                        return 'Full width layout must have exactly 1 item'
                    }
                    if (layout === 'two' && items.length !== 2) {
                        return 'Two columns layout must have exactly 2 items'
                    }
                    return true
                }),
        }),
    ],
    preview: {
        select: {
            layout: 'layout',
            item0: 'items.0.image.asset._ref',
            item1: 'items.1.image.asset._ref',
        },
        prepare({ layout, item0, item1 }) {
            const title = layout === 'full' ? 'Full Width Row' : 'Two Columns Row'
            return {
                title,
                subtitle: `${layout} layout`,
            }
        },
    },
})
