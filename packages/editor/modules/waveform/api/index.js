import { useModule } from "@metascore-library/core/services/module-manager";

function get(url) {
  return useModule("ajax").load(url, {
    responseType: "arraybuffer",
  });
}

export { get };
