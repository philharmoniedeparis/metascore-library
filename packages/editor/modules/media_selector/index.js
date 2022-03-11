import FormGroup from "@metascore-library/core/modules/form_group";
import FocusDirective from "@metascore-library/core/modules/focus_directive";
import ModalForm from "../modal_form";
import MediaSelector from "./components/MediaSelector";

export default {
  name: "MediaSelector",
  dependencies: [ModalForm, FormGroup, FocusDirective],
  install({ app }) {
    app.component("MediaSelector", MediaSelector);
  },
};
