import useStore from "./store";
import AbstractModule from "@core/services/module-manager/AbstractModule";
import Ajax from "@core/modules/ajax";
import BaseButton from "@core/modules/button";
import FormControls from "../form_controls";
import ElementHighlighter from "../element_highlighter";
import DotNavigation from "../dot_navigation";

import IntroTourWrapper from "./components/IntroTourWrapper.vue";

export default class TutorialModule extends AbstractModule {
  static id = "intro";

  static dependencies = [
    Ajax,
    BaseButton,
    FormControls,
    ElementHighlighter,
    DotNavigation,
  ];

  constructor({ app }) {
    super(arguments);

    app.component("IntroTour", IntroTourWrapper);
  }

  configure(configs) {
    useStore().configure(configs);
  }
}
