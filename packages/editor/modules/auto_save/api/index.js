import { load } from "@metascore-library/core/services/ajax";

function save(url, data) {
  return load(url, {
    method: "POST",
    data,
  });
}

function _delete(url) {
  return load(url, {
    method: "DELETE",
    keepalive: true,
  });
}

export { save, _delete as delete };
