import { WPPostType, Rendered, Link } from './common'

export interface WPImage extends WPPostType {
  description: Rendered
  caption: Rendered
  alt_text: string
  media_type: string
  mime_type: string
  media_details: MediaDetails
  post: number
  source_url: string
  _links: Links
}

export interface Links {
  self: Link[]
  collection: Link[]
  about: Link[]
  author: Link[]
  replies: Link[]
}

export interface MediaDetails {
  width: number
  height: number
  file: string
  sizes: MediaDetailsSizes
  image_meta: ImageMeta
  original_image: string
}

export interface ImageMeta {
  aperture: string
  credit: string
  camera: string
  caption: string
  created_timestamp: string
  copyright: string
  focal_length: string
  iso: string
  shutter_speed: string
  title: string
  orientation: string
  keywords: any[]
}

export interface MediaDetailsSizes {
  [key: string]: {
    file: string
    width: number
    height: number
    mime_type: string
    source_url: string
  }
}

export interface Stats {
  percent: number
  bytes: number
  size_before: number
  size_after: number
  time: number
  api_version: string
  lossy: boolean
  keep_exif: number
}

export interface ToImage {
  url: string
  alt?: string
  title?: string
}
