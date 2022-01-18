import DynamicRuler from "./components/DynamicRuler";

export default {
  name: "Ruler",
  install({ app }) {
    app.component("DynamicRuler", DynamicRuler);
  },
};
