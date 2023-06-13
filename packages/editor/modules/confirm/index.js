import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Modal from "@metascore-library/core/modules/modal";
import BaseButton from "@metascore-library/core/modules/button";

import ConfirmDialog from "./components/ConfirmDialog";

export default class ConfirmModule extends AbstractModule {
  static id = "confirm";

  static dependencies = [Modal, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("ConfirmDialog", ConfirmDialog);
  }
}
