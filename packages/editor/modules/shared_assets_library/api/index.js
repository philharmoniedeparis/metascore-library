import { load } from "@metascore-library/core/services/ajax";

function loadItems(url) {
  return load(url);
}

export { loadItems };
