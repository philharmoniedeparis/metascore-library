import { useModule } from "@core/services/module-manager";

async function get(url) {
  return await useModule("core:ajax").get(url, {
    responseType: "arrayBuffer",
  });
}

export { get };
