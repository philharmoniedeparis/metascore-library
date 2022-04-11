import FormGroup from "../form_group";
import ModalForm from "../modal_form";
import StyledButton from "@metascore-library/core/modules/styled_button";
import MediaSelector from "./components/MediaSelector";

export default {
  id: "media_selector",
  dependencies: [ModalForm, FormGroup, StyledButton],
  install({ app }) {
    app.component("MediaSelector", MediaSelector);
  },
};
