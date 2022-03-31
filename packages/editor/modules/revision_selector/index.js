import useStore from "./store";
import FormControls from "../form_controls";
import StyledButton from "@metascore-library/core/modules/styled_button";
import RevisionSelector from "./components/RevisionSelector";

export default {
  id: "revision_selector",
  dependencies: [FormControls, StyledButton],
  install({ app }) {
    app.component("RevisionSelector", RevisionSelector);

    return {
      useStore,
    };
  },
};
