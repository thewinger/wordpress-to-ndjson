#!/usr/bin/env node

import { checkUrl, writeFile, formatUrl } from '../utils'
import path from 'path'
import getCategory from '../models/categories'
import getPosts from '../models/posts'
import getLocation from '../models/locations'
import getFeatures from '../models/features'

/* interface Argv extends ParsedArgs {
  url?: string
  dest?: string
}
 */
const cli = async () => {
  // Get CLI arguments
  /* const options: Opts = {
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
  ) */

  const url = 'http://wp-local.local'
  /* const url = 'https://wp.winsrvr.com' */
  /* const url = 'https://inmogolfbonalba.com' */
  const dest = path.join(__dirname, '..', '..', 'output', `documents.ndjson`)
  // Fetch data
  const siteUrl = formatUrl(url as string)
  /* const tipo = await getCategory(siteUrl) */
  /* const localizacion = await getLocation(siteUrl) */
  /* const caracteristicas = await getFeatures(siteUrl) */
  const posts = await getPosts(siteUrl)

  // Write output
  writeFile(
    /* [...tipo, ...localizacion, ...caracteristicas, ...posts], */
    [...posts],
    dest as string,
  )

  console.log('cli finished')
}

cli()
