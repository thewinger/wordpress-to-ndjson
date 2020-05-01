import { WPPostType, Rendered, Link } from './common'

export interface WPPost extends WPPostType {
  content: Rendered
  excerpt: Rendered
  featured_media: number
  sticky: boolean
  format: string
  categories: number[]
  tags: number[]
  _links: Links
}

export interface Links {
  self: Link[]
  collection: Link[]
  about: Link[]
  author: Link[]
  replies: Link[]
  'wp:featuredmedia': Link[]
  'wp:term': TermLink[]
}

export interface TermLink extends Link {
  taxonomy: string
}

export interface TpPostCategory {
  _ref: string
  _type: 'reference'
}

export interface MainImage {
  _type: 'mainImage'
  _sanityAsset: string
  alt?: string
  caption?: string
}
export interface BlockTextChild {
  _type: 'span'
  marks: []
  text: string
}
export interface BlockText {
  _type: 'block'
  style: 'normal'
  children: BlockTextChild[]
  markDefs: []
}

export interface ToPost {
  _id: string
  _type: 'post'
  _createdAt?: string
  _updatedAt?: string
  slug: {
    _type: 'slug'
    current: string
  }
  title: string
  excerpt?: string
  body?: any
  categories?: TpPostCategory[]
  mainImage?: MainImage
}
