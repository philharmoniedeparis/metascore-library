import { useModule } from "@core/services/module-manager";

async function get(url) {
  return await useModule("ajax").get(url, {
    responseType: "arrayBuffer",
  });
}

export { get };
