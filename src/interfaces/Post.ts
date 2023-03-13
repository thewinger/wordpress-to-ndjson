import { WPPostType, Link, Rendered } from './common'

export interface WPPost extends WPPostType {
  _links: Links
  categories: number[]
  location: number[]
  features: number[]
  meta: MetaData
}

export interface MetaData {
  _statustag: string[]
  _featured: string[]
  _price: string[]
  _housesize: string[]
  _yearbuilt: string[]
  _bedrooms: string[]
  _bathrooms: string[]
  _comment_area: string[]
}
export interface Links {
  self: Link[]
  collection: Link[]
  about: Link[]
  author: Link[]
  replies: Link[]
  'wp:attachment': Link[]
  'wp:term': TermLink[]
}

export interface TermLink extends Link {
  taxonomy: string
}

export interface ToPostCategory {
  _ref: string
  _type: 'reference'
}

export interface ToPostLocation {
  _ref: string
  _type: 'reference'
}

export interface ToPostFeatures {
  _ref: string
  _type: 'reference'
}

export interface Imagen {
  _type: 'imagen'
  _sanityAsset: string
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
  _createdAt?: string
  _id: string
  _type: 'propiedad'
  _updatedAt?: string
  bathrooms: number
  bedrooms: number
  caracteristicas?: ToPostFeatures[]
  description: string
  featured: Boolean
  images?: Imagen[]
  slug: {
    _type: 'slug'
    current: string
  }
  title: string
  operacion: string
  price: number
  tipo: ToPostCategory[]
  localizacion?: ToPostLocation[]
}
