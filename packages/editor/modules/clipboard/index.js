import useStore from "./store";

export default {
  name: "Clipboard",
  install() {
    return {
      useStore,
    };
  },
};
