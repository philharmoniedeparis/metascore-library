/**
 * Linearly interpolate between start and stop by amount.
 * Mathematically the opposite of normalize.
 */
export function lerp(start: number, stop: number, amount: number) {
  return start + (stop - start) * amount;
}

/**
 * Normalize a value to be between 0 and 1 (inclusive).
 * Mathematically the opposite of lerp.
 */
export function normalize(value: number, start: number, stop: number) {
  return (value - start) / (stop - start);
}

/**
 * Map a value from one coordinate space to another
 */
export function map(value: number, input_start: number, input_stop: number, output_start: number, output_stop: number) {
  return (
    output_start +
    (output_stop - output_start) *
      ((value - input_start) / (input_stop - input_start))
  );
}

/**
 * Clamp a value between a min and max
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(min, value), max);
}

/**
 * Convert a value from degrees to radians
 */
export function radians(value: number) {
  return (value * Math.PI) / 180;
}

/**
 * Convert a value from radians to degrees
 */
export function degrees(value: number) {
  return (value * 180) / Math.PI;
}
