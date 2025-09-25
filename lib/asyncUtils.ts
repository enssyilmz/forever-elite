export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

export async function withTimeout<T = any>(promise: any, ms: number = 15000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError()), ms)
  })
  try {
    // Wrap in Promise.resolve to accept Supabase builders (thenables) without type friction
    const wrapped = Promise.resolve(promise) as Promise<T>
    return (await Promise.race([wrapped, timeoutPromise])) as T
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export async function swallow<T>(promise: Promise<T>, onError?: (err: unknown) => void): Promise<T | undefined> {
  try {
    return await promise
  } catch (err) {
    onError?.(err)
    return undefined
  }
}


