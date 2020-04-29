#!/usr/bin/env node

import minimist, { ParsedArgs, Opts } from 'minimist'

import log from '../utils/logger'
import { checkUrl, writeFile } from '../utils/utils'
import { getCategories, formatCategories } from '../models/categories'
import { getPosts, formatPosts } from '../models/posts'

log.info('CLI Starting...')

interface Argv extends ParsedArgs {
  url?: string
}

const options: Opts = {
  alias: {
    u: 'url',
  },
  string: ['url'],
  //   boolean: [],
}

const argv: Argv = minimist(process.argv.slice(2), options)

if (checkUrl(argv.url)) {
  // Transform Categories
  getCategories(argv.url as string)
    .then(formatCategories)
    .then((elements) =>
      writeFile(elements, 'categories.txt')
        .then(log.success)
        .catch((error) => log.error(error.toString())),
    )
    .catch(console.log)

  // Transform Posts
  getPosts(argv.url as string)
    .then(formatPosts)
    .then((elements) =>
      writeFile(elements, 'posts.txt')
        .then(log.success)
        .catch((error) => log.error(error.toString())),
    )
    .catch(console.log)
}
