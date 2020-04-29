import axios from 'axios'

import { cleanHTML, BASE_PATH } from '../utils/utils'
import log from '../utils/logger'
import { WPPost, ToPost } from '../interfaces/Post'
import { WPCategory } from '../interfaces/Category'
import { WPImage, ToImage } from '../interfaces/Media'

async function getPostCategories(url: string): Promise<string[]> {
  try {
    const res = await axios.get<WPCategory[]>(url)
    return res.data.map(({ slug }) => slug)
  } catch (error) {
    log.error(`Failed to fetch post categories => ${error.code}`)
    log.warn(
      `Failed to fetch post categories => ${error.config.url} ${
        error.response.status
      } ${error.response.statusText || ''}`,
    )
    return []
  }
}

async function getPostImage(url: string): Promise<ToImage | undefined> {
  try {
    const res = await axios.get<WPImage>(url)
    const {
      guid: { rendered: guid },
      alt_text,
    } = res.data
    // prefix image url for Sanity
    // https://www.sanity.io/docs/importing-data
    return { url: `image@${guid}`, alt: cleanHTML(alt_text) }
  } catch (error) {
    log.warn(
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
  status,
  ...node
}: WPPost): Promise<ToPost> {
  let post: ToPost = {
    slug,
    title: cleanHTML(title),
    excerpt: cleanHTML(excerpt),
    content: cleanHTML(content),
    created: date,
    updated: modified,
    status,
    image: undefined,
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
      image: await getPostImage(featured[0].href),
    }
  }

  return post
}

export async function formatPosts(posts: WPPost[]): Promise<ToPost[]> {
  // TODO : Loader
  const output = []
  for (const node of posts) {
    const post = await formatPost(node)
    if (post) {
      output.push(post)
    }
  }
  return output as ToPost[]
}

export async function getPosts(siteUrl: string): Promise<WPPost[]> {
  // TODO : Loader
  const url = `${siteUrl}${BASE_PATH}/posts?per_page=100`
  log.info(`Start fetching posts => ${url}`)

  try {
    const res = await axios.get<WPPost[]>(url)
    return res.data
  } catch (error) {
    log.error(`Failed to fetch posts => ${error.code}`)
    return []
  }
}
