import StyledButton from "@metascore-library/core/modules/styled_button";
import FormGroup from "@metascore-library/core/modules/form_group";
import TimecodeInput from "../timecode_input";

import BooleanControl from "./components/BooleanControl";
import BorderRadiusControl from "./components/BorderRadiusControl";
import ColorControl from "./components/ColorControl";
import EnumControl from "./components/EnumControl";
import HtmlControl from "./components/HtmlControl";
import ImageControl from "./components/ImageControl";
import NumberControl from "./components/NumberControl";
import StringControl from "./components/StringControl";
import TimeControl from "./components/TimeControl";

export default {
  name: "FormControls",
  dependencies: [StyledButton, FormGroup, TimecodeInput],
  install({ app }) {
    app.component("BooleanControl", BooleanControl);
    app.component("BorderRadiusControl", BorderRadiusControl);
    app.component("ColorControl", ColorControl);
    app.component("EnumControl", EnumControl);
    app.component("HtmlControl", HtmlControl);
    app.component("ImageControl", ImageControl);
    app.component("NumberControl", NumberControl);
    app.component("StringControl", StringControl);
    app.component("TimeControl", TimeControl);
  },
};
