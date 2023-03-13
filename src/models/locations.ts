import axios from 'axios'
import ora from 'ora'

import { cleanHTML, BASE_PATH, handleError } from '../utils'
import { WPLocation, ToLocation } from '../interfaces/Location'

export const formatLocation = (location: WPLocation[]): ToLocation[] => {
  const loader = ora().start('Location formatting...')
  const output: ToLocation[] = location
    .filter(({ count }) => !!count)
    .map(({ slug, name }) => ({
      _type: 'localizacion',
      _id: slug,
      title: cleanHTML(name),
      slug: {
        _type: 'slug',
        current: slug,
      },
    }))

  loader.succeed('Location formatted')
  return output
}

export async function getLocation(siteUrl: string): Promise<WPLocation[]> {
  const url = `${siteUrl}${BASE_PATH}/location?hide_emtpy=false&per_page=100`
  const loader = ora().start('Fetch Location...')

  try {
    const res = await axios.get<WPLocation[]>(url)
    loader.succeed('Location received')
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      loader.fail(`Failed to fetch location => ${error.toString()}`)
    }
    return []
  }
}

export default async function (siteUrl: string): Promise<ToLocation[]> {
  try {
    const location = await getLocation(siteUrl)
    const formatted = formatLocation(location)
    return formatted
  } catch (error) {
    if (error instanceof Error) {
      handleError(error)
    }
    return []
  }
}
