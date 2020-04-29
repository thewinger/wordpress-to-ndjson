import axios from 'axios'

import { cleanHTML, BASE_PATH } from '../utils/utils'
import log from '../utils/logger'
import { WPCategory, ToCategory } from '../interfaces/Category'

export const formatCategories = (categories: WPCategory[]): ToCategory[] => {
  // TODO : Loader
  return categories
    .filter(({ count }) => !!count)
    .map(({ slug, name, description }) => ({
      title: cleanHTML(name),
      slug,
      description: cleanHTML(description),
    }))
}

export async function getCategories(siteUrl: string): Promise<WPCategory[]> {
  // TODO : Loader
  const url = `${siteUrl}${BASE_PATH}/categories?per_page=100`
  log.info(`Start fetching categories => ${url}`)

  try {
    const res = await axios.get<WPCategory[]>(url)
    return res.data
  } catch (error) {
    log.error(`Failed to fetch categories => ${error.toString()}`)
    return []
  }
}
