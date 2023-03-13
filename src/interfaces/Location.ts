export interface WPLocation {
  id: number
  count: number
  description: string
  name: string
  slug: string
  taxonomy: string
}

export interface ToLocation {
  _id: string
  _type: 'localizacion'
  _createdAt?: string
  _updatedAt?: string
  title: string
}
