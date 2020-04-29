import colors from 'chalk'

type MsgType = 'error' | 'info' | 'success' | 'warn'

function logger(msg: string, type?: MsgType): void {
  const prefix = `[${type || 'info'}]`
  switch (type) {
    case 'error':
      console.log(`${colors.red(prefix)}: ${msg}`)
      break

    case 'warn':
      console.log(`${colors.yellow(prefix)}: ${msg}`)
      break

    case 'success':
      console.log(`${colors.green(prefix)}: ${msg}`)
      break

    default:
      console.log(`${colors.blue(prefix)}: ${msg}`)
      break
  }
}

// alias
export default {
  error: (msg: string): void => logger(msg, 'error'),
  warn: (msg: string): void => logger(msg, 'warn'),
  info: (msg: string): void => logger(msg, 'info'),
  success: (msg: string): void => logger(msg, 'success'),
}
