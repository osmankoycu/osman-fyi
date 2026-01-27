import { type SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { experiment } from './experiment'
import { photoCity } from './photoCity'
import { curationCategory } from './curationCategory'
import { curationItem } from './curationItem'
import { row } from './objects/row'
import { imageCard } from './objects/imageCard'
import { textCard } from './objects/textCard'
import { videoCard } from './objects/videoCard'
import { about } from './about'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, experiment, photoCity, curationCategory, curationItem, row, imageCard, textCard, videoCard, about],
}
