import { load } from "@metascore-library/core/services/ajax";

function get(url) {
  return load(url, {
    responseType: "arraybuffer",
  });
}

export { get };
