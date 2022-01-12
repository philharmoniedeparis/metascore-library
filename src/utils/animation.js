import { isArray } from "lodash";
import { map } from "./math";

export function getAnimatedValueAtTime(values, time) {
  // Only one value available, return it.
  if (values.length === 1) {
    return values[0][1];
  }

  // Find the index of the value with the smallest time
  // greater than the desired time.
  const index = values.findIndex((value) => {
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

  if (time === values[index][0]) {
    // Desired time matches a value's time,
    // return that value.
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
