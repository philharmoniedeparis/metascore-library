import { useModule } from "@metascore-library/core/services/module-manager";

function save(url, data) {
  return useModule("ajax").load(url, {
    method: "POST",
    data,
  });
}

function _delete(url) {
  return useModule("ajax").load(url, {
    method: "DELETE",
    keepalive: true,
  });
}

export { save, _delete as delete };
