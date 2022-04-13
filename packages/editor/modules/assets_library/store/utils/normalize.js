export function normalize(data) {
  return data.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
}

export function denormalize(input) {
  return Object.values(input);
}
