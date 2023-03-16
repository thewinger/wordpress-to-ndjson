/* eslint-disable no-undef */
import url from 'url'
import fs from 'fs'
import path from 'path'
import { formatISO } from 'date-fns'
import ora from 'ora'

const logger = ora()

export const BASE_PATH = '/wp-json/wp/v2'

export const handleError = (error: Error): void => {
  console.log(`Eeeeeerror ${error}`)
  logger.fail(error.toString())
}

export function cleanHTML(html: string): string {
  return (
    html
      // remove html
      .replace(/<\/?[^>]+(>|$)/g, '')
      // decode characterSet
      .replace(/&#(\d+);/g, (_: any, dec: number) => String.fromCharCode(dec))
      // Replace n* newlines by only one newline
      .replace(/\n\s*\n/g, '\n')
      // Remove the first new line
      .replace(/^\n/, '')
      // Remove Privado: in front of title
      .replace('Privado: ', '')
  )
}

// Remove the last "/"
export function formatUrl(str: string): string {
  return str.replace(/\/$/, '')
}

export const checkUrl = (uri?: string): boolean => {
  if (typeof uri === 'undefined') {
    logger.fail('Missing URL')
    return false
  }
  const parsed = url.parse(uri)
  const validUrl = !!parsed.path && !!parsed.host
  if (!validUrl) {
    logger.fail('Invalid url format')
    return false
  }
  return true
}

export function writeFile<T>(documents: T[], dest: string): void {
  const progress = ora()
  const filePath = path.dirname(dest)
  progress.start(`Writing document...`)

  if (!fs.existsSync(filePath)) {
    console.log(`${filePath} doesn't exists`)
    fs.mkdirSync(filePath, { recursive: true })
    console.log(`${filePath} created`)
  }

  try {
    const stream = fs.createWriteStream(dest)
    for (const line of documents) {
      stream.write(`${JSON.stringify(line)}\n`)
    }

    stream.end(() => progress.succeed(`File created at ${dest}`))
  } catch (error) {
    if (error instanceof Error) {
      progress.fail(error.toString())
    }
  }
}

export function normalizeDateTime(dateStr: string): string {
  return formatISO(new Date(dateStr)) || ''
}
