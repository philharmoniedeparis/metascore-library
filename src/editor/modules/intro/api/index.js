import { useModule } from "@core/services/module-manager";

async function setDontShowAgain(url) {
  return await useModule("core:ajax").get(url);
}

export { setDontShowAgain };
