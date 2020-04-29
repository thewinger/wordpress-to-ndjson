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

export interface ToPost {
  slug: string
  title: string
  excerpt?: string
  content?: string
  created: string
  updated?: string
  status: string
  categories?: string[]
  image?: {
    url: string
    title?: string
    alt?: string
  }
}
