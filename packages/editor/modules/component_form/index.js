import FormGroup from "../form_group";
import SchemaForm from "../schema_form";
import PlayerPreview from "../player_preview";
import Tabs from "../tabs";

import AnimatedControl from "./components/AnimatedControl";
import ArrayControl from "./components/ArrayControl";
import ComponentForm from "./components/ComponentForm";

export default {
  name: "ComponentForm",
  dependencies: [FormGroup, SchemaForm, PlayerPreview, Tabs],
  install({ app }) {
    app.component("AnimatedControl", AnimatedControl);
    app.component("ArrayControl", ArrayControl);
    app.component("ComponentForm", ComponentForm);
  },
};
