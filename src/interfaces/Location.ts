export interface WPLocation {
  id: number
  count: number
  description: string
  name: string
  slug: string
  taxonomy: string
  parent: number
  parentSlug?: string
}

export interface ToLocation {
  _id: string
  _type: 'localizacion'
  _createdAt?: string
  _updatedAt?: string
  title: string
  parent?: LocationParent
}

export interface LocationParent {
  _ref: string
  _type: 'reference'
}
