import { useModule } from "@metascore-library/core/services/module-manager";

async function head(url) {
  return await useModule("ajax").head(url);
}

async function load(url) {
  return await useModule("ajax").get(url);
}

async function save(url, data) {
  return await useModule("ajax").put(url, { data });
}

async function _delete(url) {
  return await useModule("ajax").delete(url, { keepalive: true });
}

export { head, load, save, _delete as delete };
