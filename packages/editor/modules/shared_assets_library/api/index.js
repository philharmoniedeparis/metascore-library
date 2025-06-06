import { useModule } from "@core/services/module-manager";

async function load(url) {
  return await useModule("ajax").get(url);
}

export { load };
