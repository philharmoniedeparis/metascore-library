import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import { addMessages } from "@metascore-library/core/services/i18n";
import useStore from "./store";
import * as IconManager from "./utils/icons";

import MediaPlayer from "../media_player";
import MediaCuepoints from "@metascore-library/core/modules/media_cuepoints";

import AnimationComponent from "./components/AnimationComponent";
import BlockComponent from "./components/BlockComponent";
import BlockTogglerComponent from "./components/BlockTogglerComponent";
import ComponentIcon from "./components/ComponentIcon";
import ComponentWrapper from "./components/ComponentWrapper";
import ContentComponent from "./components/ContentComponent";
import ControllerComponent from "./components/ControllerComponent";
import CursorComponent from "./components/CursorComponent";
import MediaComponent from "./components/MediaComponent";
import PageComponent from "./components/PageComponent";
import ScenarioComponent from "./components/ScenarioComponent";
import SVGComponent from "./components/SVGComponent";
import VideoRendererComponent from "./components/VideoRendererComponent";

import { AUTO_HIGHLIGHT_CLASS, parse as parseLink } from "./utils/links";

export default class AppComponentsModule extends AbstractModule {
  static id = "app_components";

  static dependencies = [MediaPlayer, MediaCuepoints];

  constructor({ app }) {
    super(arguments);

    addMessages({
      fr: {
        "app_components.page_label": "Page {index}/{count}",
        "app_components.untitled": "[sans titre]",
      },
      en: {
        "app_components.page_label": "Page {index}/{count}",
        "app_components.untitled": "[untitled]",
      },
    });

    app.component("AnimationComponent", AnimationComponent);
    app.component("BlockComponent", BlockComponent);
    app.component("BlockTogglerComponent", BlockTogglerComponent);
    app.component("ComponentIcon", ComponentIcon);
    app.component("ComponentWrapper", ComponentWrapper);
    app.component("ContentComponent", ContentComponent);
    app.component("ControllerComponent", ControllerComponent);
    app.component("CursorComponent", CursorComponent);
    app.component("MediaComponent", MediaComponent);
    app.component("PageComponent", PageComponent);
    app.component("ScenarioComponent", ScenarioComponent);
    app.component("SVGComponent", SVGComponent);
    app.component("VideoRendererComponent", VideoRendererComponent);
  }

  get activeScenario() {
    const store = useStore();
    const { activeScenario } = storeToRefs(store);
    return readonly(activeScenario);
  }

  get data() {
    const store = useStore();
    return store.toJson();
  }

  get linksAutoHighlightClass() {
    return AUTO_HIGHLIGHT_CLASS;
  }

  async init(data) {
    const store = useStore();
    await store.init(data);
  }

  getModelByType(type) {
    const store = useStore();
    return store.getModelByType(type);
  }

  getModelByMime(mime) {
    const store = useStore();
    return store.getModelByMime(mime);
  }

  getComponents() {
    const store = useStore();
    return readonly(store.all);
  }

  getComponentsByType(type) {
    const store = useStore();
    return store.getByType(type);
  }

  getComponent(type, id) {
    const store = useStore();
    return store.get(type, id);
  }

  findComponent(filter) {
    const store = useStore();
    return store.find(filter);
  }

  getComponentParent(component) {
    const store = useStore();
    return store.getParent(component);
  }

  getComponentChildrenProperty(component) {
    const store = useStore();
    return store.getChildrenProperty(component);
  }

  componentHasChildren(component) {
    const store = useStore();
    return store.hasChildren(component);
  }

  getComponentChildren(component) {
    const store = useStore();
    return store.getChildren(component);
  }

  getComponentSiblings(component) {
    const store = useStore();
    return store.getSiblings(component);
  }

  async createComponent(data, validate = true) {
    const store = useStore();
    return await store.create(data, validate);
  }

  async addComponent(component, parent, index) {
    const store = useStore();
    return await store.add(component, parent, index);
  }

  async updateComponent(component, data) {
    const store = useStore();
    return await store.update(component, data);
  }

  async deleteComponent(component) {
    const store = useStore();
    return await store.delete(component);
  }

  async restoreComponent(component) {
    const store = useStore();
    return await store.restore(component);
  }

  async cloneComponent(component, data) {
    const store = useStore();
    return await store.clone(component, data);
  }

  /**
   * Get a component's label
   */
  getComponentLabel(component) {
    const store = useStore();
    return store.getLabel(component);
  }

  /**
   * Get a component's icon URL
   */
  getComponentIconURL(component) {
    return IconManager.getURL(component);
  }

  setActiveScenario(value) {
    const store = useStore();
    store.activeScenario = value;
  }

  getBlockActivePage(block) {
    const store = useStore();
    const { id } = block;
    return id in store.blocksActivePage ? store.blocksActivePage[id] : 0;
  }

  setBlockActivePage(block, index) {
    const store = useStore();
    store.setBlockActivePage(block, index);
  }

  isComponentBackgroundable(component) {
    const store = useStore();
    const model = store.getModelByType(component.type);
    return model.$isBackgroundable;
  }

  isComponentBorderable(component) {
    const store = useStore();
    const model = store.getModelByType(component.type);
    return model.$isBorderable;
  }

  isComponentHideable(component) {
    const store = useStore();
    const model = store.getModelByType(component.type);
    return model.$isHideable;
  }

  isComponentOpacitable(component) {
    const store = useStore();
    const model = store.getModelByType(component.type);
    return model.$isOpacitable;
  }

  isComponentPositionable(component) {
    const store = useStore();
    const model = store.getModelByType(component.type);
    return model.$isPositionable;
  }

  isComponentResizable(component) {
    const store = useStore();
    const model = store.getModelByType(component.type);
    return model.$isResizable;
  }

  isComponentTimeable(component) {
    const store = useStore();
    const model = store.getModelByType(component.type);
    if (model.$isTimeable) {
      if (component.type === "Page") {
        const block = store.getParent(component);
        return block && block.synched;
      }
      return true;
    }
    return false;
  }

  isComponentTransformable(component) {
    const store = useStore();
    const model = store.getModelByType(component.type);
    return model.$isisTransformable;
  }

  getLinkActions(href) {
    return parseLink(href);
  }

  enableOverrides() {
    const store = useStore();
    store.enableOverrides();
  }

  disableOverrides() {
    const store = useStore();
    store.disableOverrides();
  }

  hasOverrides(component, key) {
    const store = useStore();
    return store.hasOverrides(component, key);
  }

  setOverrides(component, key, values, priority) {
    const store = useStore();
    store.setOverrides(component, key, values, priority);
  }

  getOverrides(component, key) {
    const store = useStore();
    store.setOverrides(component, key);
  }

  clearOverrides(component, key) {
    const store = useStore();
    store.clearOverrides(component, key);
  }

  onStoreAction(callback) {
    const store = useStore();
    return store.$onAction(callback);
  }
}
