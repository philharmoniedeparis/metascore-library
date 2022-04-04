import Modal from "../modal";
import ProgressIndicator from "./components/ProgressIndicator";

export default {
  id: "progress_indicator",
  dependencies: [Modal],
  install({ app }) {
    app.component("ProgressIndicator", ProgressIndicator);
  },
};
