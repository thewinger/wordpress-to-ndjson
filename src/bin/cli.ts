#!/usr/bin/env node

import minimist, { ParsedArgs, Opts } from 'minimist'

import { checkUrl, writeFile, handleError } from '../utils'
import { getCategories, formatCategories } from '../models/categories'
import { getPosts, formatPosts } from '../models/posts'

interface Argv extends ParsedArgs {
  url?: string
}

const options: Opts = {
  alias: {
    u: 'url',
  },
  string: ['url'],
}

const argv: Argv = minimist(process.argv.slice(2), options)

if (typeof argv?.url === 'string' && checkUrl(argv.url)) {
  // Transform Categories
  getCategories(argv.url)
    .then(formatCategories)
    .then((elements) => writeFile(elements, 'category.ndjson'))
    .catch(handleError)

  // Transform Posts
  getPosts(argv.url)
    .then(formatPosts)
    .then((elements) => writeFile(elements, 'post.ndjson'))
    .catch(handleError)
}
