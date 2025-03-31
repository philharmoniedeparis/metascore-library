import { storeToRefs, type StoreOnActionListener, type StateTree } from 'pinia'
import { readonly, type DeepReadonly, type Ref } from "vue";

import AbstractModule, { type Context } from "@core/services/module-manager/AbstractModule";
import useStore, { type Source } from "./store";
import * as utils from "./utils/media";
import MediaPlayer from "./components/MediaPlayer.vue";

export default class MediaPlayerModule extends AbstractModule {
  static id = "core:media_player";

  constructor(context: Context) {
    super(context);

    const { app } = context;
    app.component("MediaPlayer", MediaPlayer);
  }

  get element(): DeepReadonly<Ref<HTMLAudioElement | null, HTMLAudioElement | null>> {
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

  get dataLoaded() {
    const store = useStore();
    const { dataLoaded } = storeToRefs(store);
    return readonly(dataLoaded);
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

  get playbackRate() {
    const store = useStore();
    const { playbackRate } = storeToRefs(store);
    return readonly(playbackRate);
  }

  setSource(value: Source|null) {
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

  seekTo(value: number) {
    const store = useStore();
    store.seekTo(value);
  }

  setPlaybackRate(value: number) {
    const store = useStore();
    store.setPlaybackRate(value);
  }

  formatTime(time: number) {
    return utils.formatTime(time);
  }

  getMimeTypeFromURL(url: string) {
    return utils.getMimeTypeFromURL(url);
  }

  getRendererForMime(mime: string) {
    return utils.getRendererForMime(mime);
  }

  async getFileDuration(file: { mime: string, url: string}) {
    return await utils.getFileDuration(file);
  }

  onStoreAction(callback: StoreOnActionListener<"media-player", StateTree, unknown, unknown>) {
    const store = useStore();
    return store.$onAction(callback);
  }
}
