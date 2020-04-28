type MsgType = 'error' | 'info' | 'success'

export default function logger(msg: string, type?: MsgType): void {
  const message = `[${type}]: ${msg}`
  switch (type) {
    //     case 'error':
    //         console.error(message)
    //         break;

    //     case 'info':
    //         console.info(message)
    //         break;

    //     case 'success':
    //         console.log(message)
    //         break;

    default:
      console.log(message)
      break
  }
}
