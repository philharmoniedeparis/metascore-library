/**
 * Generate a random number between two values
 *
 * @param {float} from
 * @param {float} to
 * @return {float} The random value
 */
export function randomFromTo(from, to) {
    return Math.random() * (to - from) + from;
}

/**
 * Linearly interpolate between start and stop by amount.
 * Mathematically the opposite of normalize.
 *
 * @param {float} start the start value
 * @param {float} to the stop value
 * @param {float} amount the interpolation amount between the two values
 * @return {float} The interpolated value
 */
export function lerp(start, stop, amount) {
    return start + (stop - start) * amount;
}

/**
 * Normalize a value to be between 0 and 1 (inclusive).
 * Mathematically the opposite of lerp.
 *
 * @param {float} value the value to normalize
 * @param {float} start the min value of the input space
 * @param {float} to the max value of the input space
 * @return {float} The normalized value
 */
export function normalize(value, start, stop) {
    return (value - start) / (stop - start);
}

/**
 * Map a value from one coordinate space to another
 *
 * @param {float} value the value to map
 * @param {float} input_start the min value of the input space
 * @param {float} input_stop the max value of the input space
 * @param {float} output_start the min value of the output space
 * @param {float} output_stop the max value of the output space
 * @return {float} The mapped value
 */
export function map(value, input_start, input_stop, output_start, output_stop) {
    return output_start + (output_stop - output_start) * ((value - input_start) / (input_stop - input_start));
}

/**
 * Clamp a value between a min and max
 *
 * @param {float} value the value to clamp
 * @param {float} min the min value
 * @param {float} max the max value
 * @return {float} The clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(min, value), max);
}

/**
 * Convert a value from degrees to radians
 *
 * @param {float} value the value in degrees
 * @return {float} The value in radians
 */
export function radians(value) {
    return value * Math.PI / 180;
}

/**
 * Convert a value from radians to degrees
 *
 * @param {float} value the value in radians
 * @return {float} The value in degrees
 */
export function degrees(value) {
    return value * 180 / Math.PI;
}
