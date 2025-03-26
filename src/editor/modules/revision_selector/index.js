import AbstractModule from "@core/services/module-manager/AbstractModule";
import Confirm from "@core/modules/confirm";
import FormControls from "../form_controls";
import BaseButton from "@core/modules/button";
import RevisionSelector from "./components/RevisionSelector.vue";

export default class RevisionSelectorModule extends AbstractModule {
  static id = "revision_selector";

  static dependencies = [Confirm, FormControls, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("RevisionSelector", RevisionSelector);
  }
}
