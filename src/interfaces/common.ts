export interface WPPostType {
  id: number
  date: string
  date_gmt: string
  guid: Rendered
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string

  link: string
  title: Rendered
  author: number
  comment_status: string
  ping_status: string
  template: string
}

export interface Rendered {
  rendered: string
}

export interface Link {
  href: string
}
