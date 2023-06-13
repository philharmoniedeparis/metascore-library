import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Modal from "@metascore-library/core/modules/modal";
import BaseButton from "@metascore-library/core/modules/button";
import DontShowAgain from "../dont_show_again";

import AlertDialog from "./components/AlertDialog";

export default class AlertModule extends AbstractModule {
  static id = "alert";

  static dependencies = [Modal, BaseButton, DontShowAgain];

  constructor({ app }) {
    super(arguments);

    app.component("AlertDialog", AlertDialog);
  }
}
