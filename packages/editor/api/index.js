import { useModule } from "@metascore-library/core/services/module-manager";

function get(url) {
  return useModule("ajax").load(url);
}

function save(url, data) {
  return useModule("ajax").load(url, {
    method: "PATCH",
    data,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

function restore(url, vid) {
  return useModule("ajax").load(url, {
    method: "PATCH",
    params: { vid },
    headers: { "Content-Type": "application/json" },
  });
}

export { get, save, restore };
