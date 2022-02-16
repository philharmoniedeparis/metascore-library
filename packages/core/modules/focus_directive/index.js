import directive from "./directives/focus";

export default {
  name: "FocusDirective",
  install({ app }) {
    app.directive("focus", directive);
  },
};
