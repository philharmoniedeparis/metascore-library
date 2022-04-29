import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Emitter from "tiny-emitter";

export default class EventBusModule extends AbstractModule {
  static id = "event_bus";

  constructor({ app }) {
    super(arguments);

    this._emitter = new Emitter();

    app.config.globalProperties.$eventBus = {
      on: (event, handler) => {
        this._emitter.on(event, handler);
      },
      off: (event, handler) => {
        this._emitter.off(event, handler);
      },
      emit: (event, payload) => {
        this._emitter.emit(event, payload);
      },
    };
  }
}
