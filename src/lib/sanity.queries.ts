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
      backgroundColor,
      items[] {
        _type,
        image {
            ...,
            asset->{
                ...,
                metadata {
                    dimensions
                }
            }
        },
        alt,
        caption,
        text,
        backgroundColor,
        textColor,
        video {
            asset -> {
                url
            }
        }
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
      backgroundColor,
      items[] {
        _type,
        image {
            ...,
            asset->{
                ...,
                metadata {
                    dimensions
                }
            }
        },
        alt,
        caption,
        backgroundColor,
        textColor
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

export const aboutPageQuery = groq`
  *[_type == "about"][0] {
    _id,
    heroImage,
    heroImage2,
    bio
  }
`
