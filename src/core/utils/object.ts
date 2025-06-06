import { toRaw, isRef, unref, isReactive, isProxy } from 'vue';

export function toRawDeep<T>(observed: T): T {
  if (observed === null) return null as T;

  if (Array.isArray(observed)) {
    return observed.map(toRawDeep) as T;
  }

  if (isRef(observed)) {
    return toRawDeep(unref(observed)) as T;
  }

  if (isReactive(observed) || isProxy(observed)) {
    return toRawDeep(toRaw(observed));
  }

  if (typeof observed === 'object') {
    const entries = Object.entries(observed).map(([key, val]) => [key, toRawDeep(val)]);
    return Object.fromEntries(entries);
  }

  return observed;
}
