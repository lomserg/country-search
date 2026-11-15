type RequestTask<T> = (signal: AbortSignal) => Promise<T>;

export function createLatestRequest() {
  let activeController: AbortController | null = null;

  async function run<T>(task: RequestTask<T>): Promise<T | undefined> {
    activeController?.abort();

    const controller = new AbortController();
    activeController = controller;

    try {
      const result = await task(controller.signal);

      if (controller.signal.aborted || activeController !== controller) {
        return undefined;
      }

      return result;
    } catch (error) {
      if (controller.signal.aborted || activeController !== controller) {
        return undefined;
      }

      throw error;
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
    }
  }

  function cancel(): void {
    activeController?.abort();
    activeController = null;
  }

  return { run, cancel };
}
