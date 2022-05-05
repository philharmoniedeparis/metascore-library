import { storeToRefs } from "pinia";
import { readonly } from "vue";

import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import AppPreview from "../app_preview";
import AssetsLibrary from "../assets_library";
import FormGroup from "../form_group";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import SchemaForm from "../schema_form";
import StyledButton from "@metascore-library/core/modules/styled_button";
import Tabs from "../tabs";

import AnimatedControl from "./components/AnimatedControl";
import BorderRadiusControl from "./components/BorderRadiusControl";
import CursorKeyframesControl from "./components/CursorKeyframesControl";
import ComponentForm from "./components/ComponentForm";
import HtmlControl from "./components/HtmlControl";

export default class ComponentFormModule extends AbstractModule {
  static id = "component_form";

  static dependencies = [
    AppPreview,
    AssetsLibrary,
    FormGroup,
    MediaPlayer,
    SchemaForm,
    StyledButton,
    Tabs,
  ];

  constructor({ app }) {
    super(arguments);

    app.component("AnimatedControl", AnimatedControl);
    app.component("BorderRadiusControl", BorderRadiusControl);
    app.component("CursorKeyframesControl", CursorKeyframesControl);
    app.component("ComponentForm", ComponentForm);
    app.component("HtmlControl", HtmlControl);
  }

  get store() {
    return useStore();
  }

  configure(configs) {
    this.store.configure(configs);
  }

  get recordingCursorKeyframes() {
    const store = useStore();
    const { recordingCursorKeyframes } = storeToRefs(store);
    return readonly(recordingCursorKeyframes);
  }

  get editingTextContent() {
    const store = useStore();
    const { editingTextContent } = storeToRefs(store);
    return readonly(editingTextContent);
  }
}
