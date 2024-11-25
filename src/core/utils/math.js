/**
 * Linearly interpolate between start and stop by amount.
 * Mathematically the opposite of normalize.
 *
 * @param {number} start The start value
 * @param {number} stop The stop value
 * @param {number} amount The interpolation amount between the two values
 * @returns {number} The interpolated value
 */
export function lerp(start, stop, amount) {
  return start + (stop - start) * amount;
}

/**
 * Normalize a value to be between 0 and 1 (inclusive).
 * Mathematically the opposite of lerp.
 *
 * @param {number} value The value to normalize
 * @param {number} start The min value of the input space
 * @param {number} stop The max value of the input space
 * @returns {number} The normalized value
 */
export function normalize(value, start, stop) {
  return (value - start) / (stop - start);
}

/**
 * Map a value from one coordinate space to another
 *
 * @param {number} value The value to map
 * @param {number} input_start The min value of the input space
 * @param {number} input_stop The max value of the input space
 * @param {number} output_start The min value of the output space
 * @param {number} output_stop The max value of the output space
 * @returns {number} The mapped value
 */
export function map(value, input_start, input_stop, output_start, output_stop) {
  return (
    output_start +
    (output_stop - output_start) *
      ((value - input_start) / (input_stop - input_start))
  );
}

/**
 * Clamp a value between a min and max
 *
 * @param {number} value The value to clamp
 * @param {number} min The min value
 * @param {number} max The max value
 * @returns {number} The clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(min, value), max);
}

/**
 * Convert a value from degrees to radians
 *
 * @param {number} value The value in degrees
 * @returns {number} The value in radians
 */
export function radians(value) {
  return (value * Math.PI) / 180;
}

/**
 * Convert a value from radians to degrees
 *
 * @param {number} value The value in radians
 * @returns {number} The value in degrees
 */
export function degrees(value) {
  return (value * 180) / Math.PI;
}
