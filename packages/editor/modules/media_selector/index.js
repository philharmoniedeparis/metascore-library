import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import FormGroup from "../form_group";
import ModalForm from "../modal_form";
import StyledButton from "@metascore-library/core/modules/styled_button";
import MediaSelector from "./components/MediaSelector";

export default class MediaSelectorModule extends AbstractModule {
  static id = "media_selector";

  static dependencies = [ModalForm, FormGroup, StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("MediaSelector", MediaSelector);
  }
}
