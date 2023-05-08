import { useModule } from "@metascore-library/core/services/module-manager";

async function load(url) {
  return await useModule("ajax").get(url);
}

async function save(url, data) {
  return await useModule("ajax").put(url, {
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  });
}

export { load, save };
