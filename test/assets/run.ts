import {debug} from './'
interface IRunOptions {
  expectException?: number  // expect exception with given value
}
export async function Run(func: () => Promise<any>, callback: (error?) => any, options?: IRunOptions) {
  options = options || {}
  let exception: any = null
  try {
    await func()
  } catch (error) {
    debug(error)
    exception = error
  }
  if (options.expectException && !exception) {
    return callback(new Error(`Except exception ${options.expectException}, but no exception occurs!`))
  }
  return callback(exception)
}
