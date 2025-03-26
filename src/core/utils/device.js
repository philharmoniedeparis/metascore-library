/**
 * Check if the device has touch input.
 *
 * @returns {Boolean} True if it has touch input, false otherwise.
 */
export function hasTouch() {
  return window.matchMedia("(any-pointer: coarse)").matches;
}

/**
 * Check if the device is running an Apple OS.
 *
 * @returns {Boolean} True if it is running an Apple OS, false otherwise.
 */
export function isApplePlatform() {
  return (
    typeof window.navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
  );
}
