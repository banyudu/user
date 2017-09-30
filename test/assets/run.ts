export async function Run(func: () => Promise<any>, callback) {
  try {
    await func()
    callback()
  } catch (error) {
    callback(error)
  }
}
