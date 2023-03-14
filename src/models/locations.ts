import axios from 'axios'
import ora from 'ora'

import { cleanHTML, BASE_PATH, handleError } from '../utils'
import { WPLocation, ToLocation, LocationParent } from '../interfaces/Location'

async function getParent(id: number): Promise<LocationParent> {
  const url = 'https://wp.winsrvr.com/wp-json/wp/v2/location/' + id
  const loader = ora().start('Fetching Parent...' + url)
  try {
    const res = await axios.get<WPLocation>(url)
    loader.succeed('Parent received')
    return {
      _ref: `localizacion-${res.data.slug}`,
      _type: 'reference',
    }
  } catch (error) {
    if (error instanceof Error) {
      loader.warn(`Failed to fetch post Location => ${error.message}`)
    }

    return {
      _ref: 'false',
      _type: 'reference',
    }
  }
}

async function formatLocation({
  slug,
  name,
  parent,
}: WPLocation): Promise<ToLocation> {
  let location: ToLocation = {
    _type: 'localizacion',
    _id: `localizacion-${slug}`,
    title: cleanHTML(name),
    ...(parent > 0 && {
      parent: await getParent(parent),
    }),
  }
  return location
}

async function formatLocations(locations: WPLocation[]): Promise<ToLocation[]> {
  const loader = ora().start('Location formatting...')
  const output = [] as ToLocation[]

  for (const node of locations) {
    const location = await formatLocation(node)
    if (location) {
      output.push(location)
    }
  }

  loader.succeed('Locations formatted')
  return output as ToLocation[]
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
    const formatted = await formatLocations(location)
    return formatted
  } catch (error) {
    if (error instanceof Error) {
      handleError(error)
    }
    return []
  }
}
