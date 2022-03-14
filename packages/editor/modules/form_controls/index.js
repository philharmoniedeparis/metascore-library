import StyledButton from "@metascore-library/core/modules/styled_button";
import FormGroup from "../form_group";
import TimecodeInput from "../timecode_input";

import BorderRadiusControl from "./components/BorderRadiusControl";
import CheckboxControl from "./components/CheckboxControl";
import ColorControl from "./components/ColorControl";
import FileControl from "./components/FileControl";
import HtmlControl from "./components/HtmlControl";
import ImageControl from "./components/ImageControl";
import NumberControl from "./components/NumberControl";
import SelectControl from "./components/SelectControl";
import TextControl from "./components/TextControl";
import TimeControl from "./components/TimeControl";
import UrlControl from "./components/UrlControl";

export default {
  name: "FormControls",
  dependencies: [StyledButton, FormGroup, TimecodeInput],
  install({ app }) {
    app.component("BorderRadiusControl", BorderRadiusControl);
    app.component("CheckboxControl", CheckboxControl);
    app.component("ColorControl", ColorControl);
    app.component("FileControl", FileControl);
    app.component("HtmlControl", HtmlControl);
    app.component("ImageControl", ImageControl);
    app.component("NumberControl", NumberControl);
    app.component("SelectControl", SelectControl);
    app.component("TextControl", TextControl);
    app.component("TimeControl", TimeControl);
    app.component("UrlControl", UrlControl);
  },
};
