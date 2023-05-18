import axios from 'axios'
import ora from 'ora'

import { cleanHTML, BASE_PATH, handleError } from '../utils'
import { WPFeatures, ToFeatures } from '../interfaces/Features'

export const formatFeatures = (features: WPFeatures[]): ToFeatures[] => {
  const loader = ora().start('Features formatting...')
  const output: ToFeatures[] = features.map(({ slug, name }) => ({
    _type: 'caracteristicas',
    _id: `caracteristicas-${slug}`,
    title: {
      es: cleanHTML(name),
      en: `trans-${cleanHTML(name)}`,
    },
  }))

  loader.succeed('Features formatted')
  return output
}

export async function getFeatures(siteUrl: string): Promise<WPFeatures[]> {
  const url = `${siteUrl}${BASE_PATH}/features?hide_emtpy=false&per_page=100`
  const loader = ora().start('Fetch Features...')

  try {
    const res = await axios.get<WPFeatures[]>(url)
    loader.succeed(`${res.data.length} Caracteristicas received`)
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      loader.fail(`Failed to fetch features => ${error.toString()}`)
    }
    return []
  }
}

export default async function (siteUrl: string): Promise<ToFeatures[]> {
  try {
    const features = await getFeatures(siteUrl)
    const formatted = formatFeatures(features)
    return formatted
  } catch (error) {
    if (error instanceof Error) {
      handleError(error)
    }
    return []
  }
}
