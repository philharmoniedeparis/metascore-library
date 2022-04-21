import { load } from "@metascore-library/core/services/ajax";

function get(url) {
  return load(url);
}

function save(url, data) {
  return load(url, {
    method: "PATCH",
    data,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

function restore(url, vid) {
  return load(url, {
    method: "PATCH",
    params: { vid },
    headers: { "Content-Type": "application/json" },
  });
}

export { get, save, restore };
