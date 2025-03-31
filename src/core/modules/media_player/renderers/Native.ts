/**
 * A default (native) media renderer
 */
export default class Native {
  /**
   * Check whether the renderer supports a given mime type
   */
  static canPlayType(mime: string) {
    return new Audio().canPlayType(mime) !== "";
  }

  mount(url: string, el: HTMLMediaElement) {
    el.src = url;
    el.load();
  }

  unmount() {}
}
