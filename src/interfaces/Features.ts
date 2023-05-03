export interface WPFeatures {
  id: number
  count: number
  description: string
  name: string
  slug: string
  taxonomy: string
}

export interface ToFeatures {
  _id: string
  _type: 'caracteristicas'
  title: {
    'es': string
    'en': string
  }
}
