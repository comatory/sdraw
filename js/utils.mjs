export function throttle(fn, delay) {
  let lastCall = performance.now();

  return function (...args) {
    const now = performance.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}
