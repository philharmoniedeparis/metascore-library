import StyledButton from "@metascore-library/core/modules/styled_button";
import FormGroup from "../form_group";
import TimecodeInput from "../timecode_input";

import CheckboxControl from "./components/CheckboxControl";
import BorderRadiusControl from "./components/BorderRadiusControl";
import ColorControl from "./components/ColorControl";
import SelectControl from "./components/SelectControl";
import HtmlControl from "./components/HtmlControl";
import ImageControl from "./components/ImageControl";
import NumberControl from "./components/NumberControl";
import StringControl from "./components/StringControl";
import TimeControl from "./components/TimeControl";

export default {
  name: "FormControls",
  dependencies: [StyledButton, FormGroup, TimecodeInput],
  install({ app }) {
    app.component("CheckboxControl", CheckboxControl);
    app.component("BorderRadiusControl", BorderRadiusControl);
    app.component("ColorControl", ColorControl);
    app.component("SelectControl", SelectControl);
    app.component("HtmlControl", HtmlControl);
    app.component("ImageControl", ImageControl);
    app.component("NumberControl", NumberControl);
    app.component("StringControl", StringControl);
    app.component("TimeControl", TimeControl);
  },
};
