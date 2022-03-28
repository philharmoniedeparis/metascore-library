import EventBus from "@metascore-library/core/modules/event_bus";
import FormGroup from "../form_group";
import Media from "@metascore-library/player/modules/media";
import PlayerPreview from "../player_preview";
import SchemaForm from "../schema_form";
import StyledButton from "@metascore-library/core/modules/styled_button";
import Tabs from "../tabs";

import AnimatedControl from "./components/AnimatedControl";
import CursorKeyframesControl from "./components/CursorKeyframesControl";
import ComponentForm from "./components/ComponentForm";

export default {
  id: "component_form",
  dependencies: [
    EventBus,
    FormGroup,
    Media,
    PlayerPreview,
    SchemaForm,
    StyledButton,
    Tabs,
  ],
  install({ app }) {
    app.component("AnimatedControl", AnimatedControl);
    app.component("CursorKeyframesControl", CursorKeyframesControl);
    app.component("ComponentForm", ComponentForm);
  },
};
