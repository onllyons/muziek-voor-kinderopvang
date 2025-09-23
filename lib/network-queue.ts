import { createQueue } from './concurrency';
export const netQ = createQueue(6);
export async function runQ<T>(fn: () => Promise<T>) {
  return netQ.run(fn);
}
