import axios from 'axios'
import ora from 'ora'
import fs from 'fs'
import path from 'path'

import { cleanHTML, BASE_PATH, normalizeDateTime, handleError } from '../utils'
import {
  WPPost,
  ToPost,
  ToPostCategory,
  Imagen,
  ToPostFeatures,
  ToPostLocation,
} from '../interfaces/Post'
import { WPCategory } from '../interfaces/Category'
import { WPFeatures } from '../interfaces/Features'
import { WPLocation } from '../interfaces/Location'
import { WPImage } from '../interfaces/Media'

const logger = ora()

async function getPostCategories(url: string): Promise<ToPostCategory[]> {
  try {
    const res = await axios.get<WPCategory[]>(url)
    return res.data.map(({ slug }) => ({
      _ref: slug,
      _type: 'reference',
    }))
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Failed to fetch post categories => ${error.message}`)
    }
    return []
  }
}

async function getPostFeatures(url: string): Promise<ToPostFeatures[]> {
  try {
    const res = await axios.get<WPFeatures[]>(url)
    return res.data.map(({ slug }) => ({
      _ref: slug,
      _type: 'reference',
    }))
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Failed to fetch post categories => ${error.message}`)
    }
    return []
  }
}

async function getPostLocation(url: string): Promise<ToPostLocation[]> {
  try {
    const res = await axios.get<WPLocation[]>(url)
    return res.data.map(({ slug }) => ({
      _ref: slug,
      _type: 'reference',
    }))
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Failed to fetch post categories => ${error.message}`)
    }
    return []
  }
}

async function downloadImage(
  url: string,
  filePath: string,
  order: string,
): Promise<void> {
  const fileName = `${order}-${path.basename(url)}`
  const localFilePath = path.resolve(__dirname, '..', '..', filePath, fileName)

  if (!fs.existsSync(filePath)) {
    console.log(`${filePath} doesn't exists`)
    fs.mkdirSync(filePath, { recursive: true })
    console.log(`${filePath} created`)
  }

  try {
    const response = await axios.get(encodeURI(url), { responseType: 'stream' })

    console.log('trying', url)
    const w = response.data.pipe(fs.createWriteStream(localFilePath))
    w.on('data', () => {
      console.log(`starts ${localFilePath}`)
    })
    w.on('finish', () => {
      console.log(`Successfully downloaded ${localFilePath}`)
    })
  } catch (error) {
    logger.fail(`---> Error con ${url}`)
    if (error instanceof Error) {
      handleError(error)
    }
  }
}

async function getPostImages(url: string, postSlug: string): Promise<Imagen[]> {
  const moreUrl = url + '&per_page=100'
  try {
    const res = await axios.get<WPImage[]>(moreUrl)
    res.data.map(({ guid, menu_order }) => {
      downloadImage(
        guid.rendered,
        `output/assets/${postSlug}/`,
        menu_order.toString(),
      )
    })
    return res.data.map(({ guid }) => ({
      _type: 'imagen',
      _sanityAsset: `image@${guid.rendered}`,
    }))
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Failed to fetch post images => ${error.message}`)
    }
    return []
  }
}

function booleanFeatured(featured: string): boolean {
  if (featured === 'No') {
    return false
  } else {
    return true
  }
}

async function formatPost({
  slug,
  title: { rendered: title },
  date,
  modified,
  ...node
}: WPPost): Promise<ToPost> {
  let post: ToPost = {
    _id: slug,
    _type: 'propiedad',
    _createdAt: normalizeDateTime(date),
    _updatedAt: normalizeDateTime(modified),
    bathrooms: +node.meta._bathrooms[0],
    bedrooms: +node.meta._bedrooms[0],
    description: node.meta._comment_area[0],
    price: +node.meta._price[0],
    featured: booleanFeatured(node.meta._featured[0]),
    operacion: node.meta._statustag[0],
    slug: {
      _type: 'slug',
      current: slug,
    },
    title: cleanHTML(title),
    images: [],
    tipo: [],
    localizacion: [],
    caracteristicas: [],
  }

  // Add categories
  const categories = node._links['wp:term'].filter(
    ({ taxonomy }) => taxonomy === 'category',
  )
  if (categories) {
    post = {
      ...post,
      tipo: await getPostCategories(categories[0].href),
    }
  }

  const location = node._links['wp:term'].filter(
    ({ taxonomy }) => taxonomy === 'location',
  )
  if (location) {
    post = {
      ...post,
      localizacion: await getPostLocation(location[0].href),
    }
  }

  const features = node._links['wp:term'].filter(
    ({ taxonomy }) => taxonomy === 'features',
  )
  if (features) {
    post = {
      ...post,
      caracteristicas: await getPostFeatures(features[0].href),
    }
  }
  // Add images
  const images = node._links['wp:attachment']
  if (images) {
    post = {
      ...post,
      images: await getPostImages(images[0].href, post.slug.current),
    }
  }

  return post
}

export async function formatPosts(posts: WPPost[]): Promise<ToPost[]> {
  const progress = ora().start('Posts formatting...')
  const output = []

  for (const node of posts) {
    /* if (node.status === 'publish') { */
    const post = await formatPost(node)
    if (post) {
      output.push(post)
    }
    /* } */
  }

  progress.succeed('Posts formatted')
  return output as ToPost[]
}

export async function getPosts(siteUrl: string): Promise<WPPost[]> {
  const progress = ora().start('Fetch Posts...')
  const url = `${siteUrl}${BASE_PATH}/properties?per_page=100`

  try {
    const res = await axios.get<WPPost[]>(url)
    progress.succeed('Posts received')
    return res.data
  } catch (error) {
    if (error instanceof Error) {
      progress.fail(`Failed to fetch posts => ${error.message}`)
    }
    return []
  }
}

export default async function (siteUrl: string): Promise<ToPost[]> {
  try {
    const posts = await getPosts(siteUrl)
    const formatted = await formatPosts(posts)
    return formatted
  } catch (error) {
    if (error instanceof Error) {
      handleError(error)
    }
    return []
  }
}
