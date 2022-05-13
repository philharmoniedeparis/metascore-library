import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import AppComponents from "@metascore-library/core/modules/app_components";
import AppRenderer from "@metascore-library/core/modules/app_renderer";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import Clipboard from "../clipboard";
import FormControls from "../form_controls";
import History from "../history";

import AppPreview from "./components/AppPreview";
import AppZoomController from "./components/AppZoomController";
import AppDimensionsController from "./components/AppDimensionsController";
import AppPreviewToggler from "./components/AppPreviewToggler";
import ComponentWrapper from "./components/ComponentWrapper";

export default class AppPreviewModule extends AbstractModule {
  static id = "app_preview";

  static dependencies = [
    AppComponents,
    AppRenderer,
    ContextMenu,
    Clipboard,
    FormControls,
    History,
  ];

  constructor({ app }) {
    super(arguments);

    // Override the app_components' component-wrapper.
    const DefaultComponentWrapper = app.component("ComponentWrapper");
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

  get iframe() {
    const store = useStore();
    const { iframe } = storeToRefs(store);
    return readonly(iframe);
  }

  get selectedComponents() {
    const store = useStore();
    const { getSelectedComponents } = storeToRefs(store);
    return getSelectedComponents;
  }

  getComponentElement(component) {
    const store = useStore();
    return store.getComponentElement(component);
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

  unlockComponent(component) {
    const store = useStore();
    return store.unlockComponent(component);
  }

  componentHasSelectedDescendents(component) {
    const store = useStore();
    return store.componentHasSelectedDescendents(component);
  }

  selectComponent(component) {
    const store = useStore();
    return store.selectComponent(component);
  }

  deselectComponent(component) {
    const store = useStore();
    return store.deselectComponent(component);
  }
}
