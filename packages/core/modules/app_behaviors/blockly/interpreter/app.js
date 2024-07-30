import { useModule } from "@core/services/module-manager";
import { javascriptGenerator as JavaScript } from "blockly/javascript";

export function init(context) {
  // Ensure 'App' name does not conflict with variable names.
  JavaScript.addReservedWords("App");

  // Add 'App' object to context.
  context.App = {
    toggleFullscreen: (force) => {
      const { toggleFullscreen } = useModule("app_renderer");
      toggleFullscreen(force);
    },
  };
}
