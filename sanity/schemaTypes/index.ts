import { type SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { experiment } from './experiment'
import { photoCity } from './photoCity'
import { curationItem } from './curationItem'
import { row } from './objects/row'
import { imageCard } from './objects/imageCard'
import { textCard } from './objects/textCard'
import { videoCard } from './objects/videoCard'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [product, experiment, photoCity, curationItem, row, imageCard, textCard, videoCard],
}
