import { Question } from 'inquirer'
import path from 'path'
import { checkUrl } from '.'

const defaultDest = path.join(__dirname, '..', '..', `documents.ndjson`)

const questions: Question[] = [
  {
    type: 'input',
    name: 'url',
    message: 'WordPress Url',
    validate: checkUrl,
  },
  {
    type: 'input',
    name: 'dest',
    message: `Output path:`,
    default: defaultDest,
  },
]

export default questions
