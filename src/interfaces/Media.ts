import { Rendered } from './common'

export interface WPImage {
  guid: Rendered
  media_details: MediaDetails
  menu_order: number
}

export interface MediaDetails {
  file: string
}

export interface ToImage {
  url: string
  alt?: string
  title?: string
}
