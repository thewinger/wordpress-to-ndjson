/* eslint-disable no-undef */
import url from 'url'
import fs from 'fs'
import path from 'path'

import log from './logger'

export const BASE_PATH = '/wp-json/wp/v2'

export function cleanHTML(html: string): string {
  return (
    html
      // remove html
      .replace(/<\/?[^>]+(>|$)/g, '')
      // decode characterSet
      .replace(/&#(\d+);/g, (_: any, dec: number) => String.fromCharCode(dec))
      // Replace n* newlines by only one newline
      .replace(/\n\s*\n/g, '\n')
  )
}

export const checkUrl = (uri?: string): boolean => {
  log.info('Check URL...')
  if (typeof uri === 'undefined') {
    log.error('Missing URL')
    return false
  }
  const parsed = url.parse(uri)
  const validUrl = !!parsed.path && !!parsed.host
  if (!validUrl) {
    log.error('Invalid url format')
    return false
  }
  return true
}

export function writeFile<T>(dataArr: T[], fileName: string): Promise<string> {
  // TODO : Loader
  log.info(`Start writing in ${fileName}...`)
  return new Promise((resolve, reject) => {
    try {
      const dest = path.join(__dirname, '..', '..', 'files', fileName)
      const stream = fs.createWriteStream(dest)
      for (const line of dataArr) {
        stream.write(`${JSON.stringify(line)}\n`)
      }

      stream.end(() => resolve(`${fileName} is fully updated!`))
    } catch (error) {
      reject(error.toString())
    }
  })
}
