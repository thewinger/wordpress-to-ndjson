export interface WPCategory {
  id: number
  count: number
  description: string
  name: string
  slug: string
  taxonomy: string
}

export interface ToCategory {
  _id: string
  _type: 'category'
  _createdAt?: string
  _updatedAt?: string
  title: string
  slug: {
    _type: 'slug'
    current: string
  }
  description: string
}
