import type { StructureResolver } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Portfolio Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'product',
        title: 'Products',
        id: 'orderable-products',
        S,
        context
      }),
      orderableDocumentListDeskItem({
        type: 'experiment',
        title: 'Experiments',
        id: 'orderable-experiments',
        S,
        context
      }),
      S.documentTypeListItem('photoCity').title('Photography'),
      S.documentTypeListItem('curationItem').title('Curation'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['product', 'experiment', 'photoCity', 'curationItem'].includes(item.getId()!),
      ),
    ])
