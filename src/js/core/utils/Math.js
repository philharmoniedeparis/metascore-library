/**
 * Generate a random number between two values
 *
 * @param {float} from
 * @param {float} to
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
 */
export function map(value, input_start, input_stop, output_start, output_stop) {
    return output_start + (output_stop - output_start) * ((value - input_start) / (input_stop - input_start));
}
