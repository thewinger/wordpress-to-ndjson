export interface WPPostType {
  id: number
  date: string
  date_gmt: string
  guid: Rendered
  modified: string
  modified_gmt: string
  title: Rendered
  slug: string
  status: string
  type: string
}

export interface Rendered {
  rendered: string
}

export interface Link {
  href: string
}
