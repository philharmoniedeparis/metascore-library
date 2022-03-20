import ResizablePane from "./components/ResizablePane";

export default {
  id: "resizable_pane",
  install({ app }) {
    app.component("ResizablePane", ResizablePane);
  },
};
