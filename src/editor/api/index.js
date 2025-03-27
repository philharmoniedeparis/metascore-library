import { useModule } from "@core/services/module-manager";

async function load(url) {
  return await useModule("core:ajax").get(url);
}

async function save(url, data) {
  return await useModule("core:ajax").patch(url, { data });
}

async function restore(url, vid) {
  return await useModule("core:ajax").patch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    params: { vid },
  });
}

export { load, save, restore };
