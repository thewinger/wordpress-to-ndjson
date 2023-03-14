import axios from 'axios'
import ora from 'ora'

import { cleanHTML, BASE_PATH, handleError } from '../utils'
import { WPCategory, ToCategory } from '../interfaces/Category'

export const formatCategories = (categories: WPCategory[]): ToCategory[] => {
  const loader = ora().start('Categories formatting...')
  const output: ToCategory[] = categories
    .filter(({ count }) => !!count)
    .map(({ slug, name }) => ({
      _type: 'tipo',
      _id: `tipo-${slug}`,
      title: cleanHTML(name),
    }))

  loader.succeed('Categories formatted')
  return output
}

export async function getCategories(siteUrl: string): Promise<WPCategory[]> {
  const url = `${siteUrl}${BASE_PATH}/categories?hide_emtpy=false&per_page=100`
  const loader = ora().start('Fetch Categories...')

  try {
    const res = await axios.get<WPCategory[]>(url)
    loader.succeed(`${res.data.length} Categories received`)
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      loader.fail(`Failed to fetch categories => ${error.toString()}`)
    }
    return []
  }
}

export default async function (siteUrl: string): Promise<ToCategory[]> {
  try {
    const categories = await getCategories(siteUrl)
    const formatted = formatCategories(categories)
    return formatted
  } catch (error) {
    if (error instanceof Error) {
      handleError(error)
    }
    return []
  }
}
