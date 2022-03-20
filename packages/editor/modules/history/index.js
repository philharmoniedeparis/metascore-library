import plugin from "./store/plugins/history";

export default {
  id: "history",
  install({ pinia }) {
    pinia.use(plugin);
  },
};
