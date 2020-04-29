import axios from 'axios'
import ora from 'ora'

import {
  cleanHTML,
  BASE_PATH,
  normalizeDateTime,
  stringToBlock,
} from '../utils'
import { WPPost, ToPost, TpPostCategory, MainImage } from '../interfaces/Post'
import { WPCategory } from '../interfaces/Category'
import { WPImage } from '../interfaces/Media'

const logger = ora()

async function getPostCategories(url: string): Promise<TpPostCategory[]> {
  try {
    const res = await axios.get<WPCategory[]>(url)
    return res.data.map(({ slug }) => ({
      _ref: slug,
      _type: 'reference',
    }))
  } catch (error) {
    logger.warn(
      `Failed to fetch post categories => ${error.config.url} ${
        error.response.status
      } ${error.response.statusText || ''}`,
    )
    return []
  }
}

async function getPostImage(url: string): Promise<MainImage | undefined> {
  try {
    const res = await axios.get<WPImage>(url)
    const { guid, caption, alt_text } = res.data
    return {
      _type: 'mainImage',
      // prefix image url for Sanity => https://www.sanity.io/docs/importing-data
      _sanityAsset: `image@${guid.rendered}`,
      alt: cleanHTML(alt_text),
      caption: cleanHTML(caption.rendered),
    }
  } catch (error) {
    logger.warn(
      `Failed to fetch post image => ${error.config.url} ${
        error.response.status
      } ${error.response.statusText || ''}`,
    )
    return undefined
  }
}

async function formatPost({
  slug,
  title: { rendered: title },
  excerpt: { rendered: excerpt },
  content: { rendered: content },
  date,
  modified,
  ...node
}: WPPost): Promise<ToPost> {
  let post: ToPost = {
    _id: slug,
    _type: 'post',
    _createdAt: normalizeDateTime(date),
    _updatedAt: normalizeDateTime(modified),
    slug: {
      _type: 'slug',
      current: slug,
    },
    title: cleanHTML(title),
    excerpt: cleanHTML(excerpt),
    body: [stringToBlock(cleanHTML(content))],
    mainImage: undefined,
    categories: [],
  }

  // Add categories
  const categories = node._links['wp:term'].filter(
    ({ taxonomy }) => taxonomy === 'category',
  )
  if (categories) {
    post = await {
      ...post,
      categories: await getPostCategories(categories[0].href),
    }
  }

  // Add Image
  const featured = node._links['wp:featuredmedia']
  if (featured) {
    post = await {
      ...post,
      mainImage: await getPostImage(featured[0].href),
    }
  }

  return post
}

export async function formatPosts(posts: WPPost[]): Promise<ToPost[]> {
  const progress = ora().start('Posts formatting...')
  const output = []

  for (const node of posts) {
    if (node.status === 'publish') {
      const post = await formatPost(node)
      if (post) {
        output.push(post)
      }
    }
  }

  progress.succeed('Posts formatted')
  return output as ToPost[]
}

export async function getPosts(siteUrl: string): Promise<WPPost[]> {
  const progress = ora().start('Fetch Posts...')
  const url = `${siteUrl}${BASE_PATH}/posts?per_page=3`

  try {
    const res = await axios.get<WPPost[]>(url)
    progress.succeed('Posts received')
    return res.data
  } catch (error) {
    progress.fail(`Failed to fetch posts => ${error.code}`)
    return []
  }
}
