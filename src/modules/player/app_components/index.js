import Device from "../device";
import DomPurify from "../dom_purify";

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

import moduleStore from "./store";

export default {
  name: "AppComponents",
  dependencies: [Device, DomPurify],
  install({ app, store }) {
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
    app.component("SVGcomponent", SVGComponent);
    app.component("VideoRendererComponent", VideoRendererComponent);

    store.registerModule("app-components", moduleStore);
  },
};
