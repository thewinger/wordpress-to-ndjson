import Schema from '@sanity/schema'
import blockTools from '@sanity/block-tools'
import { JSDOM } from 'jsdom'
import { BlockText } from '../interfaces/Post'

const postSchema = {
  type: 'object',
  name: 'blogPost',
  fields: [
    {
      title: 'Body',
      name: 'body',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
}

export default function htmlToBlocks(html: string): BlockText[] {
  // Start with compiling a schema we can work against
  const rootSchema = Schema.compile({
    name: 'myBlog',
    types: [postSchema],
  })

  // The compiled schema type for the content type that holds the block array
  const blockContentType = rootSchema
    .get('blogPost')
    .fields.find((field: any) => field.name === 'body').type

  // Convert HTML to block array
  const blocks = blockTools.htmlToBlocks(html, blockContentType, {
    parseHtml: (html: string) => new JSDOM(html).window.document,
  })

  return blocks
}
