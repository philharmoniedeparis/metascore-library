import AbstractModule from "@core/services/module-manager/AbstractModule";
import AutoFocus from "@core/modules/auto_focus";
import BaseButton from "@core/modules/button";
import FormGroup from "../form_group";
import MediaPlayer from "@core/modules/media_player";

import CheckboxControl from "./components/CheckboxControl";
import ColorControl from "./components/ColorControl";
import DropdownButtonControl from "./components/DropdownButtonControl.vue";
import FileControl from "./components/FileControl";
import NumberControl from "./components/NumberControl";
import SelectControl from "./components/SelectControl";
import TextControl from "./components/TextControl";
import TimeControl from "./components/TimeControl";
import UrlControl from "./components/UrlControl";

export default class FormControlsModule extends AbstractModule {
  static id = "form_controls";

  static dependencies = [AutoFocus, BaseButton, FormGroup, MediaPlayer];

  constructor({ app }) {
    super(arguments);

    app.component("DropdownButtonControl", DropdownButtonControl);
    app.component("CheckboxControl", CheckboxControl);
    app.component("ColorControl", ColorControl);
    app.component("FileControl", FileControl);
    app.component("NumberControl", NumberControl);
    app.component("SelectControl", SelectControl);
    app.component("TextControl", TextControl);
    app.component("TimeControl", TimeControl);
    app.component("UrlControl", UrlControl);
  }
}
