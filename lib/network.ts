type RetryOpts = { retries?: number; baseDelayMs?: number; retryOn?: (e: any, res?: Response) => boolean };
export class FriendlyError extends Error {
  code?: 'TIMEOUT' | 'OFFLINE' | 'NETWORK' | 'SERVER' | 'UNKNOWN';
  constructor(msg: string, code?: FriendlyError['code']) { super(msg); this.code = code; }
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 10000, signal, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...rest, signal: mergeSignals(signal, controller.signal) });
    return res;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new FriendlyError('Connection timed out. Please try again.', 'TIMEOUT');
    // React Native throws TypeError for network issues
    if (e instanceof TypeError) throw new FriendlyError('Network error. Check connection and try again.', 'NETWORK');
    throw e;
  } finally {
    clearTimeout(id);
  }
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOpts = {}) {
  const { retries = 3, baseDelayMs = 300, retryOn = (e, res) => {
    if (e instanceof FriendlyError && (e.code === 'TIMEOUT' || e.code === 'NETWORK' || e.code === 'OFFLINE')) return true;
    if (res && res.status >= 500) return true;
    return false;
  }} = opts;

  let attempt = 0;
  while (true) {
    try { return await fn(); }
    catch (e: any) {
      attempt++;
      if (attempt > retries) throw e;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

function mergeSignals(a?: AbortSignal | null, b?: AbortSignal | null) {
  if (!a) return b as AbortSignal;
  if (!b) return a as AbortSignal;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener('abort', onAbort);
  b.addEventListener('abort', onAbort);
  if (a.aborted || b.aborted) controller.abort();
  return controller.signal;
}
