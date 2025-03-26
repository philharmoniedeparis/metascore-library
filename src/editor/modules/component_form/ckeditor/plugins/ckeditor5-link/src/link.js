import { Link } from "ckeditor5";

import CustomAutoLink from "./autolink";
import CustomLinkEditing from "./linkediting";
import CustomLinkUI from "./linkui";

export default class CustomLink extends Link {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [CustomLinkEditing, CustomLinkUI, CustomAutoLink];
  }
}
