import { reactive, toRefs, readonly } from "vue";
import AbstractModule from "@core/services/module-manager/AbstractModule";

export default class MediaPlayerModule extends AbstractModule {
  static id = "media_player";

  constructor() {
    super();

    this._state = reactive({
      ready: true,
      duration: 100,
      time: 0,
      seeking: false,
    });
  }

  get ready() {
    const { ready } = toRefs(this._state);
    return readonly(ready);
  }

  get duration() {
    const { duration } = toRefs(this._state);
    return readonly(duration);
  }

  get time() {
    const { time } = toRefs(this._state);
    return readonly(time);
  }

  get seeking() {
    const { seeking } = toRefs(this._state);
    return readonly(seeking);
  }

  seekTo(value) {
    this._state.time = value;
  }
}
