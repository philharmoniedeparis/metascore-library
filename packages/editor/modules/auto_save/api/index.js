import { useModule } from "@metascore-library/core/services/module-manager";

function head(url) {
  return useModule("ajax").head(url);
}

function load(url) {
  return useModule("ajax").get(url);
}

function save(url, data) {
  return useModule("ajax").put(url, { data });
}

function _delete(url) {
  return useModule("ajax").delete(url, { keepalive: true });
}

export { head, load, save, _delete as delete };
