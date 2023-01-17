import { useModule } from "@metascore-library/core/services/module-manager";

async function setDontShowAgain(url) {
  return await useModule("ajax").get(url);
}

export { setDontShowAgain };
