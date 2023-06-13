import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Confirm from "../confirm";
import FormControls from "../form_controls";
import BaseButton from "@metascore-library/core/modules/button";
import RevisionSelector from "./components/RevisionSelector";

export default class RevisionSelectorModule extends AbstractModule {
  static id = "revision_selector";

  static dependencies = [Confirm, FormControls, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("RevisionSelector", RevisionSelector);
  }
}
