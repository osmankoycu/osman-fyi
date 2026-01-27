import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const product = defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({ type: 'product', newItemPosition: 'before' }),
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
            name: 'year',
            title: 'Year',
            type: 'string',
        }),
        defineField({
            name: 'roleLine',
            title: 'Role / Description',
            type: 'string',
        }),
        defineField({
            name: 'rows',
            title: 'Content Rows',
            type: 'array',
            of: [{ type: 'row' }],
        }),
    ],
})
