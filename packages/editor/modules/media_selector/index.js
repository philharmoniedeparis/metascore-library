import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";

import FormGroup from "../form_group";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import ModalForm from "../modal_form";
import BaseButton from "@metascore-library/core/modules/button";

import MediaSelector from "./components/MediaSelector";

export default class MediaSelectorModule extends AbstractModule {
  static id = "media_selector";

  static dependencies = [FormGroup, MediaPlayer, ModalForm, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("MediaSelector", MediaSelector);
  }
}
