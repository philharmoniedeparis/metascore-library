export default {
  name: "Device",
  install({ app }) {
    app.provide(
      "$deviceHasTouch",
      window.matchMedia("(any-pointer: coarse)").matches
    );
  },
};
