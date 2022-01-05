import DomPurify from "../dom_purify";

import ComponentWrapper from "./components/ComponentWrapper";
import AnimationComponent from "./components/AnimationComponent";
import ContentComponent from "./components/ContentComponent";
import ControllerComponent from "./components/ControllerComponent";
import CursorComponent from "./components/CursorComponent";
import MediaComponent from "./components/MediaComponent";
import SVGComponent from "./components/SVGComponent";
import VideoRendererComponent from "./components/VideoRendererComponent";
import PageComponent from "./components/PageComponent";
import BlockComponent from "./components/BlockComponent";
import BlockTogglerComponent from "./components/BlockTogglerComponent";
import ScenarioComponent from "./components/ScenarioComponent";

import moduleStore from "./store";

export default {
  name: "Components",
  dependencies: [DomPurify],
  install({ app, store }) {
    app.component("ComponentWrapper", ComponentWrapper);
    app.component("AnimationComponent", AnimationComponent);
    app.component("BlockComponent", BlockComponent);
    app.component("BlockTogglerComponent", BlockTogglerComponent);
    app.component("ContentComponent", ContentComponent);
    app.component("ControllerComponent", ControllerComponent);
    app.component("CursorComponent", CursorComponent);
    app.component("MediaComponent", MediaComponent);
    app.component("PageComponent", PageComponent);
    app.component("ScenarioComponent", ScenarioComponent);
    app.component("SVGcomponent", SVGComponent);
    app.component("VideoRendererComponent", VideoRendererComponent);

    const database = store.$db();
    store.registerModule("components", moduleStore({ database }));
  },
};
