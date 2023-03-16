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
const config = {
  headers: {
    Authorization: 'Basic YWRtaW46TEZybiA1SEs5IEt6aEMgY0lnOSBKUm5IIFZzc3k=',
    /* Authorization: 'Basic YWRtaW46UTVvSSBZeElLIE44bmUgV1ExQyAxR0tkIDd1UEo=', */
  },
}

async function getPostCategories(url: string): Promise<ToPostCategory[]> {
  try {
    const res = await axios.get<WPCategory[]>(url, config)
    console.log(`categories grabbed`)
    return res.data.map(({ slug }) => ({
      _ref: `tipo-${slug}`,
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
    const res = await axios.get<WPFeatures[]>(url, config)
    console.log(`features grabbed`)
    return res.data.map(({ slug }) => ({
      _ref: `caracteristicas-${slug}`,
      _type: 'reference',
    }))
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Failed to fetch post caracteristicas => ${error.message}`)
    }
    return []
  }
}

async function getPostLocation(
  url: string,
): Promise<ToPostLocation | undefined> {
  try {
    const res = await axios.get<WPLocation[]>(url, config)

    if (res.data.length === 1) {
      return {
        _ref: `localizacion-${res.data[0].slug}`,
        _type: 'reference',
      }
    } else {
      const locationWithParent = res.data.find(
        (location) => location.parent !== 0,
      )
      if (locationWithParent) {
        return {
          _ref: `localizacion-${locationWithParent.slug}`,
          _type: 'reference',
        }
      } else {
        logger.warn('No courses with parent different than 0')
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Failed to fetch post location => ${error.message}`)
    }
    return
  }
}

async function downloadImage(
  url: string,
  filePath: string,
  order: string,
): Promise<void> {
  const fileName = `${order}-${path.basename(url)}`
  const localFilePath = path.resolve(__dirname, '..', '..', filePath, fileName)

  // If image already exists -> return
  if (fs.existsSync(localFilePath)) {
    console.log(`Path ${localFilePath} exists`)
    return
  }

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true })
  }

  const writer = fs.createWriteStream(localFilePath)

  try {
    const response = await axios.get(encodeURI(url), {
      ...config,
      responseType: 'stream',
    })
    return new Promise((resolve, reject) => {
      response.data
        .pipe(writer)
        .on('error', () => {
          console.log(`Error downloading ${url} --> ${Error}`)
          /* reject() */
        })
        .on('data', () => {
          /* logger.start(`Downloading ${url}`) */
        })
        .on('finish', () => {
          /* logger.succeed(`Successfully downloaded ${url}`) */
          resolve()
        })
    })
  } catch (error) {
    /* logger.fail(`---> Error con ${url}`) */
    handleError(error)
  }
}

async function filterImages(postImages: WPImage[]): Promise<WPImage[]> {
  const filteredPostImages = [] as WPImage[]

  for (const image of postImages) {
    try {
      const response = await axios.head(image.guid.rendered)
      if (response.headers['content-length'] > 0) {
        filteredPostImages.push(image)
      }
    } catch (error) {
      handleError(error.response.data)
    }
  }

  return filteredPostImages
}

async function getPostImages(url: string, postSlug: string): Promise<Imagen[]> {
  const moreUrl = url + '&per_page=100&orderby=menu_order&order=asc'
  // TODO Move try catch just with axios requests
  try {
    const res = await axios.get<WPImage[]>(moreUrl, config)
    const filteredPostImages = await filterImages(res.data)
    Promise.all(
      filteredPostImages.map(async ({ guid, menu_order }) => {
        await downloadImage(
          guid.rendered,
          `output/images/${postSlug}/`,
          menu_order.toString(),
        )
      }),
    )
    return filteredPostImages.map(({ guid, menu_order }) => ({
      _type: 'imagen',
      _sanityAsset: `image@file://./images/${postSlug}/${menu_order.toString()}-${path.basename(
        guid.rendered,
      )}`,
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
  console.log(`Formatting post ${slug}`)
  let post: ToPost = {
    _id: title.toLowerCase(),
    _type: 'propiedad',
    _createdAt: normalizeDateTime(date),
    _updatedAt: normalizeDateTime(modified),
    bathrooms: node.meta._bathrooms[0],
    bedrooms: node.meta._bedrooms[0],
    description: node.meta._comment_area[0],
    price: +node.meta._price[0],
    featured: booleanFeatured(node.meta._featured[0]),
    operacion: node.meta._statustag[0].toLowerCase().replace(' ', '-'),
    slug: {
      _type: 'slug',
      current: slug,
    },
    title: cleanHTML(title).toUpperCase(),
    images: [],
    tipo: [],
    localizacion: { _ref: '', _type: 'reference' },
    caracteristicas: [],
  }

  if (node.status !== 'publish') {
    post = {
      ...post,
      _id: `draft.${slug}`,
    }
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
    console.log(`we have images`)
    post = {
      ...post,
      images: await getPostImages(images[0].href, post.slug.current),
    }
  }
  console.log(`Post ${slug} formatted`)
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
  /* const params = '?status=publish,draft,private&per_page=5' */
  const params = '?status=publish,draft,private'
  const url = `${siteUrl}${BASE_PATH}/properties${params}`

  try {
    const res = await axios.get<WPPost[]>(url, config)
    progress.succeed(`${res.data.length} Posts received`)
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
    logger.isSpinning && logger.stop()
    return formatted
  } catch (error) {
    if (error instanceof Error) {
      handleError(error)
    }
    return []
  }
}
