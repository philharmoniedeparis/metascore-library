import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Ajax from "@metascore-library/core/modules/ajax";
import FormControls from "../form_controls";

import DontShowAgain from "./components/DontShowAgain.vue";

export default class DontShowAgainModule extends AbstractModule {
  static id = "dont_show_again";

  static dependencies = [Ajax, FormControls];

  constructor({ app }) {
    super(arguments);

    app.component("DontShowAgain", DontShowAgain);
  }
}
