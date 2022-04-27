import { useModule } from "@metascore-library/core/services/module-manager";

function get(url) {
  return useModule("ajax").get(url);
}

function save(url, data) {
  return useModule("ajax").patch(url, { data });
}

function restore(url, vid) {
  return useModule("ajax").patch(url, { params: { vid } });
}

export { get, save, restore };
