import AbstractModule from "@core/services/module-manager/AbstractModule";

import Alert from "@core/modules/alert";
import AppComponents from "@core/modules/app_components";
import BaseButton from "@core/modules/button";
import Confirm from "@core/modules/confirm";
import FormGroup from "../form_group";
import MediaPlayer from "@core/modules/media_player";
import ModalForm from "../modal_form";
import ProgressIndicator from "@core/modules/progress_indicator";

import MediaSelector from "./components/MediaSelector";

export default class MediaSelectorModule extends AbstractModule {
  static id = "media_selector";

  static dependencies = [
    Alert,
    AppComponents,
    BaseButton,
    Confirm,
    FormGroup,
    MediaPlayer,
    ModalForm,
    ProgressIndicator,
  ];

  constructor({ app }) {
    super(arguments);

    app.component("MediaSelector", MediaSelector);
  }
}
