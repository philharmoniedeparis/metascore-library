import AbstractModule from "@core/services/module-manager/AbstractModule";
import AutoFocus from "@core/modules/auto_focus";
import BaseButton from "@core/modules/button";
import FormGroup from "../form_group";
import MediaPlayer from "@core/modules/media_player";

import CheckboxControl from "./components/CheckboxControl.vue";
import ColorControl from "./components/ColorControl.vue";
import DropdownButtonControl from "./components/DropdownButtonControl.vue";
import FileControl from "./components/FileControl.vue";
import NumberControl from "./components/NumberControl.vue";
import SelectControl from "./components/SelectControl.vue";
import TextControl from "./components/TextControl.vue";
import TimeControl from "./components/TimeControl.vue";
import UrlControl from "./components/UrlControl.vue";

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
