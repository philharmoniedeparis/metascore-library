import directive from "./directives/focus";

export default {
  id: "focus",
  install({ app }) {
    app.directive("focus", directive);
  },
};
