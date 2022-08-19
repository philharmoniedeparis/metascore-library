import { storeToRefs } from "pinia";
import { readonly } from "vue";

import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import MediaPlayer from "./components/MediaPlayer";

export default class MediaPlayerModule extends AbstractModule {
  static id = "media_player";

  constructor({ app }) {
    super(arguments);

    app.component("MediaPlayer", MediaPlayer);
  }

  get element() {
    const store = useStore();
    const { element } = storeToRefs(store);
    return readonly(element);
  }

  get source() {
    const store = useStore();
    const { source } = storeToRefs(store);
    return readonly(source);
  }

  get type() {
    const store = useStore();
    const { type } = storeToRefs(store);
    return readonly(type);
  }

  get ready() {
    const store = useStore();
    const { ready } = storeToRefs(store);
    return readonly(ready);
  }

  get width() {
    const store = useStore();
    const { width } = storeToRefs(store);
    return readonly(width);
  }

  get height() {
    const store = useStore();
    const { height } = storeToRefs(store);
    return readonly(height);
  }

  get duration() {
    const store = useStore();
    const { duration } = storeToRefs(store);
    return readonly(duration);
  }

  get time() {
    const store = useStore();
    const { time } = storeToRefs(store);
    return readonly(time);
  }

  get formattedTime() {
    const store = useStore();
    const { formattedTime } = storeToRefs(store);
    return readonly(formattedTime);
  }

  get playing() {
    const store = useStore();
    const { playing } = storeToRefs(store);
    return readonly(playing);
  }

  get seeking() {
    const store = useStore();
    const { seeking } = storeToRefs(store);
    return readonly(seeking);
  }

  get buffered() {
    const store = useStore();
    const { buffered } = storeToRefs(store);
    return readonly(buffered);
  }

  setSource(value) {
    const store = useStore();
    store.setSource(value);
  }

  play() {
    const store = useStore();
    store.play();
  }

  pause() {
    const store = useStore();
    store.pause();
  }

  stop() {
    const store = useStore();
    store.stop();
  }

  seekTo(value) {
    const store = useStore();
    store.seekTo(value);
  }

  onStoreAction(callback) {
    const store = useStore();
    store.$onAction(callback);
  }
}
