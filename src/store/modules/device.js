export default function () {
  return {
    namespaced: true,
    state: {
      hasTouch: window.matchMedia("(any-pointer: coarse)").matches,
    },
    getters: {},
    actions: {},
  };
}
