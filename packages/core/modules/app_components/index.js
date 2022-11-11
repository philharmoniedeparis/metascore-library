import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import Device from "../device";
import MediaPlayer from "../media_player";
import AnimationComponent from "./components/AnimationComponent";
import BlockComponent from "./components/BlockComponent";
import BlockTogglerComponent from "./components/BlockTogglerComponent";
import ComponentWrapper from "./components/ComponentWrapper";
import ContentComponent from "./components/ContentComponent";
import ControllerComponent from "./components/ControllerComponent";
import CursorComponent from "./components/CursorComponent";
import MediaComponent from "./components/MediaComponent";
import PageComponent from "./components/PageComponent";
import ScenarioComponent from "./components/ScenarioComponent";
import SVGComponent from "./components/SVGComponent";
import VideoRendererComponent from "./components/VideoRendererComponent";

export default class AppComponentsModule extends AbstractModule {
  static id = "app_components";

  static dependencies = [Device, MediaPlayer];

  constructor({ app }) {
    super(arguments);

    app.component("AnimationComponent", AnimationComponent);
    app.component("BlockComponent", BlockComponent);
    app.component("BlockTogglerComponent", BlockTogglerComponent);
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

  async init(data) {
    const store = useStore();
    store.init(data);
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
    return store.create(data, validate);
  }

  async addComponent(component, parent, index) {
    const store = useStore();
    return store.add(component, parent, index);
  }

  async updateComponent(component, data) {
    const store = useStore();
    return store.update(component, data);
  }

  async deleteComponent(component) {
    const store = useStore();
    return store.delete(component);
  }

  async restoreComponent(component) {
    const store = useStore();
    return store.restore(component);
  }

  async cloneComponent(component, data) {
    const store = useStore();
    return store.clone(component, data);
  }

  showComponent(component) {
    const store = useStore();
    store.show(component);
  }

  hideComponent(component) {
    const store = useStore();
    store.hide(component);
  }

  toggleComponent(component) {
    const store = useStore();
    store.toggle(component);
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

  onStoreAction(callback) {
    const store = useStore();
    return store.$onAction(callback);
  }
}
