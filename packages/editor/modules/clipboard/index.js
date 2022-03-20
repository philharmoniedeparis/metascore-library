import useStore from "./store";

export default {
  id: "clipboard",
  install() {
    return {
      useStore,
    };
  },
};
