import type { Item, SharedItem } from "../";

export function normalize(data: Array<Item|SharedItem>) {
  return data.reduce((acc, item) => acc.set(item.id, item), new Map<number, Item|SharedItem>());
}