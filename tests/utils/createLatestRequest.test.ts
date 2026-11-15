import { describe, expect, it } from 'vitest';
import { createLatestRequest } from '../../src/utils/createLatestRequest.js';

function createDeferred<T>() {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe('createLatestRequest', () => {
  it('aborts the previous request when a new request starts', async () => {
    const manager = createLatestRequest();
    const firstRequest = createDeferred<string>();

    let firstSignal: AbortSignal | undefined;

    const firstPromise = manager.run((signal) => {
      firstSignal = signal;
      return firstRequest.promise;
    });

    const secondPromise = manager.run(async () => 'new result');

    expect(firstSignal?.aborted).toBe(true);
    expect(await secondPromise).toBe('new result');

    firstRequest.resolve('old result');

    expect(await firstPromise).toBeUndefined();
  });

  it('does not return an outdated result if an older request finishes last', async () => {
    const manager = createLatestRequest();
    const firstRequest = createDeferred<string>();
    const secondRequest = createDeferred<string>();

    const firstPromise = manager.run(() => firstRequest.promise);
    const secondPromise = manager.run(() => secondRequest.promise);

    secondRequest.resolve('new result');

    expect(await secondPromise).toBe('new result');

    firstRequest.resolve('old result');

    expect(await firstPromise).toBeUndefined();
  });

  it('ignores a cancelled request', async () => {
    const manager = createLatestRequest();
    const request = createDeferred<string>();

    const promise = manager.run(() => request.promise);

    manager.cancel();
    request.resolve('result');

    expect(await promise).toBeUndefined();
  });
});
