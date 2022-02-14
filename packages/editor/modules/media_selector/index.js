import Modal from "@metascore-library/core/modules/modal";
import FormGroup from "@metascore-library/core/modules/form_group";
import FocusDirective from "@metascore-library/core/modules/focus_directive";
import MediaSelector from "./components/MediaSelector";

export default {
  name: "MediaSelector",
  dependencies: [Modal, FormGroup, FocusDirective],
  install({ app }) {
    app.component("MediaSelector", MediaSelector);
  },
};
