import { storeToRefs } from "pinia";
import { readonly } from "vue";

import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";
import AppComponents from "@core/modules/app_components";
import AppPreview from "../app_preview";
import AssetsLibrary from "../assets_library";
import ElementHighlighter from "../element_highlighter";
import FormGroup from "../form_group";
import MediaPlayer from "@core/modules/media_player";
import SchemaForm from "../schema_form";
import BaseButton from "@core/modules/button";
import Tabs from "../tabs";

import AnimatedControl from "./components/controls/AnimatedControl";
import BorderRadiusControl from "./components/controls/BorderRadiusControl";
import CursorKeyframesControl from "./components/controls/CursorKeyframesControl";
import HtmlControl from "./components/controls/HtmlControl";

import ComponentForm from "./components/ComponentForm";

export default class ComponentFormModule extends AbstractModule {
  static id = "component_form";

  static dependencies = [
    AppComponents,
    AppPreview,
    AssetsLibrary,
    ElementHighlighter,
    FormGroup,
    MediaPlayer,
    SchemaForm,
    BaseButton,
    Tabs,
  ];

  constructor({ app }) {
    super(arguments);

    app.component("AnimatedControl", AnimatedControl);
    app.component("BorderRadiusControl", BorderRadiusControl);
    app.component("CursorKeyframesControl", CursorKeyframesControl);
    app.component("HtmlControl", HtmlControl);

    app.component("ComponentForm", ComponentForm);
  }

  configure(configs) {
    const store = useStore();
    store.configure(configs);
  }

  get title() {
    const store = useStore();
    const { title } = storeToRefs(store);
    return readonly(title);
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
