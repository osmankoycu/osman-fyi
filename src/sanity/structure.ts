import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Portfolio Content')
    .items([
      S.documentTypeListItem('project').title('Projects'),
      S.documentTypeListItem('photoCity').title('Photography'),
      S.documentTypeListItem('curationItem').title('Curation'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['project', 'photoCity', 'curationItem'].includes(item.getId()!),
      ),
    ])
