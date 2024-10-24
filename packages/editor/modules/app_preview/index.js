import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";
import Button from "@core/modules/button";
import AppComponents from "@core/modules/app_components";
import AppBehaviors from "@core/modules/app_behaviors";
import AppRenderer from "@core/modules/app_renderer";
import ContextMenu from "@core/modules/contextmenu";
import Clipboard from "../clipboard";
import FormControls from "../form_controls";
import History from "../history";
import Hotkey from "../hotkey";
import MediaPlayer from "@core/modules/media_player";

import AppPreview from "./components/AppPreview";
import AppZoomController from "./components/AppZoomController";
import AppDimensionsController from "./components/AppDimensionsController";
import AppPreviewToggler from "./components/AppPreviewToggler";
import ComponentWrapper from "./components/ComponentWrapper";

export default class AppPreviewModule extends AbstractModule {
  static id = "app_preview";

  static dependencies = [
    Button,
    AppComponents,
    AppBehaviors,
    AppRenderer,
    ContextMenu,
    Clipboard,
    FormControls,
    History,
    Hotkey,
    MediaPlayer,
  ];

  constructor({ app }) {
    super(arguments);

    // Override the app_components' component-wrapper.
    const DefaultComponentWrapper = app.component("ComponentWrapper");
    delete app._context.components.ComponentWrapper;
    app.component("ComponentWrapper", ComponentWrapper);
    app.component("DefaultComponentWrapper", DefaultComponentWrapper);

    app.component("AppPreview", AppPreview);
    app.component("AppZoomController", AppZoomController);
    app.component("AppDimensionsController", AppDimensionsController);
    app.component("AppPreviewToggler", AppPreviewToggler);
  }

  get preview() {
    const store = useStore();
    const { preview } = storeToRefs(store);
    return readonly(preview);
  }

  get previewPersistant() {
    const store = useStore();
    const { previewPersistant } = storeToRefs(store);
    return readonly(previewPersistant);
  }

  get selectedComponents() {
    const store = useStore();
    const { getSelectedComponents } = storeToRefs(store);
    return getSelectedComponents;
  }

  isComponentSelected(component) {
    const store = useStore();
    return store.isComponentSelected(component);
  }

  isComponentLocked(component) {
    const store = useStore();
    return store.isComponentLocked(component);
  }

  lockComponent(component) {
    const store = useStore();
    return store.lockComponent(component);
  }

  lockComponents(components) {
    const store = useStore();
    return store.lockComponents(components);
  }

  unlockComponent(component) {
    const store = useStore();
    return store.unlockComponent(component);
  }

  unlockComponents(components) {
    const store = useStore();
    return store.unlockComponents(components);
  }

  isComponentFrozen(component) {
    const store = useStore();
    return store.isComponentFrozen(component);
  }

  freezeComponent(component) {
    const store = useStore();
    return store.freezeComponent(component);
  }

  unfreezeComponent(component) {
    const store = useStore();
    return store.unfreezeComponent(component);
  }

  componentHasSelectedDescendents(component) {
    const store = useStore();
    return store.componentHasSelectedDescendents(component);
  }

  selectComponent(component, append = false) {
    const store = useStore();
    return store.selectComponent(component, append);
  }

  deselectComponent(component) {
    const store = useStore();
    return store.deselectComponent(component);
  }

  copyComponents(components) {
    const store = useStore();
    store.copyComponents(components);
  }

  async cutComponents(components) {
    const store = useStore();
    return await store.cutComponents(components);
  }

  async pasteComponents(target) {
    const store = useStore();
    return await store.pasteComponents(target);
  }
}
