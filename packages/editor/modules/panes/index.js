import ResizablePane from "./components/ResizablePane";

export default {
  name: "Panes",
  install({ app }) {
    app.component("ResizablePane", ResizablePane);
  },
};
