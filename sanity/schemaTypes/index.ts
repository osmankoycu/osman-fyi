import { type SchemaTypeDefinition } from 'sanity'
import { product } from './product'
import { experiment } from './experiment'
import { project } from './project' // Keeping for safety if needed, but removing from types to hide it
import { photoCity } from './photoCity'
import { curationItem } from './curationItem'
import { row } from './objects/row'
import { imageCard } from './objects/imageCard'
import { textCard } from './objects/textCard'
import { videoCard } from './objects/videoCard'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [product, experiment, project, photoCity, curationItem, row, imageCard, textCard, videoCard],
}
