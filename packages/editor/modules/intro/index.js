import useStore from "./store";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import BaseButton from "@metascore-library/core/modules/button";
import ElementHighlighter from "../element_highlighter";
import DontShowAgain from "../dont_show_again";
import DotNavigation from "../dot_navigation";

import IntroTourWrapper from "./components/IntroTourWrapper.vue";

export default class TutorialModule extends AbstractModule {
  static id = "intro";

  static dependencies = [
    BaseButton,
    ElementHighlighter,
    DontShowAgain,
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
