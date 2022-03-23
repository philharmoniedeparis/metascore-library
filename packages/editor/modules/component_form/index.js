import FormGroup from "../form_group";
import PlayerPreview from "../player_preview";
import SchemaForm from "../schema_form";
import StyledButton from "@metascore-library/core/modules/styled_button";
import Tabs from "../tabs";

import AnimatedControl from "./components/AnimatedControl";
import CursorKeyframesControl from "./components/CursorKeyframesControl";
import ComponentForm from "./components/ComponentForm";

export default {
  id: "component_form",
  async dependencies() {
    const { default: Media } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "@metascore-library/player/modules/media"
    );

    return [FormGroup, Media, PlayerPreview, SchemaForm, StyledButton, Tabs];
  },
  async install({ app }) {
    const { default: CursorKeyframesEditor } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "./components/CursorKeyframesEditor"
    );

    app.component("AnimatedControl", AnimatedControl);
    app.component("CursorKeyframesControl", CursorKeyframesControl);
    app.component("CursorKeyframesEditor", CursorKeyframesEditor);
    app.component("ComponentForm", ComponentForm);
  },
};
