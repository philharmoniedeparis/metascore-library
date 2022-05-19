import { useModule } from "@metascore-library/core/services/module-manager";

function load(url) {
  return useModule("ajax").get(url);
}

export { load };
