import { groq } from 'next-sanity'

export const projectsByTypeQuery = groq`
  *[_type == $type] | order(orderRank) {
    _id,
    title,
    slug,
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
        },
        images[] {
            ...,
            asset->{
                ...,
                metadata {
                    dimensions
                }
            }
        }
      }
    }
  }
`

export const photoCitiesQuery = groq`
  *[_type == "photoCity"] | order(order asc) {
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
        textColor,
        images[] {
            ...,
            asset->{
                ...,
                metadata {
                    dimensions
                }
            }
        }
      }
    }
  }
`

export const curationItemsQuery = groq`
  *[_type == "curationItem"] | order(_createdAt desc) {
    _id,
    title,
    image,
    url,
    category->{
        title,
        slug
    }
  }
`

export const curationCategoriesQuery = groq`
  *[_type == "curationCategory"] | order(order asc) {
    title,
    slug
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
