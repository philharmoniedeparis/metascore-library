import { useModule } from "@metascore-library/core/services/module-manager";

function load(url) {
  return useModule("ajax").get(url);
}

function save(url, data) {
  return useModule("ajax").patch(url, { data });
}

function restore(url, vid) {
  return useModule("ajax").patch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    params: { vid },
  });
}

export { load, save, restore };
