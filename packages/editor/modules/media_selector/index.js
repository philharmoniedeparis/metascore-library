import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";

import Alert from "../alert";
import AppComponents from "@metascore-library/core/modules/app_components";
import BaseButton from "@metascore-library/core/modules/button";
import Confirm from "../confirm";
import FormGroup from "../form_group";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import ModalForm from "../modal_form";
import ProgressIndicator from "@metascore-library/core/modules/progress_indicator";

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
