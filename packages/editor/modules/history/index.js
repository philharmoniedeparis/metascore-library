import plugin from "./store/plugins/history";

export default {
  name: "History",
  install({ pinia }) {
    pinia.use(plugin);
  },
};
