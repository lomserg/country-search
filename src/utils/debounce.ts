let timerId: ReturnType<typeof setTimeout>;
export function debounce<Args extends unknown[]>(callback: (...args: Args) => void, delay: number) {
  return (...args: Args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
