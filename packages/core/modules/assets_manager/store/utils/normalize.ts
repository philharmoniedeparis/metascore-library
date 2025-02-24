export function normalize(data) {
  return data.reduce((acc, item) => acc.set(item.id, item), new Map());
}

export function denormalize(input) {
  return Object.values(input);
}
