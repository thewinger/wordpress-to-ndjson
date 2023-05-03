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
    /* Authorization: 'Basic YWRtaW46TEZybiA1SEs5IEt6aEMgY0lnOSBKUm5IIFZzc3k=', // wp.winsrvr */
    Authorization: 'Basic YWRtaW46UTVvSSBZeElLIE44bmUgV1ExQyAxR0tkIDd1UEo=', // wp-local
  },
}

fs.unlink(`log.txt`, (err) => {
  if (err) throw err
})

let util = require('util')
let logFile = fs.createWriteStream('log.txt', { flags: 'a' })
// Or 'w' to truncate the file every time the process starts.
let logStdout = process.stdout

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n')
  logStdout.write(util.format.apply(null, arguments) + '\n')
}
console.error = console.log

async function getPostCategories(
  url: string,
  propertyType: string,
): Promise<ToPostCategory> {
  let category: ToPostCategory = {
    _ref: `tipo-${propertyType.toLowerCase()}`,
    _type: 'reference',
  }
  try {
    const res = await axios.get<WPCategory[]>(url, config)
    console.log(`categories grabbed`)
    return (category = {
      _ref: `tipo-${res.data[0].slug}`,
      _type: 'reference',
    })
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Failed to fetch post categories => ${error.message}`)
    }
  }
  return category
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

function fileExists(filePath: string) {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

async function copyFile(source: string, target: string) {
  fs.copyFile(source, target, (err) => {
    if (err) {
      console.log(`Error with file: ${source} ---- ${err}`)
    }
  })
}

async function filterImages(postImages: WPImage[]): Promise<WPImage[]> {
  const filteredPostImages = [] as WPImage[]

  try {
    for (let image of postImages) {
      const imgFullPath = path.resolve(
        __dirname,
        '..',
        '..',
        /* 'output', */
        'uploads',
        image.media_details.file,
      )
      const destFullPath = path.resolve(
        __dirname,
        '..',
        '..',
        'output',
        'uploads',
        image.media_details.file,
      )
      console.log(`filtering ${imgFullPath}`)

      if (await fileExists(imgFullPath)) {
        fs.mkdirSync(path.dirname(destFullPath), { recursive: true })
        await copyFile(imgFullPath, destFullPath)
        filteredPostImages.push(image)
      } else {
        console.log(`Image at ${imgFullPath} doesn't exists`)
      }
    }
  } catch (error) {
    handleError(error.response.data)
  }

  return filteredPostImages
}

async function getPostImages(url: string): Promise<Imagen[]> {
  const moreUrl = url + '&per_page=100&orderby=menu_order&order=asc'
  let filteredPostImages = [] as WPImage[]

  try {
    const res = await axios.get<WPImage[]>(moreUrl, config)
    filteredPostImages = await filterImages(res.data)
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Failed to fetch post images => ${error.message}`)
    }
  }

  return filteredPostImages.map(({ media_details }) => ({
    _type: 'imagen',
    _sanityAsset: `image@file://./uploads/${path.dirname(
      media_details.file,
    )}/${path.basename(media_details.file)}`,
  }))
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
    bathrooms: Number(node.meta._bathrooms[0]),
    bedrooms: Number(node.meta._bedrooms[0]),
    description: node.meta._comment_area[0],
    price: Number(node.meta._price[0]),
    size: Number(node.meta._housesize[0]),
    year: Number(node.meta._yearbuilt[0]),
    featured: booleanFeatured(node.meta._featured[0]),
    slug: {
      _type: 'slug',
      current: slug,
    },
    title: cleanHTML(title).toUpperCase(),
    images: [],
    tipo: { _ref: '', _type: 'reference' },
    localizacion: { _ref: '', _type: 'reference' },
    operacion: {
      _ref: `operacion-${node.meta._statustag[0]
        .toLowerCase()
        .replace(' ', '-')}`,
      _type: 'reference',
    },
    caracteristicas: [],
  }

  if (node.status !== 'publish') {
    post = {
      ...post,
      _id: `drafts.${slug}`,
    }
  }

  // Add categories
  const categories = node._links['wp:term'].filter(
    ({ taxonomy }) => taxonomy === 'category',
  )
  if (categories) {
    post = {
      ...post,
      tipo: await getPostCategories(
        categories[0].href,
        node.meta._propertytype[0],
      ),
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
      images: await getPostImages(images[0].href),
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
  const params = '?status=publish,draft,private'
  /* const params = '?status=publish' */
  const url = `${siteUrl}${BASE_PATH}/properties${params}`

  try {
    const res = await axios.get<WPPost[]>(url, config)
    progress.succeed(
      `<========== ${res.data.length} Posts received ==========>`,
    )
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
