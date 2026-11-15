import { debounce } from '../../src/utils/debounce';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

describe('debounce', () => {
  it('should not call the function immediately', () => {
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 100);
    debouncedCallback();
    expect(callback).not.toHaveBeenCalled();
  });

  it('should call the function after the delay', () => {
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 100);
    debouncedCallback();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledOnce();
  });
  it('should reset the timer when called again', () => {
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 100);
    debouncedCallback();
    vi.advanceTimersByTime(70);
    debouncedCallback();
    vi.advanceTimersByTime(70);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30);
    expect(callback).toHaveBeenCalledOnce();
  });
  it('passing arguments', () => {
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 100);
    debouncedCallback('canada');
    debouncedCallback('Japan');
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('Japan');
  });
});

afterEach(() => {
  vi.useRealTimers();
});
