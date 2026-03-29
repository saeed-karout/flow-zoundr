// utils/debounce.js (اختياري)
export function debounce(fn, delay = 2000) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }