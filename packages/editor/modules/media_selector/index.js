import FormGroup from "../form_group";
import ModalForm from "../modal_form";
import MediaSelector from "./components/MediaSelector";

export default {
  id: "media_selector",
  dependencies: [ModalForm, FormGroup],
  install({ app }) {
    app.component("MediaSelector", MediaSelector);
  },
};
