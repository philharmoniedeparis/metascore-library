import directive from "./directives/autofocus";

export default {
  id: "auto_focus",
  install({ app }) {
    app.directive("autofocus", directive);
  },
};
