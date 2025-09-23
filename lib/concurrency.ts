export function createQueue(limit = 6) {
  let active = 0;
  const queue: (() => void)[] = [];
  const next = () => { active--; queue.shift()?.(); };
  const run = <T>(fn: () => Promise<T>) =>
    new Promise<T>((resolve, reject) => {
      const exec = () => {
        active++;
        fn().then((v) => { next(); resolve(v); })
             .catch((e) => { next(); reject(e); });
      };
      if (active < limit) exec(); else queue.push(exec);
    });
  return { run };
}
