import { load } from "@metascore-library/core/services/ajax";

function get(url) {
  return load(url);
}

function save(url, data) {
  return load(url, { method: "PATCH", data });
}

export { get, save };
