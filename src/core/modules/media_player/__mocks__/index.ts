import { reactive, toRefs, readonly } from "vue";
import AbstractModule from "@core/services/module-manager/AbstractModule";

export default class MediaPlayerModule extends AbstractModule {
  static id = "core:media_player";

  #state = reactive({
    ready: true,
    duration: 100,
    time: 0,
    seeking: false,
  });

  get ready() {
    const { ready } = toRefs(this.#state);
    return readonly(ready);
  }

  get duration() {
    const { duration } = toRefs(this.#state);
    return readonly(duration);
  }

  get time() {
    const { time } = toRefs(this.#state);
    return readonly(time);
  }

  get seeking() {
    const { seeking } = toRefs(this.#state);
    return readonly(seeking);
  }

  seekTo(value: number) {
    this.#state.time = value;
  }
}
