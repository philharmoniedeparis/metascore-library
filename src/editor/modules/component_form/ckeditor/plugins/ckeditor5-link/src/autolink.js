import { AutoLink } from "ckeditor5";

import CustomLinkEditing from "./linkediting";

export default class CustomAutoLink extends AutoLink {
  /**
   * @inheritDoc
   */
  static get requires() {
    return ["Delete", CustomLinkEditing];
  }
}
