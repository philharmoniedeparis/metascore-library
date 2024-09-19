import { useModule } from "@core/services/module-manager";
import AbstractInterpreter from "./AbstractInterpreter";

export default class App extends AbstractInterpreter {
  constructor() {
    super();

    this._resetting = false;
    this._resetCallbacks = new Set();
  }

  getContext() {
    return {
      addResetCallback: (callback) => {
        this._resetCallbacks.add(callback);
      },
      toggleFullscreen: (force) => {
        const { toggleFullscreen } = useModule("app_renderer");
        toggleFullscreen(force);
      },
      reset: () => {
        if (this._resetting) return;
        this._resetting = true;

        useModule("app_renderer").reset();

        this._resetCallbacks.forEach((callback) => callback());

        this._resetting = false;
      },
    };
  }

  reset() {
    this._resetCallbacks.clear();
  }
}
