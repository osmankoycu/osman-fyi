import { type SchemaTypeDefinition } from 'sanity'
import { project } from './project'
import { photoCity } from './photoCity'
import { curationItem } from './curationItem'
import { row } from './objects/row'
import { imageCard } from './objects/imageCard'
import { textCard } from './objects/textCard'
import { videoCard } from './objects/videoCard'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [project, photoCity, curationItem, row, imageCard, textCard, videoCard],
}
