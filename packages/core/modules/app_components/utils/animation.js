import { computed, unref } from "vue";
import { isArray } from "lodash";
import { map } from "@core/utils/math";

/**
 * Get an animated value at the specified media time
 * @param {mixed[]} values The list of values
 * @param {number} time The media time
 * @returns {mixed} The correspondiung value
 */
export function getAnimatedValueAtTime(values, time) {
  // Only one value available, return it.
  if (values.length === 1) {
    return values[0][1];
  }

  // Find the index of a matching time.
  let index = values.findIndex((value) => {
    return value[0] === time;
  });
  // Desired time matches a value's time,
  // return that value.
  if (index > -1) return values[index][1];

  // Find the index of the value with the smallest time
  // greater than the desired time.
  index = values.findIndex((value) => {
    return value[0] >= time;
  });

  if (index === -1) {
    // No value found after desired time,
    // return the last value.
    return values[values.length - 1][1];
  }

  if (index === 0) {
    // No value found before desired time,
    // return first value.
    return values[index][1];
  }

  // Claculate the intermediate.
  const start = values[index - 1];
  const end = values[index];

  if (isArray(start[1])) {
    return start[1].map((v, index) => {
      return map(time, start[0], end[0], start[1][index], end[1][index]);
    });
  }

  return map(time, start[0], end[0], start[1], end[1]);
}

/**
 * Get a ref of a property's sorted keyframes.
 * @param {*} component The component
 * @param {*} prop The keyframes' property
 * @returns {ComputedRef} The sorted keyframes
 */
export function getSortedKeyframes(component, prop) {
  return computed(() => {
    return unref(component)[prop].value.toSorted((a, b) => {
      return a[0] - b[0];
    });
  });
}
