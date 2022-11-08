import { useModule } from "@metascore-library/core/services/module-manager";

function setDontShowAgain(url) {
  return useModule("ajax").get(url);
}

export { setDontShowAgain };
