import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Confirm from "@metascore-library/core/modules/confirm";
import FormControls from "../form_controls";
import StyledButton from "@metascore-library/core/modules/styled_button";
import RevisionSelector from "./components/RevisionSelector";

export default class RevisionSelectorModule extends AbstractModule {
  static id = "revision_selector";

  static dependencies = [Confirm, FormControls, StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("RevisionSelector", RevisionSelector);
  }
}
