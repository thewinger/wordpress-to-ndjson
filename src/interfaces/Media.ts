export interface WPImage {
  source_url: string
  media_details: MediaDetails
  menu_order: number
}

export interface MediaDetails {
  sizes: MediaDetailsSizes
}

export interface MediaDetailsSizes {
  full: {
    file: string
  }
}

export interface ToImage {
  url: string
  alt?: string
  title?: string
}
