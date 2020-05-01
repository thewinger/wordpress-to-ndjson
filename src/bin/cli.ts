#!/usr/bin/env node

import minimist, { ParsedArgs, Opts } from 'minimist'
import Inquirer from 'inquirer'

import { checkUrl, writeFile, formatUrl } from '../utils'
import getCategory from '../models/categories'
import getPosts from '../models/posts'
import questions from '../utils/questions'

interface Argv extends ParsedArgs {
  url?: string
  dest?: string
}

const cli = async () => {
  // Get CLI arguments
  const options: Opts = {
    alias: {
      u: 'url',
    },
    string: ['url'],
  }
  const argv: Argv = minimist(process.argv.slice(2), options)
  const isValidUrl = typeof argv?.url === 'string' && checkUrl(argv.url)

  // Ask questions if has missing argv
  const answers = await Inquirer.prompt(
    questions.filter((question) => {
      if (question.name === 'url' && isValidUrl) {
        return false
      }
      return true
    }),
  )

  const { url, dest } = { ...argv, ...answers }

  // Fetch data
  const siteUrl = formatUrl(url as string)
  const categories = await getCategory(siteUrl)
  const posts = await getPosts(siteUrl)

  // Write output
  writeFile([...categories, ...posts], dest as string)
}

cli()
