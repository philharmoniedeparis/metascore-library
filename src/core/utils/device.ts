/**
 * Check if the device has touch input.
 */
export function hasTouch() {
  return window.matchMedia("(any-pointer: coarse)").matches;
}

/**
 * Check if the device is running an Apple OS.
 */
export function isApplePlatform() {
  return (
    typeof window.navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
  );
}
