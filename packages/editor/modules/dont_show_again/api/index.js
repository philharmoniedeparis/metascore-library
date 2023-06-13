import { useModule } from "@metascore-library/core/services/module-manager";

async function save(url) {
  return await useModule("ajax").get(url);
}

export { save };
