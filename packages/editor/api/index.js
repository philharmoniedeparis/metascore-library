import { useModule } from "@metascore-library/core/services/module-manager";

async function load(url) {
  return await useModule("ajax").get(url);
}

async function save(url, data) {
  return await useModule("ajax").patch(url, { data });
}

async function restore(url, vid) {
  return await useModule("ajax").patch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    params: { vid },
  });
}

export { load, save, restore };
