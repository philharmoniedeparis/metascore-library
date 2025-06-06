import { useModule } from "@core/services/module-manager";

async function head(url) {
  return await useModule("ajax").head(url);
}

async function load(url) {
  return await useModule("ajax").get(url);
}

async function save(url, data) {
  return await useModule("ajax").put(url, { data });
}

async function del(url) {
  return await useModule("ajax").delete(url, { keepalive: true });
}

export { head, load, save, del as delete };
