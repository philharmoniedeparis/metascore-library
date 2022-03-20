export default {
  id: "device",
  install({ app }) {
    app.provide(
      "$deviceHasTouch",
      window.matchMedia("(any-pointer: coarse)").matches
    );
  },
};
