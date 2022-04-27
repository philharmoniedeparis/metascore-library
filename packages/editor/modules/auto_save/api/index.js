import { useModule } from "@metascore-library/core/services/module-manager";

function save(url, data) {
  return useModule("ajax").put(url, { data });
}

function _delete(url) {
  return useModule("ajax").delete(url, { keepalive: true });
}

export { save, _delete as delete };
