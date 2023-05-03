export interface WPCategory {
  id: number
  count: number
  name: string
  taxonomy: string
  slug: string
}

export interface ToCategory {
  _id: string
  _type: 'tipo'
  title: {
    "es": string,
    "en": string
  }
}
