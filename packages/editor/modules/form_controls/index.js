import AutoFocus from "@metascore-library/core/modules/auto_focus";
import StyledButton from "@metascore-library/core/modules/styled_button";
import FormGroup from "../form_group";
import TimecodeInput from "../timecode_input";

import CheckboxControl from "./components/CheckboxControl";
import ColorControl from "./components/ColorControl";
import FileControl from "./components/FileControl";
import NumberControl from "./components/NumberControl";
import SelectControl from "./components/SelectControl";
import TextControl from "./components/TextControl";
import TimeControl from "./components/TimeControl";
import UrlControl from "./components/UrlControl";

export default {
  id: "form_controls",
  dependencies: [AutoFocus, StyledButton, FormGroup, TimecodeInput],
  install({ app }) {
    app.component("CheckboxControl", CheckboxControl);
    app.component("ColorControl", ColorControl);
    app.component("FileControl", FileControl);
    app.component("NumberControl", NumberControl);
    app.component("SelectControl", SelectControl);
    app.component("TextControl", TextControl);
    app.component("TimeControl", TimeControl);
    app.component("UrlControl", UrlControl);
  },
};
