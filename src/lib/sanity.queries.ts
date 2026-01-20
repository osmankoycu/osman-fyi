import { groq } from 'next-sanity'

export const projectsByTypeQuery = groq`
  *[_type == "project" && type == $type] | order(year desc) {
    _id,
    title,
    slug,
    type,
    year,
    roleLine,
    rows[] {
      _key,
      layout,
      items[] {
        _type,
        image,
        alt,
        caption,
        text
      }
    }
  }
`

export const photoCitiesQuery = groq`
  *[_type == "photoCity"] | order(title asc) {
    _id,
    title,
    slug,
    country,
    subtitle,
    rows[] {
      _key,
      layout,
      items[] {
        _type,
        image,
        alt,
        caption
      }
    }
  }
`

export const curationItemsQuery = groq`
  *[_type == "curationItem"] | order(_createdAt desc) {
    _id,
    title,
    image,
    url
  }
`
