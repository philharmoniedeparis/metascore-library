import useStore from "./store";
import AppPreview from "../app_preview";
import EventBus from "@metascore-library/core/modules/event_bus";
import FormGroup from "../form_group";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import SchemaForm from "../schema_form";
import StyledButton from "@metascore-library/core/modules/styled_button";
import Tabs from "../tabs";

import AnimatedControl from "./components/AnimatedControl";
import BorderRadiusControl from "./components/BorderRadiusControl";
import CursorKeyframesControl from "./components/CursorKeyframesControl";
import ComponentForm from "./components/ComponentForm";

export default {
  id: "component_form",
  dependencies: [
    AppPreview,
    EventBus,
    FormGroup,
    MediaPlayer,
    SchemaForm,
    StyledButton,
    Tabs,
  ],
  install({ app }) {
    app.component("AnimatedControl", AnimatedControl);
    app.component("BorderRadiusControl", BorderRadiusControl);
    app.component("CursorKeyframesControl", CursorKeyframesControl);
    app.component("ComponentForm", ComponentForm);

    return {
      configure: (configs) => {
        useStore().configure(configs);
      },
    };
  },
};
