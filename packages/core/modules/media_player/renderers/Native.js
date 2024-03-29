/**
 * A default (native) media renderer
 */
export default class Native {
  /**
   * Check whether the renderer supports a given mime type
   *
   * @param {String} mime The mime type
   * @return {Boolean} Whether the renderer supports the given mime type
   */
  static canPlayType(mime) {
    return new Audio().canPlayType(mime) !== "";
  }

  mount(url, el) {
    el.src = url;
    el.load();
  }

  unmount() {}
}
