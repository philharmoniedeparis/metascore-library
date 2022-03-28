import Emitter from "tiny-emitter";

export default {
  id: "event_bus",
  install({ app }) {
    const emitter = new Emitter();

    app.config.globalProperties.$eventBus = {
      on(event, handler) {
        emitter.on(event, handler);
      },
      off(event, handler) {
        emitter.off(event, handler);
      },
      emit(event, payload) {
        emitter.emit(event, payload);
      },
    };
  },
};
