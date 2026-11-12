export function debounce(fn, delay = 2000) {
  let timeoutId;
  let lastArgs;

  const debounced = (...args) => {
    lastArgs = args;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      lastArgs = null;
      fn(...args);
    }, delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    lastArgs = null;
  };

  debounced.flush = () => {
    clearTimeout(timeoutId);
    if (lastArgs) {
      const args = lastArgs;
      lastArgs = null;
      fn(...args);
    }
  };

  return debounced;
}
