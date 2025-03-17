import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@core/services/module-manager/AbstractModule";
import { addMessages } from "@core/services/i18n";
import useStore from "./store";
import * as IconManager from "./utils/icons";

import MediaPlayer from "../media_player";
import MediaCuepoints from "@core/modules/media_cuepoints";

import { getAnimatedValueAtTime } from "./utils/animation";

import AnimationComponent from "./components/AnimationComponent";
import BlockComponent from "./components/BlockComponent";
import BlockTogglerComponent from "./components/BlockTogglerComponent";
import ComponentIcon from "./components/ComponentIcon";
import ComponentWrapper from "./components/ComponentWrapper";
import ContentComponent from "./components/ContentComponent";
import ControllerComponent from "./components/ControllerComponent";
import CursorComponent from "./components/CursorComponent";
import ImageComponent from "./components/ImageComponent";
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

    app.component("AnimationComponent", AnimationComponent);
    app.component("BlockComponent", BlockComponent);
    app.component("BlockTogglerComponent", BlockTogglerComponent);
    app.component("ComponentIcon", ComponentIcon);
    app.component("ComponentWrapper", ComponentWrapper);
    app.component("ContentComponent", ContentComponent);
    app.component("ControllerComponent", ControllerComponent);
    app.component("CursorComponent", CursorComponent);
    app.component("ImageComponent", ImageComponent);
    app.component("MediaComponent", MediaComponent);
    app.component("PageComponent", PageComponent);
    app.component("ScenarioComponent", ScenarioComponent);
    app.component("SVGComponent", SVGComponent);
    app.component("VideoRendererComponent", VideoRendererComponent);

    addMessages({
      fr: {
        app_components: {
          labels: {
            untitled: "[sans titre]",
            Animation: "Animation {name}",
            Block: "Bloc {name}",
            BlockToggler: "Contrôleur de blocs {name}",
            Content: "Texte {name}",
            Controller: "Contrôleur {name}",
            Cursor: "Curseur {name}",
            Image: "Image {name}",
            Media: "Média {name}",
            Page: "Page {index}/{count}",
            Scenario: "Scénario {name}",
            SVG: "Image vectorielle {name}",
            VideoRenderer: "Rendu vidéo {name}",
          },
        },
      },
      en: {
        app_components: {
          labels: {
            untitled: "[untitled]",
            Animation: "Animation {name}",
            Block: "Block {name}",
            BlockToggler: "Block toggler {name}",
            Content: "Text {name}",
            Controller: "Controller {name}",
            Cursor: "Cursor {name}",
            Image: "Image {name}",
            Media: "Media {name}",
            Page: "Page {index}/{count}",
            Scenario: "Scenario {name}",
            SVG: "Vector image {name}",
            VideoRenderer: "Video renderer {name}",
          },
        },
      },
    });
  }

  get sortedScenarios() {
    const store = useStore();
    return store.getSortedScenarios();
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

  setScenarioIndex(scenario, index) {
    const store = useStore();
    return store.setScenarioIndex(scenario, index);
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

  getSortedScenarios() {
    const store = useStore();
    return store.getSortedScenarios();
  }

  getComponentParent(component) {
    const store = useStore();
    return store.getParent(component);
  }

  getComponentIndex(component) {
    const store = useStore();
    return store.getIndex(component);
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

  async arrangeComponent(component, action) {
    const store = useStore();
    return await store.arrange(component, action);
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
    return store.blocksActivePage.has(id) ? store.blocksActivePage.get(id) : 0;
  }

  setBlockActivePage(block, index) {
    const store = useStore();
    store.setBlockActivePage(block, index);
  }

  resetBlocksActivePage() {
    const store = useStore();
    store.resetBlocksActivePage();
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
    store.getOverrides(component, key);
  }

  clearOverrides(component, key) {
    const store = useStore();
    store.clearOverrides(component, key);
  }

  getAnimatedValueAtTime(values, time) {
    return getAnimatedValueAtTime(values, time);
  }

  onStoreAction(callback) {
    const store = useStore();
    return store.$onAction(callback);
  }
}
