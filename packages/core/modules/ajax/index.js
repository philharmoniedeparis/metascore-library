import useStore from "./store";

export default {
  id: "ajax",
  install() {
    return {
      configure: (configs) => {
        useStore().configure(configs);
      },
      load: (url, configs) => {
        return useStore().load(url, configs);
      },
    };
  },
};
