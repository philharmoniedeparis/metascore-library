import { useModule } from "@metascore-library/core/services/module-manager";

function get(url) {
  return useModule("ajax").get(url, {
    responseType: "arrayBuffer",
  });
}

export { get };
