import { useModule } from "@core/services/module-manager";

async function load(url) {
  return await useModule("core:ajax").get(url);
}

async function save(url, data) {
  return await useModule("core:ajax").put(url, {
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  });
}

export { load, save };
