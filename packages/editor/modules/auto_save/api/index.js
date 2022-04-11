import { load, getDefaults } from "@metascore-library/core/services/ajax";

function save(url, data) {
  return load(url, {
    method: "POST",
    data,
  });
}

function _delete(url) {
  // Delete auto-save data using the fetch API as XMLHttpRequest doesn't support keepalive.
  return fetch(url, {
    method: "DELETE",
    headers: getDefaults().headers?.common || {},
    keepalive: true,
  });
}

export { save, _delete as delete };
