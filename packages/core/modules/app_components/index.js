import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import Device from "../device";
import EventBus from "../event_bus";
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

export const Events = {
  COMPONENT_GET: "component_get",
};

export default class AppComponentsModule extends AbstractModule {
  static id = "app_components";

  static dependencies = [Device, EventBus, MediaPlayer];

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

  init(data) {
    const store = useStore();
    store.init(data);
  }

  getModel(type) {
    const store = useStore();
    return store.getModel(type);
  }

  getComponent(type, id) {
    const store = useStore();
    return store.get(type, id);
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

  getComponentsByType(type) {
    const store = useStore();
    return store.getByType(type);
  }

  createComponent(data, validate = true) {
    const store = useStore();
    return store.create(data, validate);
  }

  addComponent(component, parent) {
    const store = useStore();
    return store.add(component, parent);
  }

  updateComponent(component, data) {
    const store = useStore();
    return store.update(component, data);
  }

  deleteComponent(component) {
    const store = useStore();
    return store.delete(component);
  }

  restoreComponent(component) {
    const store = useStore();
    return store.restore(component);
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

  onStoreAction(callback) {
    const store = useStore();
    store.$onAction(callback);
  }
}
