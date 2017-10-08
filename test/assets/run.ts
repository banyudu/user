import {debug} from './'
export async function Run(func: () => Promise<any>, callback) {
  try {
    await func()
    callback()
  } catch (error) {
    debug(error)
    callback(error)
  }
}
